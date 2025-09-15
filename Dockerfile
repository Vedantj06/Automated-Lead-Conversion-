# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_AUTH_ENDPOINT
ARG VITE_LEADS_ENDPOINT
ARG VITE_CAMPAIGNS_ENDPOINT
ARG VITE_EMAIL_ENDPOINT
ARG VITE_SEARCH_ENDPOINT
ARG VITE_WEB_READER_ENDPOINT
ARG VITE_APP_NAME
ARG VITE_APP_VERSION

# Set environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_ENDPOINT=$VITE_AUTH_ENDPOINT
ENV VITE_LEADS_ENDPOINT=$VITE_LEADS_ENDPOINT
ENV VITE_CAMPAIGNS_ENDPOINT=$VITE_CAMPAIGNS_ENDPOINT
ENV VITE_EMAIL_ENDPOINT=$VITE_EMAIL_ENDPOINT
ENV VITE_SEARCH_ENDPOINT=$VITE_SEARCH_ENDPOINT
ENV VITE_WEB_READER_ENDPOINT=$VITE_WEB_READER_ENDPOINT
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk --no-cache add curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]