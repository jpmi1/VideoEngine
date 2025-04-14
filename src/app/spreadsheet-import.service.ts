import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface VideoSpecification {
  id?: string;
  name: string;
  length: number | string;
  script: string;
  style: string;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  outputUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpreadsheetImportService {
  private videoSpecificationsSubject = new BehaviorSubject<VideoSpecification[]>([]);
  public videoSpecifications$: Observable<VideoSpecification[]> = this.videoSpecificationsSubject.asObservable();
  
  constructor() { }

  /**
   * Set the video specifications from the imported spreadsheet
   */
  setVideoSpecifications(specifications: VideoSpecification[]): void {
    // Add unique IDs and initial status
    const specsWithIds = specifications.map((spec, index) => ({
      ...spec,
      id: `video-${Date.now()}-${index}`,
      status: 'pending',
      progress: 0
    }));
    
    this.videoSpecificationsSubject.next(specsWithIds);
  }

  /**
   * Get the current video specifications
   */
  getVideoSpecifications(): VideoSpecification[] {
    return this.videoSpecificationsSubject.getValue();
  }

  /**
   * Update the status of a specific video
   */
  updateVideoStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'error', progress?: number): void {
    const currentSpecs = this.getVideoSpecifications();
    const updatedSpecs = currentSpecs.map(spec => {
      if (spec.id === id) {
        return {
          ...spec,
          status,
          progress: progress !== undefined ? progress : spec.progress
        };
      }
      return spec;
    });
    
    this.videoSpecificationsSubject.next(updatedSpecs);
  }

  /**
   * Update the output URL of a specific video
   */
  updateVideoOutputUrl(id: string, outputUrl: string): void {
    const currentSpecs = this.getVideoSpecifications();
    const updatedSpecs = currentSpecs.map(spec => {
      if (spec.id === id) {
        return {
          ...spec,
          outputUrl
        };
      }
      return spec;
    });
    
    this.videoSpecificationsSubject.next(updatedSpecs);
  }

  /**
   * Clear all video specifications
   */
  clearVideoSpecifications(): void {
    this.videoSpecificationsSubject.next([]);
  }

  /**
   * Validate a spreadsheet row
   */
  validateRow(row: any, headers: string[]): string[] {
    const errors: string[] = [];
    
    // Map headers to our required columns (case insensitive)
    const nameHeader = headers.find(h => h.toLowerCase() === 'name');
    const lengthHeader = headers.find(h => h.toLowerCase() === 'length');
    const scriptHeader = headers.find(h => h.toLowerCase() === 'script');
    
    if (nameHeader && !row[nameHeader]) {
      errors.push('Missing video name');
    }
    
    if (lengthHeader) {
      const length = row[lengthHeader];
      if (!length) {
        errors.push('Missing video length');
      } else if (!this.isValidLength(length)) {
        errors.push('Invalid video length format. Use MM:SS format (e.g., 1:30)');
      }
    }
    
    if (scriptHeader && !row[scriptHeader]) {
      errors.push('Missing script content');
    }
    
    return errors;
  }

  /**
   * Validate the length format (MM:SS)
   */
  isValidLength(length: string | number): boolean {
    // Accept both MM:SS format and seconds as number
    if (typeof length === 'number') return true;
    
    const regex = /^(\d+):([0-5][0-9])$/;
    return regex.test(length);
  }

  /**
   * Normalize length to seconds
   */
  normalizeLength(length: string | number): number {
    if (typeof length === 'number') return length;
    
    const parts = length.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes * 60 + seconds;
    }
    
    return 0;
  }
}
