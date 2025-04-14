import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { VideoSpecification } from './spreadsheet-import.service';

export interface VideoGenerationRequest {
  id: string;
  prompt: string;
  style: string;
  duration: number;
  apiProvider: string;
}

export interface VideoGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  outputUrl?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoGenerationService {
  private apiKeys: Record<string, string> = {
    'gemini-veo-2': '',
    'pixverse-v3.5': '',
    'lumalabs-dreammachine': '',
    'kling-v1.6': '',
    'hunyuan': ''
  };
  
  private apiStatusSubject = new BehaviorSubject<Record<string, boolean>>({
    'gemini-veo-2': false,
    'pixverse-v3.5': false,
    'lumalabs-dreammachine': false,
    'kling-v1.6': false,
    'hunyuan': false
  });
  
  public apiStatus$ = this.apiStatusSubject.asObservable();
  
  constructor(private http: HttpClient) { }

  /**
   * Set API key for a specific provider
   */
  setApiKey(provider: string, key: string): void {
    this.apiKeys[provider] = key;
    
    // Update API status
    const currentStatus = this.apiStatusSubject.getValue();
    this.apiStatusSubject.next({
      ...currentStatus,
      [provider]: !!key
    });
  }

  /**
   * Get API key for a specific provider
   */
  getApiKey(provider: string): string {
    return this.apiKeys[provider] || '';
  }

  /**
   * Check if API key is set for a specific provider
   */
  hasApiKey(provider: string): boolean {
    return !!this.apiKeys[provider];
  }

  /**
   * Generate video based on specification
   */
  generateVideo(specification: VideoSpecification, apiProvider: string): Observable<VideoGenerationResponse> {
    // Check if API key is set
    if (!this.hasApiKey(apiProvider)) {
      return throwError(() => new Error(`API key not set for ${apiProvider}`));
    }
    
    // In a real app, this would make an API call to the selected provider
    // For now, we'll simulate it
    
    const requestId = `request-${Date.now()}`;
    
    // Create initial response
    const response: VideoGenerationResponse = {
      id: requestId,
      status: 'pending',
      progress: 0
    };
    
    // Simulate API call
    return of(response).pipe(
      delay(1000), // Simulate network delay
      map(() => {
        // Update status to processing
        return {
          ...response,
          status: 'processing',
          progress: 10
        };
      })
    );
  }

  /**
   * Check status of video generation
   */
  checkVideoStatus(requestId: string, apiProvider: string): Observable<VideoGenerationResponse> {
    // In a real app, this would make an API call to check the status
    // For now, we'll simulate progress updates
    
    // Simulate random progress between 10-100%
    const progress = Math.min(100, Math.floor(Math.random() * 30) + 10);
    const status = progress >= 100 ? 'completed' : 'processing';
    
    const response: VideoGenerationResponse = {
      id: requestId,
      status: status,
      progress: progress
    };
    
    // If completed, add output URL
    if (status === 'completed') {
      response.outputUrl = `https://example.com/videos/${requestId}.mp4`;
    }
    
    return of(response).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Process video with FFMPEG
   */
  processVideoWithFFMPEG(videoUrl: string, options: {
    addCaptions?: boolean;
    addBackgroundMusic?: boolean;
    extendVideoSegments?: boolean;
  }): Observable<VideoGenerationResponse> {
    // In a real app, this would make an API call to process the video with FFMPEG
    // For now, we'll simulate it
    
    const requestId = `ffmpeg-${Date.now()}`;
    
    // Create initial response
    const response: VideoGenerationResponse = {
      id: requestId,
      status: 'processing',
      progress: 0
    };
    
    // Simulate processing
    return of(response).pipe(
      delay(1000), // Simulate processing delay
      map(() => {
        // Update status to completed
        return {
          ...response,
          status: 'completed',
          progress: 100,
          outputUrl: `https://example.com/processed/${requestId}.mp4`
        };
      })
    );
  }

  /**
   * Get available API providers
   */
  getAvailableProviders(): Observable<string[]> {
    // In a real app, this might be dynamic based on available APIs
    return of([
      'gemini-veo-2',
      'pixverse-v3.5',
      'lumalabs-dreammachine',
      'kling-v1.6',
      'hunyuan'
    ]);
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(provider: string): string {
    const displayNames: Record<string, string> = {
      'gemini-veo-2': 'Gemini Veo 2',
      'pixverse-v3.5': 'PixVerse V3.5',
      'lumalabs-dreammachine': 'Lumalabs DreamMachine',
      'kling-v1.6': 'Kling V1.6',
      'hunyuan': 'Hunyuan'
    };
    
    return displayNames[provider] || provider;
  }
}
