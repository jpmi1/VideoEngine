import { Injectable } from '@angular/core';
import { VideoGenerationService } from './video-generation.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface VideoFormatOptions {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  resolution: {
    width: number;
    height: number;
  };
  captionPosition: 'bottom' | 'center' | 'top';
  captionStyle: {
    fontSize: number;
    maxCharsPerLine: number;
    fontColor: string;
    backgroundColor: string;
    opacity: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VerticalVideoService {
  // Default TikTok-optimized format settings
  private readonly tiktokFormat: VideoFormatOptions = {
    aspectRatio: '9:16',
    resolution: {
      width: 1080,
      height: 1920
    },
    captionPosition: 'bottom',
    captionStyle: {
      fontSize: 12,
      maxCharsPerLine: 100,
      fontColor: '#FFFFFF',
      backgroundColor: '#000000',
      opacity: 0.7
    }
  };

  // Safe zone boundaries for TikTok (percentage of screen)
  private readonly safeZone = {
    top: 0.1,    // Top 10% (avoid status bar)
    bottom: 0.1, // Bottom 10% (avoid controls)
    left: 0.05,  // Left 5%
    right: 0.05  // Right 5%
  };

  constructor(private videoGenerationService: VideoGenerationService) {}

  /**
   * Get TikTok-optimized video format settings
   */
  getTikTokFormat(): VideoFormatOptions {
    return {...this.tiktokFormat};
  }

  /**
   * Apply TikTok-optimized format to video generation parameters
   */
  optimizeForTikTok(videoParams: any): any {
    return {
      ...videoParams,
      aspectRatio: this.tiktokFormat.aspectRatio,
      resolution: this.tiktokFormat.resolution,
      captionPosition: this.tiktokFormat.captionPosition,
      captionStyle: this.tiktokFormat.captionStyle,
      // Add TikTok-specific optimizations
      optimizeForMobile: true,
      verticalFormat: true
    };
  }

  /**
   * Calculate safe zone coordinates for text placement
   * Returns coordinates as percentage of screen (0-1)
   */
  calculateSafeZone(width: number, height: number): {top: number, bottom: number, left: number, right: number} {
    return {
      top: this.safeZone.top * height,
      bottom: height - (this.safeZone.bottom * height),
      left: this.safeZone.left * width,
      right: width - (this.safeZone.right * width)
    };
  }

  /**
   * Optimize caption text for TikTok format
   * Breaks long text into shorter lines for better readability on mobile
   */
  optimizeCaptionText(text: string, maxCharsPerLine: number = this.tiktokFormat.captionStyle.maxCharsPerLine): string {
    if (!text || text.length <= maxCharsPerLine) {
      return text;
    }

    const words = text.split(' ');
    let lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  }

  /**
   * Generate FFMPEG command for optimizing video for TikTok
   */
  generateFfmpegCommand(inputPath: string, outputPath: string, options: Partial<VideoFormatOptions> = {}): string {
    const format = {...this.tiktokFormat, ...options};
    
    // Build FFMPEG command
    return `ffmpeg -i "${inputPath}" ` +
      // Scale to correct aspect ratio
      `-vf "scale=${format.resolution.width}:${format.resolution.height}:force_original_aspect_ratio=decrease,` +
      // Pad to fill (with black bars if needed)
      `pad=${format.resolution.width}:${format.resolution.height}:(ow-iw)/2:(oh-ih)/2,` +
      // Add subtle sharpening for mobile viewing
      `unsharp=3:3:1.5:3:3:0.5" ` +
      // Optimize encoding for mobile
      `-c:v libx264 -preset slow -crf 23 -profile:v high -pix_fmt yuv420p ` +
      // Optimize audio for mobile
      `-c:a aac -b:a 128k ` +
      // Ensure compatibility with TikTok
      `-movflags +faststart "${outputPath}"`;
  }

  /**
   * Process video to optimize for TikTok
   */
  processVideoForTikTok(videoFile: File): Observable<Blob> {
    // In a real implementation, this would call a server-side process
    // For now, we'll simulate the processing
    
    console.log('Optimizing video for TikTok format:', this.tiktokFormat);
    
    // Simulate processing delay
    return of(videoFile).pipe(
      map(file => {
        // In a real implementation, this would return the processed file
        // For now, just return the original file
        return new Blob([file], { type: file.type });
      })
    );
  }

  /**
   * Check if video meets TikTok requirements
   */
  validateForTikTok(videoFile: File): {valid: boolean, issues: string[]} {
    const issues: string[] = [];
    
    // Check file size (TikTok limit is 500MB, but we'll use 300MB to be safe)
    if (videoFile.size > 300 * 1024 * 1024) {
      issues.push('Video file is too large. Maximum size is 300MB.');
    }
    
    // In a real implementation, we would check:
    // - Video duration (15s-60s is optimal for TikTok)
    // - Resolution
    // - Codec compatibility
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}
