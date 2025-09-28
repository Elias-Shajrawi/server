// start-server.js - Windows-compatible server starter
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting LocalTunnel Server (Windows Compatible)...');

// Configuration
const config = {
    port: 3000,
    address: '0.0.0.0',
    secure: false,
    domain: undefined,
    maxSockets: 10
};

// Parse command line arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--port':
            config.port = parseInt(args[++i]);
            break;
        case '--address':
            config.address = args[++i];
            break;
        case '--secure':
            config.secure = true;
            break;
        case '--domain':
            config.domain = args[++i];
            break;
        case '--max-sockets':
            config.maxSockets = parseInt(args[++i]);
            break;
        case '--help':
            console.log(`
LocalTunnel Server

Usage: node start-server.js [options]

Options:
  --port <number>        Port to listen on (default: 3000)
  --address <string>     IP address to bind to (default: 0.0.0.0)
  --secure              Use HTTPS
  --domain <string>      Base domain name
  --max-sockets <number> Maximum TCP sockets per client (default: 10)
  --help                Show this help message
            `);
            process.exit(0);
    }
}

console.log('Configuration:', config);

// Start the server using the original bin/server with proper Node.js flags
async function startServer() {
    try {
        console.log('🚀 Starting LocalTunnel server...');
        
        // Build command arguments
        const serverArgs = [
            '--port', config.port.toString(),
            '--address', config.address,
            '--max-sockets', config.maxSockets.toString()
        ];
        
        if (config.secure) {
            serverArgs.push('--secure');
        }
        
        if (config.domain) {
            serverArgs.push('--domain', config.domain);
        }
        
        console.log(`📡 Server will run on ${config.address}:${config.port}`);
        
        // Try different Node.js execution methods
        const methods = [
            // Method 1: Use esm loader (original method)
            {
                name: 'ESM Loader',
                args: ['-r', 'esm', './bin/server', ...serverArgs]
            },
            // Method 2: Use experimental modules
            {
                name: 'Experimental Modules',
                args: ['--experimental-modules', '--es-module-specifier-resolution=node', './bin/server', ...serverArgs]
            },
            // Method 3: Use loader with import maps
            {
                name: 'Import Resolution',
                args: ['--loader', './node_modules/esm/esm.js', './bin/server', ...serverArgs]
            }
        ];
        
        for (const method of methods) {
            console.log(`\n🔄 Trying ${method.name}...`);
            
            try {
                const child = spawn('node', method.args, {
                    stdio: 'inherit',
                    cwd: __dirname,
                    env: {
                        ...process.env,
                        NODE_ENV: process.env.NODE_ENV || 'development'
                    }
                });
                
                // Wait a bit to see if the process starts successfully
                await new Promise((resolve, reject) => {
                    let resolved = false;
                    
                    const timeout = setTimeout(() => {
                        if (!resolved) {
                            resolved = true;
                            console.log(`✅ ${method.name} started successfully!`);
                            resolve();
                        }
                    }, 3000);
                    
                    child.on('error', (error) => {
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeout);
                            reject(error);
                        }
                    });
                    
                    child.on('exit', (code) => {
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeout);
                            if (code !== 0) {
                                reject(new Error(`Process exited with code ${code}`));
                            } else {
                                resolve();
                            }
                        }
                    });
                });
                
                // If we get here, the server started successfully
                console.log(`🎉 LocalTunnel Server is running with ${method.name}!`);
                console.log(`📡 Access your server at: http://${config.address}:${config.port}`);
                console.log(`🔗 Health check: http://${config.address}:${config.port}/health`);
                console.log(`📊 Status API: http://${config.address}:${config.port}/api/status`);
                
                // Handle graceful shutdown
                process.on('SIGINT', () => {
                    console.log('\n🛑 Shutting down server...');
                    child.kill('SIGINT');
                    process.exit(0);
                });
                
                process.on('SIGTERM', () => {
                    console.log('\n🛑 Shutting down server...');
                    child.kill('SIGTERM');
                    process.exit(0);
                });
                
                // Keep the process alive
                child.on('exit', (code) => {
                    console.log(`Server process exited with code ${code}`);
                    process.exit(code);
                });
                
                return; // Success, exit the method loop
                
            } catch (error) {
                console.log(`❌ ${method.name} failed: ${error.message}`);
                continue; // Try next method
            }
        }
        
        // If all methods failed
        throw new Error('All startup methods failed');
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure all dependencies are installed: npm install');
        console.log('2. Check Node.js version: node --version (recommended: 16+)');
        console.log('3. Try installing ESM: npm install esm');
        console.log('4. Try running directly: node -r esm ./bin/server --port 3000');
        console.log('5. Check if port is already in use: lsof -i :3000');
        
        process.exit(1);
    }
}

// Start the server
startServer().catch(error => {
    console.error('❌ Startup failed:', error);
    process.exit(1);
});
