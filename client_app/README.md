# LocalTunnel Customer Management Dashboard

A modern React dashboard for managing customers and their tunnel subdomains for your LocalTunnel server. This frontend-only solution stores customer data locally and communicates directly with your LocalTunnel server.

## Features

### 👥 Customer Management
- **Add Customers**: Create new customer profiles with name, email, and notes
- **Subdomain Assignment**: Automatically or manually assign unique subdomains
- **Customer List**: View, search, and filter all customers
- **Customer Details**: Edit customer information and view tunnel status

### 🌐 Tunnel Management
- **Connection Commands**: Generate ready-to-use LocalTunnel commands for customers
- **Tunnel Status**: Real-time monitoring of online/offline tunnel status
- **URL Generation**: Automatic tunnel URL creation for each customer
- **Token Management**: Secure token generation and management

### 🔧 Local Data Storage
- **Browser Storage**: All customer data stored locally in browser localStorage
- **Data Export**: Export customer data as JSON for backup
- **Data Import**: Import customer data from JSON files
- **No Backend Required**: Pure frontend solution with no server dependencies

### 📊 Dashboard Features
- **Search & Filter**: Find customers by name, email, or subdomain
- **Status Monitoring**: Visual indicators for tunnel online/offline status
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Automatic dark mode based on system preferences

## Technology Stack

- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful SVG icons
- **Axios** - HTTP client for API calls

## Getting Started

### Prerequisites
- Node.js 16+ installed
- LocalTunnel server running (Docker container)

### Installation

1. Navigate to the client app directory:
   \`\`\`bash
   cd client_app
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open your browser and navigate to the displayed URL (typically `http://localhost:5173`)

### Production Build

To build for production:

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist` directory.

## API Integration

The dashboard communicates with your LocalTunnel server through REST APIs. The server is expected to be running on `http://localhost:3000`.

### Required API Endpoints

For full functionality, your LocalTunnel server should implement these endpoints:

- `GET /health` - Server health check
- `GET /stats` - Server statistics
- `GET /connections` - Active connections list
- `GET /logs` - Server logs
- `DELETE /connections/:id` - Disconnect client
- `POST /docker/start` - Start server container
- `POST /docker/stop` - Stop server container
- `POST /docker/restart` - Restart server container

## Configuration

### Environment Variables

Create a `.env` file in the client_app directory:

\`\`\`env
VITE_API_BASE_URL=http://localhost:3000
VITE_REFRESH_INTERVAL=5000
\`\`\`

### Customization

- **Colors**: Modify `tailwind.config.js` for custom color schemes
- **API URLs**: Update `src/services/api.js` for different server endpoints
- **Refresh Intervals**: Adjust polling intervals in component files

## Development

### Project Structure

\`\`\`
client_app/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── ServerStatus.jsx       # Server status display
│   │   ├── ServerControls.jsx     # Server control buttons
│   │   ├── ConnectionManager.jsx  # Connection management
│   │   └── ServerLogs.jsx         # Log viewer
│   ├── services/
│   │   └── api.js                 # API service functions
│   ├── App.jsx                    # Root component
│   └── main.jsx                   # Application entry point
├── public/                        # Static assets
└── package.json                   # Dependencies and scripts
\`\`\`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Real-time Updates
The dashboard automatically refreshes server status every 5 seconds and provides manual refresh options for immediate updates.

### Responsive Design
Fully responsive design that works on desktop, tablet, and mobile devices.

### Dark Mode Support
Automatic dark mode based on system preferences with manual toggle option.

### Error Handling
Comprehensive error handling with user-friendly error messages and retry mechanisms.

## Troubleshooting

### Common Issues

1. **Server Connection Failed**
   - Ensure LocalTunnel server is running on port 3000
   - Check if Docker container is active: `docker ps`
   - Verify network connectivity

2. **Dashboard Not Loading**
   - Clear browser cache
   - Check browser console for errors
   - Ensure all dependencies are installed

3. **API Endpoints Not Working**
   - Verify server implements required endpoints
   - Check CORS configuration on server
   - Review server logs for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the LocalTunnel server and follows the same license terms.