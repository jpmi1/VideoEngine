import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoGenerationService } from './video-generation.service';
import { SpreadsheetImportService, VideoSpecification } from './spreadsheet-import.service';
import { ProjectService } from './project.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-video-generation',
  templateUrl: './video-generation.component.html',
  styleUrls: ['./video-generation.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class VideoGenerationComponent implements OnInit {
  videoSpecifications: VideoSpecification[] = [];
  selectedApiProvider: string = 'gemini-veo-2';
  availableProviders: string[] = [];
  projectName: string = '';
  projectDescription: string = '';
  overallProgress: number = 0;
  isProcessing: boolean = false;
  
  constructor(
    private videoGenerationService: VideoGenerationService,
    private spreadsheetService: SpreadsheetImportService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    // Get available API providers
    this.videoGenerationService.getAvailableProviders().subscribe(providers => {
      this.availableProviders = providers;
    });
    
    // Get video specifications from spreadsheet service
    this.videoSpecifications = this.spreadsheetService.getVideoSpecifications();
  }

  /**
   * Start processing all videos
   */
  startProcessing() {
    if (this.videoSpecifications.length === 0) return;
    
    this.isProcessing = true;
    this.overallProgress = 0;
    
    // Create a new project
    this.projectService.createProject(
      this.projectName,
      this.projectDescription,
      this.selectedApiProvider,
      this.videoSpecifications
    ).subscribe(project => {
      console.log('Project created:', project);
      
      // Process each video
      this.processNextVideo(0);
    });
  }

  /**
   * Process the next video in the queue
   */
  processNextVideo(index: number) {
    if (index >= this.videoSpecifications.length) {
      // All videos processed
      this.isProcessing = false;
      this.overallProgress = 100;
      return;
    }
    
    const spec = this.videoSpecifications[index];
    
    // Update status to processing
    this.updateVideoStatus(spec.id!, 'processing', 0);
    
    // Generate video
    this.videoGenerationService.generateVideo(spec, this.selectedApiProvider)
      .subscribe({
        next: (response) => {
          // Start polling for status
          this.pollVideoStatus(response.id, spec.id!, index);
        },
        error: (error) => {
          console.error('Error generating video:', error);
          this.updateVideoStatus(spec.id!, 'error', 0);
          
          // Continue with next video
          this.processNextVideo(index + 1);
        }
      });
  }

  /**
   * Poll for video generation status
   */
  pollVideoStatus(requestId: string, videoId: string, index: number) {
    const interval = setInterval(() => {
      this.videoGenerationService.checkVideoStatus(requestId, this.selectedApiProvider)
        .subscribe({
          next: (response) => {
            // Update status and progress
            this.updateVideoStatus(videoId, response.status, response.progress);
            
            // Update overall progress
            this.updateOverallProgress();
            
            if (response.status === 'completed') {
              clearInterval(interval);
              
              // If video has output URL, process with FFMPEG
              if (response.outputUrl) {
                this.processWithFFMPEG(response.outputUrl, videoId, index);
              } else {
                // Continue with next video
                this.processNextVideo(index + 1);
              }
            } else if (response.status === 'error') {
              clearInterval(interval);
              
              // Continue with next video
              this.processNextVideo(index + 1);
            }
          },
          error: (error) => {
            console.error('Error checking video status:', error);
            clearInterval(interval);
            
            // Update status to error
            this.updateVideoStatus(videoId, 'error', 0);
            
            // Continue with next video
            this.processNextVideo(index + 1);
          }
        });
    }, 2000); // Poll every 2 seconds
  }

  /**
   * Process video with FFMPEG
   */
  processWithFFMPEG(videoUrl: string, videoId: string, index: number) {
    const spec = this.videoSpecifications.find(s => s.id === videoId);
    if (!spec) return;
    
    // Get processing options
    const options = {
      addCaptions: spec.addCaptions || false,
      addBackgroundMusic: spec.addBackgroundMusic || false,
      extendVideoSegments: spec.extendVideoSegments || false
    };
    
    this.videoGenerationService.processVideoWithFFMPEG(videoUrl, options)
      .subscribe({
        next: (response) => {
          // Update status and progress
          this.updateVideoStatus(videoId, response.status, response.progress);
          
          // Update output URL if available
          if (response.outputUrl) {
            this.spreadsheetService.updateVideoOutputUrl(videoId, response.outputUrl);
          }
          
          // Continue with next video
          this.processNextVideo(index + 1);
        },
        error: (error) => {
          console.error('Error processing video with FFMPEG:', error);
          
          // Update status to error
          this.updateVideoStatus(videoId, 'error', 0);
          
          // Continue with next video
          this.processNextVideo(index + 1);
        }
      });
  }

  /**
   * Update video status and progress
   */
  updateVideoStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'error', progress: number) {
    this.spreadsheetService.updateVideoStatus(id, status, progress);
    
    // Update local array for UI
    this.videoSpecifications = this.videoSpecifications.map(spec => {
      if (spec.id === id) {
        return {
          ...spec,
          status,
          progress
        };
      }
      return spec;
    });
  }

  /**
   * Update overall progress based on individual video progress
   */
  updateOverallProgress() {
    if (this.videoSpecifications.length === 0) {
      this.overallProgress = 0;
      return;
    }
    
    const totalProgress = this.videoSpecifications.reduce((sum, spec) => sum + (spec.progress || 0), 0);
    this.overallProgress = Math.floor(totalProgress / this.videoSpecifications.length);
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(provider: string): string {
    return this.videoGenerationService.getProviderDisplayName(provider);
  }

  /**
   * Cancel processing
   */
  cancelProcessing() {
    this.isProcessing = false;
    
    // In a real app, you would also cancel any ongoing API requests
  }
}
