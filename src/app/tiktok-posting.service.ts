import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TikTokAuthService } from './tiktok-auth.service';

export interface TikTokPostOptions {
  title: string;
  privacyLevel: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
  disableDuet?: boolean;
  disableStitch?: boolean;
  disableComment?: boolean;
  videoCoverTimestampMs?: number;
  brandContentToggle?: boolean;
  brandOrganicToggle?: boolean;
  isAigc?: boolean;
  hashtags?: string[];
  mentions?: string[];
}

export interface TikTokPostStatus {
  publishId: string;
  status: 'PROCESSING' | 'PUBLISHED' | 'FAILED';
  videoUrl?: string;
  errorMessage?: string;
  createdAt: Date;
}

export interface TikTokHashtagSuggestion {
  name: string;
  count: number;
  trending: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TikTokPostingService {
  private readonly POST_INIT_URL = 'https://open.tiktokapis.com/v2/post/publish/video/init/';
  private readonly POST_STATUS_URL = 'https://open.tiktokapis.com/v2/post/publish/status/fetch/';
  private readonly HASHTAG_SUGGESTION_URL = 'https://open.tiktokapis.com/v2/research/hashtag/suggest/';
  
  private postStatusSubject = new BehaviorSubject<TikTokPostStatus[]>([]);
  public postStatus$ = this.postStatusSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private tikTokAuthService: TikTokAuthService
  ) {
    // Load saved post statuses from localStorage
    this.loadSavedPostStatuses();
  }
  
  /**
   * Initialize a video post to TikTok
   */
  initializePost(videoFile: File, options: TikTokPostOptions): Observable<any> {
    if (!this.tikTokAuthService.isAuthenticated()) {
      return throwError(() => new Error('Not authenticated with TikTok'));
    }
    
    const accessToken = this.tikTokAuthService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No access token available'));
    }
    
