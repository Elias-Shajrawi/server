# Multi-stage build for React app
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Accept build arguments
ARG VITE_TUNNEL_SERVER_URL=http://localhost:3000
ARG VITE_DEFAULT_SERVER_HOST=YOUR_IP_ADDRESS

# Set environment variables for build
ENV VITE_TUNNEL_SERVER_URL=$VITE_TUNNEL_SERVER_URL
ENV VITE_DEFAULT_SERVER_HOST=$VITE_DEFAULT_SERVER_HOST

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
