#!/bin/bash

# LocalTunnel Development Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    print_success "Node.js $(node --version) is installed"
}

# Install dependencies
install_deps() {
    print_status "Installing server dependencies..."
    npm install
    
    print_status "Installing dashboard dependencies..."
    cd client_app && npm install && cd ..
    
    print_success "All dependencies installed"
}

# Start server only
start_server() {
    print_status "Starting LocalTunnel server on port 3000..."
    npm run dev
}

# Start dashboard only
start_dashboard() {
    print_status "Starting customer dashboard..."
    cd client_app && npm run dev
}

# Start both services
start_both() {
    print_status "Starting both server and dashboard..."
    
    # Check if concurrently is installed
    if ! npm list concurrently &> /dev/null; then
        print_warning "Installing concurrently for running both services..."
        npm install --save-dev concurrently
    fi
    
    # Start both services
    npx concurrently \
        --names "SERVER,DASHBOARD" \
        --prefix-colors "blue,green" \
        "npm run dev" \
        "cd client_app && npm run dev"
}

# Build dashboard for production
build_dashboard() {
    print_status "Building dashboard for production..."
    cd client_app && npm run build
    print_success "Dashboard built successfully in client_app/dist/"
}

# Health check
health_check() {
    print_status "Checking server health..."
    if curl -f http://localhost:3000/health &> /dev/null; then
        print_success "Server is running and healthy"
    else
        print_error "Server is not running or not healthy"
    fi
}

# Show usage
show_usage() {
    echo "LocalTunnel Development Helper"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install     Install all dependencies"
    echo "  server      Start only the LocalTunnel server"
    echo "  dashboard   Start only the customer dashboard"
    echo "  dev         Start both server and dashboard (default)"
    echo "  build       Build dashboard for production"
    echo "  health      Check server health"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install    # Install dependencies"
    echo "  $0 dev        # Start development environment"
    echo "  $0 server     # Start only server"
    echo "  $0 dashboard  # Start only dashboard"
    echo ""
}

# Main script logic
main() {
    check_node
    
    case "${1:-dev}" in
        "install")
            install_deps
            ;;
        "server")
            start_server
            ;;
        "dashboard")
            start_dashboard
            ;;
        "dev"|"")
            start_both
            ;;
        "build")
            build_dashboard
            ;;
        "health")
            health_check
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
