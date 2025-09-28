import log from 'book';
import Koa from 'koa';
import tldjs from 'tldjs';
import Debug from 'debug';
import http from 'http';
import { hri } from 'human-readable-ids';
import Router from 'koa-router';

import ClientManager from './lib/ClientManager.js';

const debug = Debug('localtunnel:server');

export default function(opt) {
    opt = opt || {};

    const validHosts = (opt.domain) ? [opt.domain] : undefined;
    const myTldjs = tldjs.fromUserSettings({ validHosts });
    const landingPage = opt.landing || 'https://localtunnel.github.io/www/';

    function GetClientIdFromHostname(hostname) {
        return myTldjs.getSubdomain(hostname);
    }

    const manager = new ClientManager(opt);

    const schema = opt.secure ? 'https' : 'http';

    const app = new Koa();
    const router = new Router();

    // Health check and API middleware - must be first to avoid conflicts
    app.use(async (ctx, next) => {
        // Health check endpoint
        if (ctx.path === '/health') {
            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            
            ctx.body = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            };
            return;
        }
        
        // API status endpoint
        if (ctx.path === '/api/status') {
            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            
            const stats = manager.stats;
            ctx.body = {
                tunnels: stats.tunnels,
                mem: process.memoryUsage(),
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            };
            return;
        }
        
        // API tunnels endpoint
        if (ctx.path === '/api/tunnels') {
            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            
            const clients = manager.clients;
            const tunnels = [];
            
            for (const clientId in clients) {
                const client = clients[clientId];
                if (client) {
                    const stats = client.stats();
                    tunnels.push({
                        id: clientId,
                        url: `${schema}://${clientId}.${ctx.request.host}`,
                        connected_sockets: stats.connectedSockets,
                        created_at: client.created_at || new Date().toISOString()
                    });
                }
            }
            
            ctx.body = tunnels;
            return;
        }
        
        await next();
    });

    // CORS middleware for all other requests
    app.use(async (ctx, next) => {
        // Set CORS headers for all requests
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        
        // Handle preflight requests
        if (ctx.method === 'OPTIONS') {
            ctx.status = 200;
            ctx.body = '';
            return;
        }
        
        await next();
    });

    // Health check endpoint (router version as backup)
    router.get('/health', async (ctx, next) => {
        ctx.body = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
    });

    router.get('/api/status', async (ctx, next) => {
        // Set CORS headers
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        
        const stats = manager.stats;
        ctx.body = {
            tunnels: stats.tunnels,
            mem: process.memoryUsage(),
        };
    });

    // Get all active tunnels
    router.get('/api/tunnels', async (ctx, next) => {
        // Set CORS headers
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        
        const clients = manager.clients;
        const tunnels = [];
        
        for (const clientId in clients) {
            const client = clients[clientId];
            if (client) {
                const stats = client.stats();
                tunnels.push({
                    id: clientId,
                    url: `${schema}://${clientId}.${ctx.request.host}`,
                    connected_sockets: stats.connectedSockets,
                    created_at: client.created_at || new Date().toISOString()
                });
            }
        }
        
        ctx.body = tunnels;
    });

    router.get('/api/tunnels/:id/status', async (ctx, next) => {
        const clientId = ctx.params.id;
        const client = manager.getClient(clientId);
        if (!client) {
            ctx.throw(404);
            return;
        }

        const stats = client.stats();
        ctx.body = {
            connected_sockets: stats.connectedSockets,
        };
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    // root endpoint
    app.use(async (ctx, next) => {
        const path = ctx.request.path;

        // skip anything not on the root path
        if (path !== '/') {
            await next();
            return;
        }

        const isNewClientRequest = ctx.query['new'] !== undefined;
        if (isNewClientRequest) {
            const reqId = hri.random();
            debug('making new client with id %s', reqId);
            const info = await manager.newClient(reqId);

            const url = schema + '://' + info.id + '.' + ctx.request.host;
            info.url = url;
            ctx.body = info;
            return;
        }

        // no new client request, send to landing page
        ctx.redirect(landingPage);
    });

    // anything after the / path is a request for a specific client name
    // This is a backwards compat feature
    app.use(async (ctx, next) => {
        const parts = ctx.request.path.split('/');

        // any request with several layers of paths is not allowed
        // rejects /foo/bar
        // allow /foo
        if (parts.length !== 2) {
            await next();
            return;
        }

        const reqId = parts[1];

        // Skip API routes and health check
        if (reqId === 'api' || reqId === 'health') {
            await next();
            return;
        }

        // limit requested hostnames to 63 characters
        if (! /^(?:[a-z0-9][a-z0-9\-]{4,63}[a-z0-9]|[a-z0-9]{4,63})$/.test(reqId)) {
            const msg = 'Invalid subdomain. Subdomains must be lowercase and between 4 and 63 alphanumeric characters.';
            ctx.status = 403;
            ctx.body = {
                message: msg,
            };
            return;
        }

        debug('making new client with id %s', reqId);
        const info = await manager.newClient(reqId);

        const url = schema + '://' + info.id + '.' + ctx.request.host;
        info.url = url;
        ctx.body = info;
        return;
    });

    const server = http.createServer();

    const appCallback = app.callback();

    server.on('request', (req, res) => {
        // without a hostname, we won't know who the request is for
        const hostname = req.headers.host;
        if (!hostname) {
            res.statusCode = 400;
            res.end('Host header is required');
            return;
        }

        const clientId = GetClientIdFromHostname(hostname);
        if (!clientId) {
            appCallback(req, res);
            return;
        }

        const client = manager.getClient(clientId);
        if (!client) {
            res.statusCode = 404;
            res.end('404');
            return;
        }

        client.handleRequest(req, res);
    });

    server.on('upgrade', (req, socket, head) => {
        const hostname = req.headers.host;
        if (!hostname) {
            socket.destroy();
            return;
        }

        const clientId = GetClientIdFromHostname(hostname);
        if (!clientId) {
            socket.destroy();
            return;
        }

        const client = manager.getClient(clientId);
        if (!client) {
            socket.destroy();
            return;
        }

        client.handleUpgrade(req, socket);
    });

    return server;
};
