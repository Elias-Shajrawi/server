# LocalTunnel Customer Management Dashboard

## 🎉 Setup Complete!

Your LocalTunnel Customer Management Dashboard is now running in Docker alongside your LocalTunnel server.

## 🌐 Access URLs

- **LocalTunnel Server**: `http://localhost:3000`
- **Customer Dashboard**: `http://localhost:8080`

## 📋 What's Been Created

### 1. Customer Management Dashboard
A complete React-based web application for managing LocalTunnel customers with:

#### Features:
- ✅ **Customer CRUD Operations**: Add, edit, delete customers
- ✅ **Subdomain Management**: Automatic and manual subdomain assignment
- ✅ **Connection Commands**: Generate ready-to-use `lt` commands for customers
- ✅ **Tunnel Status Monitoring**: Real-time online/offline status
- ✅ **Local Data Storage**: Browser localStorage (no backend required)
- ✅ **Search & Filtering**: Find customers by name, email, or subdomain
- ✅ **Data Export/Import**: Backup and restore customer data
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile

#### Customer Data Structure:
```json
{
  "id": "unique-id",
  "name": "Customer Name",
  "email": "customer@example.com",
  "subdomain": "customer-subdomain",
  "token": "tk_generated-token",
  "notes": "Optional notes",
  "createdAt": "2025-09-28T10:00:00.000Z",
  "isOnline": false,
  "lastSeen": null
}
```

### 2. Docker Setup
- **Multi-stage Docker build** with Node.js 20 and Nginx
- **Docker Compose** configuration for both services
- **Internal networking** between containers
- **Health checks** and proper restart policies

### 3. Generated Connection Commands
For each customer, the dashboard generates commands like:
```bash
lt --host https://tunnel.mycompany.com --subdomain customer1 --port 3000 --header "X-Tunnel-Token=xxxx"
```

## 🚀 How to Use

### Adding a Customer
1. Open the dashboard at `http://localhost:8080`
2. Click "Add Customer" button
3. Fill in customer details:
   - Name (required)
   - Email (required)
   - Subdomain (auto-generated or custom)
   - Notes (optional)
4. Click "Add Customer"

### Managing Customers
- **View Details**: Click on any customer in the list
- **Edit Customer**: Use the "Edit" button in customer details
- **Delete Customer**: Use the "Delete Customer" button (with confirmation)
- **Copy Commands**: Use copy buttons for subdomains, URLs, and connection commands

### Monitoring Tunnels
- **Status Indicators**: Green (online) / Red (offline) status badges
- **Real-time Updates**: Status refreshes automatically every 30 seconds
- **Manual Refresh**: Use the "Refresh" button for immediate updates

### Data Management
- **Export Data**: Settings tab → "Export Data" (downloads JSON file)
- **Clear Data**: Settings tab → "Clear All Data" (with confirmation)
- **Server Configuration**: Adjust server host domain in settings

## 🔧 Configuration

### Environment Variables
The dashboard uses these environment variables (set in docker-compose.yml):
- `VITE_TUNNEL_SERVER_URL=http://localtunnel-server:80`
- `VITE_DEFAULT_SERVER_HOST=tunnel.mycompany.com`

### Customizing Server Host
1. Open the dashboard
2. Go to Settings tab
3. Update "Server Host Domain" field
4. This affects generated URLs and commands

## 🐳 Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# Dashboard logs
docker logs customer-dashboard

# LocalTunnel server logs
docker logs localtunnel-server
```

### Rebuild Dashboard
```bash
docker-compose build customer-dashboard
docker-compose up -d customer-dashboard
```

## 📁 Project Structure

```
localtunnel_server/
├── client_app/                    # Customer Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomerDashboard.jsx    # Main dashboard
│   │   │   ├── CustomerList.jsx         # Customer list view
│   │   │   ├── CustomerDetails.jsx      # Customer details panel
│   │   │   ├── AddCustomerModal.jsx     # Add customer form
│   │   │   └── ServerStatus.jsx         # Server status component
│   │   ├── services/
│   │   │   ├── customerStorage.js       # Local storage service
│   │   │   └── tunnelApi.js             # API service
│   │   └── App.jsx                      # Root component
│   ├── Dockerfile                       # Multi-stage build
│   ├── nginx.conf                       # Nginx configuration
│   └── package.json                     # Dependencies
├── docker-compose.yml                   # Docker services
├── server.js                           # LocalTunnel server
└── Dockerfile                          # LocalTunnel server image
```

## 🔒 Security Notes

- **No Authentication**: Currently no auth system (as requested)
- **Local Storage**: Customer data stored in browser only
- **Token Generation**: Secure random tokens for each customer
- **CORS**: Configure your LocalTunnel server for cross-origin requests if needed

## 🔄 Integration with LocalTunnel Server

The dashboard is designed to work with your existing LocalTunnel server. For full integration:

1. **Status Monitoring**: Implement health check endpoint on your server
2. **Active Connections**: Add API endpoint to list active tunnels
3. **Tunnel Management**: Add endpoints to disconnect specific tunnels

### Suggested API Endpoints (Optional)
```
GET  /api/health          # Server health check
GET  /api/tunnels         # List active tunnels
GET  /api/tunnels/:id     # Get tunnel details
DELETE /api/tunnels/:id   # Disconnect tunnel
```

## 🎯 Customer Workflow

1. **Admin adds customer** in dashboard
2. **Dashboard generates** unique subdomain and token
3. **Admin shares connection command** with customer
4. **Customer runs command** in their project:
   ```bash
   lt --host https://tunnel.mycompany.com --subdomain customer1 --port 3000 --header "X-Tunnel-Token=xxxx"
   ```
5. **Dashboard shows tunnel status** (online/offline)
6. **Customer accesses** their app via `https://customer1.tunnel.mycompany.com`

## 🛠️ Troubleshooting

### Dashboard Not Loading
- Check container status: `docker ps`
- Check logs: `docker logs customer-dashboard`
- Verify port 8080 is not in use

### Server Connection Issues
- Ensure LocalTunnel server is running on port 3000
- Check Docker network connectivity
- Verify container names in docker-compose.yml

### Data Loss
- Customer data is stored in browser localStorage
- Export data regularly for backup
- Data persists per browser/device

## 🚀 Production Deployment

For production use:
1. **Change server host** in settings to your actual domain
2. **Set up SSL/HTTPS** for both services
3. **Configure proper networking** and firewall rules
4. **Add authentication** if needed
5. **Set up monitoring** and logging
6. **Regular data backups** (export customer data)

---

Your LocalTunnel Customer Management Dashboard is ready to use! 🎉
