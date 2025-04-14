export const environment = {
  production: true,
  apiUrl: 'https://your-api-url.railway.app/api',
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
    redirectUri: process.env.TIKTOK_REDIRECT_URI || 'https://your-app-url.railway.app/tiktok/callback',
    scope: 'user.info.basic,video.publish'
  },
  videoApis: {
    geminiVeo: {
      apiUrl: 'https://ai.google.dev/gemini-api',
      apiKey: process.env.GEMINI_API_KEY || ''
    },
    pixVerse: {
      apiUrl: 'https://api.pixverse.ai/v3.5',
      apiKey: process.env.PIXVERSE_API_KEY || ''
    },
    lumalabs: {
      apiUrl: 'https://api.lumalabs.ai',
      apiKey: process.env.LUMALABS_API_KEY || ''
    },
    kling: {
      apiUrl: 'https://api.fal.ai/kling-video/v1.6',
      apiKey: process.env.KLING_API_KEY || ''
    },
    hunyuan: {
      apiUrl: 'https://api.hunyuan.tencent.com',
      apiKey: process.env.HUNYUAN_API_KEY || ''
    }
  },
  cloudStorage: {
    googleDrive: {
      apiKey: process.env.GOOGLE_DRIVE_API_KEY || '',
      clientId: process.env.GOOGLE_DRIVE_CLIENT_ID || ''
    },
    box: {
      clientId: process.env.BOX_CLIENT_ID || '',
      clientSecret: process.env.BOX_CLIENT_SECRET || ''
    }
  },
  ffmpeg: {
    path: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg'
  }
};