    // Prepare post data
    const postData = {
      post_info: {
        title: this.formatPostTitle(options.title, options.hashtags, options.mentions),
        privacy_level: options.privacyLevel,
        disable_duet: options.disableDuet || false,
        disable_stitch: options.disableStitch || false,
        disable_comment: options.disableComment || false,
        video_cover_timestamp_ms: options.videoCoverTimestampMs || 0,
        brand_content_toggle: options.brandContentToggle || false,
        brand_organic_toggle: options.brandOrganicToggle || false,
        is_aigc: options.isAigc || true // Mark as AI-generated content
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: videoFile.size,
        chunk_size: this.calculateChunkSize(videoFile.size),
        total_chunk_count: this.calculateTotalChunks(videoFile.size)
      }
    };
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8'
    });
    
    return this.http.post<any>(this.POST_INIT_URL, postData, { headers }).pipe(
      tap(response => {
        // Save initial post status
        const newStatus: TikTokPostStatus = {
          publishId: response.data.publish_id,
          status: 'PROCESSING',
          createdAt: new Date()
        };
        this.addPostStatus(newStatus);
        
        // Upload video file
        this.uploadVideoFile(videoFile, response.data.upload_url, newStatus.publishId);
      }),
      catchError(error => {
        console.error('Error initializing post:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Upload video file to TikTok
   */
  private uploadVideoFile(file: File, uploadUrl: string, publishId: string): void {
    const formData = new FormData();
    formData.append('video', file);
    
    this.http.post(uploadUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round(100 * event.loaded / event.total);
          console.log(`Upload progress: ${progress}%`);
          // Update progress in UI if needed
        } else if (event.type === HttpEventType.Response) {
          // Upload completed, check post status
          this.checkPostStatus(publishId);
        }
      },
      error: (error) => {
        console.error('Error uploading video:', error);
        this.updatePostStatus(publishId, 'FAILED', undefined, 'Failed to upload video');
      }
    });
  }
  
  /**
   * Check status of a post
   */
  checkPostStatus(publishId: string): Observable<any> {
    if (!this.tikTokAuthService.isAuthenticated()) {
      return throwError(() => new Error('Not authenticated with TikTok'));
    }
    
    const accessToken = this.tikTokAuthService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No access token available'));
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8'
    });
    
    const body = {
      publish_id: publishId
    };
    
    return this.http.post<any>(this.POST_STATUS_URL, body, { headers }).pipe(
      tap(response => {
        if (response.data.status === 'PUBLISH_DONE') {
          this.updatePostStatus(publishId, 'PUBLISHED', response.data.video_url);
        } else if (response.data.status === 'PUBLISH_FAILED') {
          this.updatePostStatus(publishId, 'FAILED', undefined, response.data.error_message || 'Publishing failed');
        } else {
          // Still processing, check again after a delay
          setTimeout(() => {
            this.checkPostStatus(publishId).subscribe();
          }, 5000); // Check every 5 seconds
        }
      }),
      catchError(error => {
        console.error('Error checking post status:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Get hashtag suggestions based on keywords
   */
  getHashtagSuggestions(keywords: string[]): Observable<TikTokHashtagSuggestion[]> {
    if (!this.tikTokAuthService.isAuthenticated()) {
      return throwError(() => new Error('Not authenticated with TikTok'));
    }
    
    const accessToken = this.tikTokAuthService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No access token available'));
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8'
    });
    
    const body = {
      keywords: keywords
    };
    
    return this.http.post<any>(this.HASHTAG_SUGGESTION_URL, body, { headers }).pipe(
      map(response => response.data.hashtags),
      catchError(error => {
        console.error('Error getting hashtag suggestions:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Get optimal posting times based on user's audience
   * Note: This is a mock implementation as TikTok doesn't provide this API directly
   */
  getOptimalPostingTimes(): Observable<string[]> {
    // In a real implementation, this would analyze the user's audience data
    // For now, return mock optimal times
    const optimalTimes = [
      '08:00', '12:00', '17:00', '20:00', '22:00'
    ];
    
    return new Observable(observer => {
      observer.next(optimalTimes);
      observer.complete();
    });
  }
  
  /**
   * Get caption templates for different video types
   */
  getCaptionTemplates(): Observable<Record<string, string>> {
    // Mock templates for different video types
    const templates = {
      'tutorial': 'Learn how to {topic} in just {time} minutes! #tutorial #{topic} #howto',
      'entertainment': 'This {topic} had me laughing so hard 😂 #funny #{topic} #viral',
      'educational': 'Did you know this about {topic}? 🤔 #learnontiktok #{topic} #facts',
      'product': 'Check out this amazing {product}! It's perfect for {use_case}. #review #{product} #musthave',
      'challenge': 'Trying the {challenge} challenge! How did I do? ##{challenge} #trend #viral'
    };
    
    return new Observable(observer => {
      observer.next(templates);
      observer.complete();
    });
  }
  
  /**
   * Format post title with hashtags and mentions
   */
  private formatPostTitle(title: string, hashtags?: string[], mentions?: string[]): string {
    let formattedTitle = title;
    
    // Add hashtags
    if (hashtags && hashtags.length > 0) {
      formattedTitle += ' ' + hashtags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ');
    }
    
    // Add mentions
    if (mentions && mentions.length > 0) {
      formattedTitle += ' ' + mentions.map(user => `@${user.replace(/^@/, '')}`).join(' ');
    }
    
    return formattedTitle;
  }
  
  /**
   * Calculate optimal chunk size for video upload
   */
  private calculateChunkSize(fileSize: number): number {
    // For files smaller than 10MB, use a single chunk
    if (fileSize < 10 * 1024 * 1024) {
      return fileSize;
    }
    
    // For larger files, use 5MB chunks
    return 5 * 1024 * 1024;
  }
  
  /**
   * Calculate total number of chunks for video upload
   */
  private calculateTotalChunks(fileSize: number): number {
    const chunkSize = this.calculateChunkSize(fileSize);
    return Math.ceil(fileSize / chunkSize);
  }
  
  /**
   * Add new post status
   */
  private addPostStatus(status: TikTokPostStatus): void {
    const currentStatuses = this.postStatusSubject.getValue();
    const updatedStatuses = [...currentStatuses, status];
    this.postStatusSubject.next(updatedStatuses);
    this.savePostStatuses(updatedStatuses);
  }
  
  /**
   * Update existing post status
   */
  private updatePostStatus(publishId: string, status: 'PROCESSING' | 'PUBLISHED' | 'FAILED', videoUrl?: string, errorMessage?: string): void {
    const currentStatuses = this.postStatusSubject.getValue();
    const updatedStatuses = currentStatuses.map(item => {
      if (item.publishId === publishId) {
        return {
          ...item,
          status,
          videoUrl,
          errorMessage
        };
      }
      return item;
    });
    
    this.postStatusSubject.next(updatedStatuses);
    this.savePostStatuses(updatedStatuses);
  }
  
  /**
   * Save post statuses to localStorage
   */
  private savePostStatuses(statuses: TikTokPostStatus[]): void {
    try {
      localStorage.setItem('tiktok_post_statuses', JSON.stringify(statuses));
    } catch (error) {
      console.error('Error saving post statuses to localStorage:', error);
    }
  }
  
  /**
   * Load saved post statuses from localStorage
   */
  private loadSavedPostStatuses(): void {
    try {
      const savedStatuses = localStorage.getItem('tiktok_post_statuses');
      
      if (savedStatuses) {
        const statuses = JSON.parse(savedStatuses);
        // Convert string dates back to Date objects
        const parsedStatuses = statuses.map((status: any) => ({
          ...status,
          createdAt: new Date(status.createdAt)
        }));
        this.postStatusSubject.next(parsedStatuses);
      }
    } catch (error) {
      console.error('Error loading post statuses from localStorage:', error);
      localStorage.removeItem('tiktok_post_statuses');
    }
  }
}
