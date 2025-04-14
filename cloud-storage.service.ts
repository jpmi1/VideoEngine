import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';

export interface CloudStorageCredentials {
  provider: 'google-drive' | 'box';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  email?: string;
}

export interface CloudStorageFolder {
  id: string;
  name: string;
  path: string;
}

export interface CloudStorageFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudStorageService {
  private credentialsSubject = new BehaviorSubject<Record<string, CloudStorageCredentials | null>>({
    'google-drive': null,
    'box': null
  });
  
  public credentials$ = this.credentialsSubject.asObservable();
  
  private defaultFolders: Record<string, CloudStorageFolder | null> = {
    'google-drive': null,
    'box': null
  };
  
  constructor(private http: HttpClient) {
    // Load saved credentials from localStorage
    this.loadSavedCredentials();
  }

  /**
   * Load saved credentials from localStorage
   */
  private loadSavedCredentials(): void {
    try {
      const savedCredentials = localStorage.getItem('cloudStorageCredentials');
      if (savedCredentials) {
        const credentials = JSON.parse(savedCredentials);
        this.credentialsSubject.next(credentials);
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  }

  /**
   * Save credentials to localStorage
   */
  private saveCredentials(credentials: Record<string, CloudStorageCredentials | null>): void {
    try {
      localStorage.setItem('cloudStorageCredentials', JSON.stringify(credentials));
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  }

  /**
   * Set credentials for a specific provider
   */
  setCredentials(provider: 'google-drive' | 'box', credentials: CloudStorageCredentials | null): void {
    const currentCredentials = this.credentialsSubject.getValue();
    const updatedCredentials = {
      ...currentCredentials,
      [provider]: credentials
    };
    
    this.credentialsSubject.next(updatedCredentials);
    this.saveCredentials(updatedCredentials);
  }

  /**
   * Check if credentials are set for a specific provider
   */
  hasCredentials(provider: 'google-drive' | 'box'): boolean {
    const currentCredentials = this.credentialsSubject.getValue();
    return !!currentCredentials[provider];
  }

  /**
   * Get credentials for a specific provider
   */
  getCredentials(provider: 'google-drive' | 'box'): CloudStorageCredentials | null {
    const currentCredentials = this.credentialsSubject.getValue();
    return currentCredentials[provider];
  }

  /**
   * Set default folder for a specific provider
   */
  setDefaultFolder(provider: 'google-drive' | 'box', folder: CloudStorageFolder): void {
    this.defaultFolders[provider] = folder;
    
    // Save to localStorage
    try {
      localStorage.setItem('cloudStorageDefaultFolders', JSON.stringify(this.defaultFolders));
    } catch (error) {
      console.error('Error saving default folders:', error);
    }
  }

  /**
   * Get default folder for a specific provider
   */
  getDefaultFolder(provider: 'google-drive' | 'box'): CloudStorageFolder | null {
    return this.defaultFolders[provider];
  }

  /**
   * Connect to Google Drive
   * In a real app, this would handle OAuth flow
   */
  connectToGoogleDrive(): Observable<CloudStorageCredentials> {
    // Simulate OAuth flow
    // In a real app, this would redirect to Google OAuth page
    
    // For simulation, create mock credentials
    const mockCredentials: CloudStorageCredentials = {
      provider: 'google-drive',
      accessToken: 'mock-google-drive-access-token',
      refreshToken: 'mock-google-drive-refresh-token',
      expiresAt: Date.now() + 3600000, // 1 hour from now
      email: 'user@example.com'
    };
    
    // Set credentials
    this.setCredentials('google-drive', mockCredentials);
    
    return of(mockCredentials).pipe(delay(1000)); // Simulate network delay
  }

  /**
   * Connect to Box
   * In a real app, this would handle OAuth flow
   */
  connectToBox(): Observable<CloudStorageCredentials> {
    // Simulate OAuth flow
    // In a real app, this would redirect to Box OAuth page
    
    // For simulation, create mock credentials
    const mockCredentials: CloudStorageCredentials = {
      provider: 'box',
      accessToken: 'mock-box-access-token',
      refreshToken: 'mock-box-refresh-token',
      expiresAt: Date.now() + 3600000, // 1 hour from now
      email: 'user@example.com'
    };
    
    // Set credentials
    this.setCredentials('box', mockCredentials);
    
    return of(mockCredentials).pipe(delay(1000)); // Simulate network delay
  }

  /**
   * Disconnect from a specific provider
   */
  disconnect(provider: 'google-drive' | 'box'): Observable<boolean> {
    // In a real app, this would revoke the access token
    
    // Clear credentials
    this.setCredentials(provider, null);
    
    return of(true).pipe(delay(500)); // Simulate network delay
  }

  /**
   * List folders for a specific provider
   */
  listFolders(provider: 'google-drive' | 'box'): Observable<CloudStorageFolder[]> {
    // Check if credentials are set
    if (!this.hasCredentials(provider)) {
      return throwError(() => new Error(`Not connected to ${provider}`));
    }
    
    // In a real app, this would make an API call to list folders
    
    // For simulation, return mock folders
    const mockFolders: CloudStorageFolder[] = [
      {
        id: 'folder-1',
        name: 'My Videos',
        path: '/My Videos'
      },
      {
        id: 'folder-2',
        name: 'AI Generated',
        path: '/AI Generated'
      },
      {
        id: 'folder-3',
        name: 'Marketing',
        path: '/Marketing'
      }
    ];
    
    return of(mockFolders).pipe(delay(800)); // Simulate network delay
  }

  /**
   * Upload file to a specific provider
   */
  uploadFile(provider: 'google-drive' | 'box', file: File, folderId?: string): Observable<CloudStorageFile> {
    // Check if credentials are set
    if (!this.hasCredentials(provider)) {
      return throwError(() => new Error(`Not connected to ${provider}`));
    }
    
    // In a real app, this would make an API call to upload the file
    
    // For simulation, return mock file
    const mockFile: CloudStorageFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      createdAt: new Date(),
      downloadUrl: `https://example.com/download/${file.name}`,
      thumbnailUrl: file.type.startsWith('video/') ? `https://example.com/thumbnail/${file.name}` : undefined
    };
    
    // Simulate upload progress
    return of(mockFile).pipe(
      delay(file.size / 100000) // Simulate upload time based on file size
    );
  }

  /**
   * Get file details from a specific provider
   */
  getFileDetails(provider: 'google-drive' | 'box', fileId: string): Observable<CloudStorageFile> {
    // Check if credentials are set
    if (!this.hasCredentials(provider)) {
      return throwError(() => new Error(`Not connected to ${provider}`));
    }
    
    // In a real app, this would make an API call to get file details
    
    // For simulation, return mock file
    const mockFile: CloudStorageFile = {
      id: fileId,
      name: `Video_${fileId}.mp4`,
      mimeType: 'video/mp4',
      size: 1024 * 1024 * 10, // 10MB
      createdAt: new Date(),
      downloadUrl: `https://example.com/download/${fileId}`,
      thumbnailUrl: `https://example.com/thumbnail/${fileId}`
    };
    
    return of(mockFile).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(provider: string): string {
    const displayNames: Record<string, string> = {
      'google-drive': 'Google Drive',
      'box': 'Box'
    };
    
    return displayNames[provider] || provider;
  }
}
