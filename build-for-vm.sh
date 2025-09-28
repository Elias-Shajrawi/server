#!/bin/bash

# Build script for VM deployment
# Usage: ./build-for-vm.sh YOUR_VM_IP YOUR_REGISTRY_URL

VM_IP=${1:-"13.81.220.67"}  # Replace with your VM IP
REGISTRY=${2:-"roklerd"}  # Docker Hub username

echo "Building images for VM deployment..."
echo "VM IP: $VM_IP"
echo "Registry: $REGISTRY"

# Build LocalTunnel Server
echo "Building LocalTunnel Server..."
docker build -t $REGISTRY/localtunnel-server:latest .

# Build Customer Dashboard with VM IP
echo "Building Customer Dashboard with IP: $VM_IP"
cd client_app
docker build \
  --build-arg VITE_TUNNEL_SERVER_URL=http://localtunnel-server:80 \
  --build-arg VITE_DEFAULT_SERVER_HOST=$VM_IP \
  -t $REGISTRY/customer-dashboard:latest .

cd ..

echo "Pushing images to registry..."
docker push $REGISTRY/localtunnel-server:latest
docker push $REGISTRY/customer-dashboard:latest

echo "Done! Images pushed to registry."
echo ""
echo "On your VM, run:"
echo "docker pull $REGISTRY/localtunnel-server:latest"
echo "docker pull $REGISTRY/customer-dashboard:latest"
echo "docker-compose -f docker-compose.vm.yml up -d"
