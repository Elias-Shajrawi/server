// start-server.js - Windows-compatible server starter
const path = require('path');
const fs = require('fs');

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

// Try to start the server using different methods
async function startServer() {
    try {
        // Method 1: Try to use the ESM server with require (bypass esm module)
        console.log('Attempting to start server...');
        
        // Load the main server module directly
        const serverPath = path.join(__dirname, 'server.js');
        
        if (!fs.existsSync(serverPath)) {
            throw new Error(`Server file not found: ${serverPath}`);
        }
        
        // Set environment variables
        process.env.PORT = config.port.toString();
        process.env.ADDRESS = config.address;
        if (config.domain) process.env.DOMAIN = config.domain;
        if (config.secure) process.env.SECURE = 'true';
        process.env.MAX_SOCKETS = config.maxSockets.toString();
        
        console.log(`Starting server on ${config.address}:${config.port}`);
        
        // Try different loading methods
        let server;
        
        try {
            // Method 1: Try with ESM loader
            const esmLoader = require('esm')(module);
            server = esmLoader('./server.js');
            console.log('✅ Server loaded with ESM');
        } catch (esmError) {
            console.log('⚠️  ESM loading failed, trying alternative methods...');
            
            try {
                // Method 2: Try direct require (if server.js is CommonJS compatible)
                server = require('./server.js');
                console.log('✅ Server loaded with require');
            } catch (requireError) {
                console.log('⚠️  Direct require failed, trying Babel...');
                
                try {
                    // Method 3: Try with Babel
                    require('@babel/register')({
                        presets: ['@babel/preset-env']
                    });
                    server = require('./server.js');
                    console.log('✅ Server loaded with Babel');
                } catch (babelError) {
                    console.error('❌ All loading methods failed:');
                    console.error('ESM Error:', esmError.message);
                    console.error('Require Error:', requireError.message);
                    console.error('Babel Error:', babelError.message);
                    
                    // Method 4: Fallback - spawn child process
                    console.log('🔄 Trying child process fallback...');
                    const { spawn } = require('child_process');
                    
                    const nodeArgs = ['--experimental-modules', '--es-module-specifier-resolution=node'];
                    const serverArgs = ['./bin/server', '--port', config.port.toString()];
                    
                    const child = spawn('node', [...nodeArgs, ...serverArgs], {
                        stdio: 'inherit',
                        cwd: __dirname
                    });
                    
                    child.on('error', (error) => {
                        console.error('❌ Child process failed:', error);
                        process.exit(1);
                    });
                    
                    child.on('exit', (code) => {
                        console.log(`Server process exited with code ${code}`);
                        process.exit(code);
                    });
                    
                    // Handle graceful shutdown
                    process.on('SIGINT', () => {
                        console.log('\n🛑 Shutting down server...');
                        child.kill('SIGINT');
                    });
                    
                    process.on('SIGTERM', () => {
                        console.log('\n🛑 Shutting down server...');
                        child.kill('SIGTERM');
                    });
                    
                    return;
                }
            }
        }
        
        // If we get here, the server was loaded successfully
        console.log('🚀 LocalTunnel Server started successfully!');
        console.log(`📡 Server running at http://${config.address}:${config.port}`);
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down server...');
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down server...');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        console.error('Stack trace:', error.stack);
        
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure all dependencies are installed: npm install');
        console.log('2. Try installing Babel: npm run install:babel');
        console.log('3. Check Node.js version: node --version (recommended: 16+)');
        console.log('4. Try running with experimental flags: npm run start:experimental');
        
        process.exit(1);
    }
}

// Start the server
startServer().catch(error => {
    console.error('❌ Startup failed:', error);
    process.exit(1);
});
