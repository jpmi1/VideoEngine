# Bulk AI Video Creation Web App - Deployment Guide

## Prerequisites

Before deploying the application, ensure you have the following:

1. **Node.js and npm**: Version 16.x or higher
2. **Ionic CLI**: Install globally using `npm install -g @ionic/cli`
3. **Angular CLI**: Install globally using `npm install -g @angular/cli`
4. **API Keys**: Obtain API keys for the video generation services you plan to use

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/bulk-ai-video-creator.git
   cd bulk-ai-video-creator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   ionic serve
   ```
   This will start a development server at `http://localhost:8100/`

## Building for Production

### Web Deployment

1. **Build the application**:
   ```bash
   ionic build --prod
   ```
   This will generate production-ready files in the `www` folder.

2. **Deploy to a web server**:
   You can deploy the contents of the `www` folder to any static web hosting service like:
   - Firebase Hosting
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages

### Mobile Deployment

#### Android

1. **Add Android platform**:
   ```bash
   ionic capacitor add android
   ```

2. **Build the application**:
   ```bash
   ionic capacitor build android --prod
   ```
   This will open Android Studio with your project.

3. **Generate APK or AAB file**:
   - In Android Studio, go to Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Or for Play Store: Build > Generate Signed Bundle / APK

#### iOS

1. **Add iOS platform**:
   ```bash
   ionic capacitor add ios
   ```

2. **Build the application**:
   ```bash
   ionic capacitor build ios --prod
   ```
   This will open Xcode with your project.

3. **Archive and distribute**:
   - In Xcode, select Product > Archive
   - Follow the distribution steps for App Store or Ad Hoc distribution

## Environment Configuration

The application uses environment files for configuration. Update the following files as needed:

- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

Example configuration:
```typescript
export const environment = {
  production: true,
  apiEndpoints: {
    geminiVeo2: 'https://api.example.com/gemini',
    pixverseV35: 'https://api.example.com/pixverse',
    // Add other API endpoints
  },
  cloudStorage: {
    googleDriveApiKey: 'YOUR_GOOGLE_DRIVE_API_KEY',
    boxApiKey: 'YOUR_BOX_API_KEY'
  }
};
```

## Security Considerations

1. **API Keys**: Never store API keys directly in the code. Use environment variables or a secure backend service.

2. **Authentication**: Implement proper authentication for users accessing the application.

3. **CORS**: Ensure your backend services have proper CORS configuration to allow requests from your application.

4. **Data Encryption**: Encrypt sensitive data both in transit and at rest.

## Performance Optimization

1. **Lazy Loading**: The application uses Angular's lazy loading for routes to improve initial load time.

2. **Image Optimization**: Optimize images and videos before displaying them.

3. **Caching**: Implement caching strategies for API responses and assets.

4. **Service Workers**: Consider adding service workers for offline functionality and improved performance.

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Verify API keys are correct
   - Check network connectivity
   - Ensure API endpoints are accessible

2. **Build Errors**:
   - Clear cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

3. **Mobile Deployment Issues**:
   - Update Capacitor: `npm install @capacitor/core @capacitor/cli`
   - Sync changes: `ionic capacitor sync`

## Support and Resources

- Ionic Framework Documentation: https://ionicframework.com/docs
- Angular Documentation: https://angular.io/docs
- Capacitor Documentation: https://capacitorjs.com/docs
