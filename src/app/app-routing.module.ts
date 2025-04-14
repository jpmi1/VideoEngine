import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'import',
    component: SpreadsheetImportComponent
  },
  {
    path: 'generate',
    component: VideoGenerationComponent
  },
  {
    path: 'player',
    component: VideoPlayerComponent
  },
  {
    path: 'storage',
    component: CloudStorageComponent
  },
  {
    path: 'tiktok/auth',
    component: TikTokAuthComponent
  },
  {
    path: 'tiktok/post',
    component: TikTokPostComponent
  },
  {
    path: 'tiktok/status',
    component: TikTokStatusComponent
  },
  {
    path: 'tiktok/analytics',
    component: TikTokAnalyticsComponent
  },
  {
    path: 'api-config',
    component: ApiConfigurationComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// Import components for direct reference in routes
import { DashboardComponent } from './dashboard/dashboard.component';
import { SpreadsheetImportComponent } from './spreadsheet-import/spreadsheet-import.component';
import { VideoGenerationComponent } from './video-generation/video-generation.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { CloudStorageComponent } from './cloud-storage/cloud-storage.component';
import { TikTokAuthComponent } from './tiktok-auth/tiktok-auth.component';
import { TikTokPostComponent } from './tiktok-post/tiktok-post.component';
import { TikTokStatusComponent } from './tiktok-status/tiktok-status.component';
import { TikTokAnalyticsComponent } from './tiktok-analytics/tiktok-analytics.component';
import { ApiConfigurationComponent } from './api-configuration/api-configuration.component';
