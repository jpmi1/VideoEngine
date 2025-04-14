# Bulk AI Video Creation Web App - User Guide

## Introduction

Welcome to the Bulk AI Video Creation Web App! This application allows you to generate multiple AI videos at once using data from spreadsheets. With integrations for multiple AI video generation services and cloud storage providers, you can streamline your video creation workflow.

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Spreadsheet software (Microsoft Excel, Google Sheets, etc.)

### Accessing the Application

The application can be accessed at: [https://your-app-url.com](https://your-app-url.com)

## Setting Up

### 1. Configure API Keys

Before creating videos, you need to set up API keys for at least one video generation service:

1. Navigate to **API Configuration** from the main menu
2. Enter your API key for one or more of the supported services:
   - Gemini Veo 2
   - PixVerse V3.5
   - Lumalabs DreamMachine
   - Kling V1.6
   - Hunyuan
3. Click **Save** for each API key you enter
4. Optionally, click **Test** to verify your API key works correctly

### 2. Connect Cloud Storage (Optional)

To save your generated videos to cloud storage:

1. Navigate to **Cloud Storage** from the main menu
2. Click **Connect to Google Drive** or **Connect to Box**
3. Follow the authentication prompts
4. Select a default folder for storing your videos

## Creating Videos

### 1. Prepare Your Spreadsheet

Your spreadsheet should include the following columns:

- **name**: The title of your video
- **length**: Duration in seconds or MM:SS format (e.g., "0:45" for 45 seconds)
- **script**: The text content/script for your video
- **style**: The visual style for your video (e.g., "modern", "vintage", "minimalist")

Optional columns:
- **music**: Background music style
- **voice**: Voice style for narration
- **aspect_ratio**: Video dimensions (e.g., "16:9", "9:16", "1:1")

You can download a template by clicking **Download Template** on the Spreadsheet Import page.

### 2. Import Your Spreadsheet

1. Navigate to **Create New Project** from the dashboard
2. Click **Choose File** and select your spreadsheet
3. Review the validation results
4. Adjust processing options if needed:
   - Add captions
   - Add background music
   - Extend video segments
5. Click **Continue**

### 3. Configure Project Settings

1. Enter a **Project Name** and **Description**
2. Select which video generation API to use
3. Click **Start Processing**

### 4. Monitor Progress

The application will:
1. Process each video specification from your spreadsheet
2. Generate videos using the selected AI service
3. Apply post-processing with FFMPEG if selected
4. Display progress for each video and overall project

## Managing Videos

### Viewing Videos

1. Navigate to the **Dashboard** to see recent projects
2. Click on a project to view all videos in that project
3. Click on a video to open the video player

### Video Player Features

- Play/pause controls
- Download video
- Share video (generates shareable link)
- Export to cloud storage (Google Drive or Box)
- View video details and script

## Advanced Features

### Bulk Processing Options

When importing your spreadsheet, you can configure these options:

- **Add Captions**: Automatically add captions based on the script
- **Add Background Music**: Add royalty-free background music
- **Extend Video Segments**: Adjust timing to ensure minimum segment length

### Cloud Integration

- **Google Drive**: Store and organize videos in your Google Drive
- **Box**: Store and organize videos in your Box account

## Troubleshooting

### Common Issues

1. **Spreadsheet Import Errors**
   - Ensure your spreadsheet has all required columns
   - Check for empty cells in required fields
   - Verify the length format is correct (seconds or MM:SS)

2. **Video Generation Failures**
   - Verify your API key is correct and active
   - Check if you've exceeded API usage limits
   - Ensure your script is within the character limits for the selected API

3. **Cloud Storage Issues**
   - Re-authenticate if your connection has expired
   - Check your internet connection
   - Verify you have sufficient storage space

## Support

For additional help, contact support at: support@bulkaivideoapp.com

## Privacy and Data Security

- Your API keys are stored securely and never shared
- Your spreadsheet data is processed locally and not stored permanently
- Generated videos are stored temporarily unless exported to cloud storage
- Cloud storage connections use OAuth for secure authentication
