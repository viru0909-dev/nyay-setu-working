# Frontend Dockerfile - Serve pre-built React app with Nginx
FROM nginx:alpine

# Copy pre-built dist files
COPY dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
