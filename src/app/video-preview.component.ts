import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { VerticalVideoService, VideoFormatOptions } from '../vertical-video.service';

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss']
})
export class VideoPreviewComponent implements OnInit, AfterViewInit {
  @Input() videoUrl: string | null = null;
  @Input() caption: string = '';
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('captionElement') captionElement!: ElementRef<HTMLDivElement>;
  
  videoFormat: VideoFormatOptions;
  safeZone: {top: number, bottom: number, left: number, right: number} | null = null;
  optimizedCaption: string = '';
  
  constructor(private verticalVideoService: VerticalVideoService) {
    this.videoFormat = this.verticalVideoService.getTikTokFormat();
  }
  
  ngOnInit() {
    // Optimize caption text for TikTok format
    this.optimizedCaption = this.verticalVideoService.optimizeCaptionText(
      this.caption, 
      this.videoFormat.captionStyle.maxCharsPerLine
    );
  }
  
  ngAfterViewInit() {
    if (this.videoElement && this.videoElement.nativeElement) {
      // Set up video element with correct aspect ratio
      const video = this.videoElement.nativeElement;
      
      // Apply aspect ratio to container
      const aspectRatioParts = this.videoFormat.aspectRatio.split(':');
      const aspectRatio = parseInt(aspectRatioParts[0]) / parseInt(aspectRatioParts[1]);
      
      // Listen for video metadata loaded to calculate safe zones
      video.addEventListener('loadedmetadata', () => {
        this.calculateSafeZone();
        this.positionCaption();
      });
      
      // Listen for resize events to recalculate safe zones
      window.addEventListener('resize', () => {
        this.calculateSafeZone();
        this.positionCaption();
      });
    }
  }
  
  /**
   * Calculate safe zone for text placement
   */
  calculateSafeZone() {
    if (!this.videoElement || !this.videoElement.nativeElement) return;
    
    const video = this.videoElement.nativeElement;
    this.safeZone = this.verticalVideoService.calculateSafeZone(
      video.clientWidth,
      video.clientHeight
    );
  }
  
  /**
   * Position caption based on safe zone and caption position setting
   */
  positionCaption() {
    if (!this.captionElement || !this.captionElement.nativeElement || !this.safeZone) return;
    
    const caption = this.captionElement.nativeElement;
    const position = this.videoFormat.captionPosition;
    const style = this.videoFormat.captionStyle;
    
    // Set caption style
    caption.style.fontSize = `${style.fontSize}px`;
    caption.style.color = style.fontColor;
    caption.style.backgroundColor = `${style.backgroundColor}${Math.round(style.opacity * 255).toString(16).padStart(2, '0')}`;
    
    // Position caption based on setting
    caption.style.left = `${this.safeZone.left}px`;
    caption.style.right = `${this.safeZone.left}px`;
    caption.style.width = `calc(100% - ${this.safeZone.left * 2}px)`;
    
    if (position === 'bottom') {
      caption.style.bottom = `${this.safeZone.top}px`;
      caption.style.top = 'auto';
    } else if (position === 'top') {
      caption.style.top = `${this.safeZone.top}px`;
      caption.style.bottom = 'auto';
    } else { // center
      caption.style.top = '50%';
      caption.style.transform = 'translateY(-50%)';
      caption.style.bottom = 'auto';
    }
  }
}
