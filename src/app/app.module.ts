import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
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
import { VideoPreviewComponent } from './video-preview/video-preview.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SpreadsheetImportComponent,
    VideoGenerationComponent,
    VideoPlayerComponent,
    CloudStorageComponent,
    TikTokAuthComponent,
    TikTokPostComponent,
    TikTokStatusComponent,
    TikTokAnalyticsComponent,
    ApiConfigurationComponent,
    VideoPreviewComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
