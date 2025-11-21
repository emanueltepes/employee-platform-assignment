# Dockerfile for Frontend (Node-based)

FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port (dynamic from Render)
EXPOSE 3000

# Use sh to evaluate environment variable for dynamic port
CMD sh -c "npm run preview -- --host 0.0.0.0 --port ${PORT:-3000}"
