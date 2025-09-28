# LocalTunnel Server with Customer Dashboard

A complete LocalTunnel server solution with a modern React-based customer management dashboard.

## 🚀 Features

### LocalTunnel Server
- **Custom Domain Support**: Run your own localtunnel server with custom domains
- **REST API**: Full API for tunnel management and status monitoring
- **Docker Ready**: Containerized for easy deployment
- **Health Monitoring**: Built-in health checks and status endpoints

### Customer Dashboard
- **Modern React UI**: Built with React, Vite, and Tailwind CSS
- **Customer Management**: Add, edit, and manage tunnel customers
- **Subdomain Assignment**: Assign custom subdomains to customers
- **Connection Commands**: Auto-generate localtunnel connection commands
- **Real-time Status**: Monitor tunnel status (online/offline)
- **Responsive Design**: Works on desktop and mobile devices

## 📦 Quick Start with Docker

### Option 1: Use Pre-built Images from Docker Hub

```bash
# Create deployment directory
mkdir localtunnel-deployment
cd localtunnel-deployment

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  localtunnel-server:
    image: roklerd/localtunnel-server:latest
    container_name: localtunnel-server
    ports:
      - "3000:80"
    networks:
      - tunnel-network
    restart: unless-stopped

  customer-dashboard:
    image: roklerd/customer-dashboard:latest
    container_name: customer-dashboard
    ports:
      - "8080:80"
    networks:
      - tunnel-network
    depends_on:
      - localtunnel-server
    restart: unless-stopped
    environment:
      - NODE_ENV=production

networks:
  tunnel-network:
    driver: bridge
EOF

# Start the services
docker-compose up -d
```

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/localtunnel-server.git
cd localtunnel-server

# Build and start with docker-compose
docker-compose up -d --build
```

## 🌐 Access Your Services

- **Customer Dashboard**: http://YOUR_SERVER_IP:8080
- **LocalTunnel Server**: http://YOUR_SERVER_IP:3000
- **Health Check**: http://YOUR_SERVER_IP:3000/health

## 🔧 Configuration

### Environment Variables

The customer dashboard can be configured with the following environment variables:

- `VITE_TUNNEL_SERVER_URL`: URL of the LocalTunnel server (default: http://localtunnel-server:80)
- `VITE_DEFAULT_SERVER_HOST`: Default server host domain (default: YOUR_IP_ADDRESS)

### Building with Custom Configuration

```bash
# Build dashboard with your server IP
cd client_app
docker build \
  --build-arg VITE_TUNNEL_SERVER_URL=http://localtunnel-server:80 \
  --build-arg VITE_DEFAULT_SERVER_HOST=YOUR_SERVER_IP \
  -t your-registry/customer-dashboard:latest .
```

## 📱 Using the Customer Dashboard

1. **Add Customers**: Click "Add Customer" to create new tunnel users
2. **Assign Subdomains**: Each customer gets a unique subdomain
3. **Generate Commands**: Copy the generated `lt` command for customers
4. **Monitor Status**: See which tunnels are currently online

### Example Generated Command
```bash
lt --host https://YOUR_SERVER_IP --subdomain customer1 --port 3000 --header "X-Tunnel-Token=abc123"
```

## 🛠 Development

### LocalTunnel Server
```bash
npm install
npm start
```

### Customer Dashboard
```bash
cd client_app
npm install
npm run dev
```

## 📋 API Endpoints

- `GET /health` - Server health check
- `GET /api/status` - Server statistics
- `GET /api/tunnels` - List active tunnels
- `POST /api/tunnels` - Create new tunnel

## 🐳 Docker Images

Pre-built Docker images are available on Docker Hub:
- `roklerd/localtunnel-server:latest`
- `roklerd/customer-dashboard:latest`

## 🔒 Security Notes

- The dashboard currently has no authentication (suitable for internal use)
- Customer data is stored in browser localStorage
- For production use, consider adding authentication and a proper database

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Original LocalTunnel Server**: This project is based on the original localtunnel-server by defunctzombie.