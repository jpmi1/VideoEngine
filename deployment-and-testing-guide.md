# Deployment and Testing Guide for Bulk AI Video Creation App with TikTok Integration

This guide provides step-by-step instructions for deploying and testing the application on Railway.app.

## Prerequisites

1. Your existing Railway.app account
2. Railway CLI installed on your local machine
3. TikTok Developer account with API credentials
4. Git installed on your local machine

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=production
PORT=3000
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=https://your-app-url.railway.app/tiktok/callback
API_URL=https://your-api-url.railway.app
FFMPEG_PATH=/usr/bin/ffmpeg
```

### 4. Login to Railway CLI

```bash
railway login
```

This will open a browser window for authentication with your Railway.app account.

### 5. Initialize Railway Project

```bash
railway init
```

Follow the prompts to create a new project or select an existing one.

### 6. Set Environment Variables in Railway

```bash
railway variables set TIKTOK_CLIENT_KEY=your_client_key
railway variables set TIKTOK_CLIENT_SECRET=your_client_secret
railway variables set TIKTOK_REDIRECT_URI=https://your-app-url.railway.app/tiktok/callback
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set FFMPEG_PATH=/usr/bin/ffmpeg
```

### 7. Deploy the Application

```bash
railway up
```

This command will build and deploy your application to Railway.app.

### 8. Monitor Deployment

```bash
railway status
```

This will show the current status of your deployment.

### 9. Open the Deployed Application

```bash
railway open
```

This will open your deployed application in a browser.

## Testing the Application

### 1. Testing TikTok Authentication

1. Navigate to the TikTok Integration page in your application
2. Click "Connect with TikTok"
3. You should be redirected to TikTok's authorization page
4. Authorize the application
5. You should be redirected back to your application and see your TikTok profile information

### 2. Testing Video Generation

1. Navigate to the Dashboard
2. Create a new project
3. Import a spreadsheet with video specifications
4. Verify that the spreadsheet data is correctly parsed and displayed
5. Start the video generation process
6. Monitor the progress of video generation

### 3. Testing TikTok Posting

1. Navigate to the TikTok Post page
2. Select a generated video
3. Add a caption, hashtags, and other details
4. Click "Post to TikTok"
5. Verify that the video is successfully posted to TikTok
6. Check the post status in the TikTok Status page

### 4. Testing Analytics

1. Navigate to the TikTok Analytics page
2. Verify that post statistics are displayed correctly
3. Test different time period filters
4. Check that charts and graphs are rendering properly

## Troubleshooting

### Common Issues and Solutions

1. **Deployment Fails**
   - Check Railway logs: `railway logs`
   - Verify that all required environment variables are set
   - Ensure that the package.json has the correct scripts

2. **TikTok Authentication Fails**
   - Verify TikTok API credentials
   - Check that the redirect URI is correctly configured in both the TikTok Developer Portal and your application
   - Ensure that your TikTok app has the required permissions

3. **Video Generation Issues**
   - Check that FFMPEG is properly installed and configured
   - Verify that the video generation service has the necessary permissions
   - Check for errors in the video generation logs

4. **TikTok Posting Fails**
   - Verify that the user has authorized the correct permissions
   - Check that the video meets TikTok's requirements (format, size, duration)
   - Ensure that the access token is valid and not expired

## Monitoring and Maintenance

### Monitoring Application Performance

1. Use Railway's built-in monitoring tools:
   ```bash
   railway status
   railway logs
   ```

2. Set up alerts for critical errors or performance issues

### Updating the Application

1. Make changes to your local codebase
2. Test changes locally
3. Commit and push changes to your repository
4. Deploy the updated application:
   ```bash
   railway up
   ```

## Security Considerations

1. Keep your TikTok API credentials secure
2. Regularly rotate access tokens
3. Use HTTPS for all communications
4. Implement proper error handling and logging
5. Regularly update dependencies to patch security vulnerabilities

## Conclusion

Your Bulk AI Video Creation App with TikTok integration is now deployed and ready for use. If you encounter any issues or have questions, refer to the troubleshooting section or contact support.
