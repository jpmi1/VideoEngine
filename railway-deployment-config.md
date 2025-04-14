# Railway.app Deployment Configuration

This file contains the necessary configuration for deploying the Bulk AI Video Creation web app with TikTok integration to Railway.app.

## railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "npm run start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Environment Variables

The following environment variables need to be configured in Railway.app:

```
NODE_ENV=production
PORT=3000
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=https://your-app-url.railway.app/tiktok/callback
API_URL=https://your-api-url.railway.app
FFMPEG_PATH=/usr/bin/ffmpeg
```

## Dockerfile

```dockerfile
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/www /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## nginx.conf

```
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Force all paths to load either itself or index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Disable caching for service worker
    location = /service-worker.js {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }
}
```

## package.json Scripts

Add these scripts to your package.json:

```json
"scripts": {
  "build": "ionic build --prod",
  "start": "node server.js",
  "deploy": "railway up"
}
```

## server.js (for API endpoints)

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'www' directory
app.use(express.static('www'));

// API routes
app.get('/api/deployment/status', (req, res) => {
  res.json({ status: 'active', version: '1.0.0' });
});

app.post('/api/deployment/prepare', (req, res) => {
  res.json({ success: true, message: 'Deployment preparation completed' });
});

// TikTok callback route
app.get('/tiktok/callback', (req, res) => {
  // This route will be handled by the Angular app
  res.sendFile('index.html', { root: 'www' });
});

// Catch all routes and return the index file
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'www' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## .railwayignore

```
node_modules
.git
.github
.vscode
e2e
src
```

## Deployment Steps

1. Install Railway CLI:
   ```
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```
   railway login
   ```

3. Initialize Railway project:
   ```
   railway init
   ```

4. Set environment variables:
   ```
   railway variables set TIKTOK_CLIENT_KEY=your_client_key
   railway variables set TIKTOK_CLIENT_SECRET=your_client_secret
   railway variables set TIKTOK_REDIRECT_URI=https://your-app-url.railway.app/tiktok/callback
   railway variables set NODE_ENV=production
   ```

5. Deploy the application:
   ```
   railway up
   ```

6. Open the deployed application:
   ```
   railway open
   ```
