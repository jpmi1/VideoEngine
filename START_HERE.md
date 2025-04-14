# Bulk AI Video Creation Web App - Getting Started

Welcome to the Bulk AI Video Creation Web App! This document will help you navigate through the project files and get started with the application.

## Project Overview

This web app allows you to generate multiple AI videos at once using data from spreadsheets. It integrates with multiple AI video generation APIs and cloud storage providers to streamline your video creation workflow.

## Key Documentation Files

Start by reviewing these documentation files to understand the project:

1. **[Web App Architecture](/home/ubuntu/web_app_architecture.md)**: Detailed system design with frontend and backend components.
2. **[UI Mockups](/home/ubuntu/ui_mockups.md)**: Visual representation of all major screens and components.
3. **[User Guide](/home/ubuntu/user-guide.md)**: Instructions for end users on how to use the application.
4. **[Deployment Guide](/home/ubuntu/deployment-guide.md)**: Step-by-step instructions for deploying the application.
5. **[Testing Plan](/home/ubuntu/testing-plan.md)**: Comprehensive plan for testing all aspects of the application.
6. **[TikTok Integration Roadmap](/home/ubuntu/tiktok-integration-roadmap.md)**: Future enhancement plan for TikTok integration.

## Core Components

The application consists of these main components:

1. **Spreadsheet Import**: 
   - [spreadsheet-import.component.ts](/home/ubuntu/spreadsheet-import.component.ts)
   - [spreadsheet-import.component.html](/home/ubuntu/spreadsheet-import.component.html)
   - [spreadsheet-import.component.scss](/home/ubuntu/spreadsheet-import.component.scss)
   - [spreadsheet-import.service.ts](/home/ubuntu/spreadsheet-import.service.ts)

2. **Video Generation**:
   - [video-generation.component.ts](/home/ubuntu/video-generation.component.ts)
   - [video-generation.component.html](/home/ubuntu/video-generation.component.html)
   - [video-generation.component.scss](/home/ubuntu/video-generation.component.scss)
   - [video-generation.service.ts](/home/ubuntu/video-generation.service.ts)

3. **Cloud Storage**:
   - [cloud-storage.component.ts](/home/ubuntu/cloud-storage.component.ts)
   - [cloud-storage.component.html](/home/ubuntu/cloud-storage.component.html)
   - [cloud-storage.component.scss](/home/ubuntu/cloud-storage.component.scss)
   - [cloud-storage.service.ts](/home/ubuntu/cloud-storage.service.ts)

4. **Video Player**:
   - [video-player.component.ts](/home/ubuntu/video-player.component.ts)
   - [video-player.component.html](/home/ubuntu/video-player.component.html)
   - [video-player.component.scss](/home/ubuntu/video-player.component.scss)

5. **API Configuration**:
   - [api-configuration.component.ts](/home/ubuntu/api-configuration.component.ts)
   - [api-configuration.component.html](/home/ubuntu/api-configuration.component.html)
   - [api-configuration.component.scss](/home/ubuntu/api-configuration.component.scss)

6. **App Core**:
   - [app.component.ts](/home/ubuntu/app.component.ts)
   - [app.component.html](/home/ubuntu/app.component.html)
   - [app.component.scss](/home/ubuntu/app.component.scss)
   - [app.module.ts](/home/ubuntu/app.module.ts)
   - [app-routing.module.ts](/home/ubuntu/app-routing.module.ts)

## Getting Started

### Setting Up Development Environment

1. Install Node.js and npm (if not already installed)
2. Install Ionic CLI: `npm install -g @ionic/cli`
3. Create a new Ionic Angular project: `ionic start bulk-ai-video-creator blank --type=angular`
4. Navigate to the project directory: `cd bulk-ai-video-creator`
5. Copy all the component files from this project into your new project's `src/app` directory
6. Install required dependencies:
   ```bash
   npm install xlsx @capacitor/core @capacitor/cli @ionic/angular
   ```
7. Start the development server: `ionic serve`

### Project Structure

The application follows a modular structure:

- **Components**: UI elements with their own logic, templates, and styles
- **Services**: Business logic and data management
- **Models**: Data structures and interfaces
- **Routing**: Navigation between different parts of the application

### Key Features

1. **Spreadsheet Import**: Upload and validate spreadsheets with video specifications
2. **Video Generation**: Generate videos using multiple AI services
3. **Cloud Storage**: Connect to Google Drive and Box for storing videos
4. **Video Player**: Preview and manage generated videos
5. **API Configuration**: Manage API keys for different video generation services

## Next Steps

1. Review the [Deployment Guide](/home/ubuntu/deployment-guide.md) for detailed instructions on deploying the application
2. Set up the required API keys for video generation services
3. Deploy to your preferred hosting platform (web or mobile)
4. Consider implementing the TikTok integration as outlined in the [TikTok Integration Roadmap](/home/ubuntu/tiktok-integration-roadmap.md)

## Support

If you have any questions or need assistance, please refer to the documentation files or contact the development team.

Happy video creating!
