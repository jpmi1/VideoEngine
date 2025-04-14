import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface TikTokAuthConfig {
  clientKey: string;
  redirectUri: string;
  scope: string;
}

export interface TikTokAuthResponse {
  code: string;
  scopes: string;
  state: string;
}

export interface TikTokTokenResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
}

export interface TikTokUserInfo {
  open_id: string;
  union_id: string;
  avatar_url: string;
  avatar_url_100: string;
  avatar_url_200: string;
  display_name: string;
  bio_description: string;
  profile_deep_link: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class TikTokAuthService {
  private readonly AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
  private readonly TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
  private readonly USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';
  
  private config: TikTokAuthConfig = {
    clientKey: '',
    redirectUri: '',
    scope: 'user.info.basic,video.publish'
  };
  
  private clientSecret: string = '';
  
  private tokenSubject = new BehaviorSubject<TikTokTokenResponse | null>(null);
  public token$ = this.tokenSubject.asObservable();
  
  private userInfoSubject = new BehaviorSubject<TikTokUserInfo | null>(null);
  public userInfo$ = this.userInfoSubject.asObservable();
  
  constructor(private http: HttpClient) {
    // Load saved token from localStorage
    this.loadSavedToken();
  }
  
  /**
   * Configure TikTok authentication
   */
  configure(config: TikTokAuthConfig, clientSecret: string): void {
    this.config = { ...this.config, ...config };
    this.clientSecret = clientSecret;
  }
  
  /**
   * Get TikTok authorization URL
   */
  getAuthorizationUrl(state: string = this.generateState()): string {
    const params = new URLSearchParams({
      client_key: this.config.clientKey,
      response_type: 'code',
      scope: this.config.scope,
      redirect_uri: this.config.redirectUri,
      state: state
    });
    
    return `${this.AUTH_URL}?${params.toString()}`;
  }
  
  /**
   * Handle authorization response
   */
  handleAuthResponse(response: TikTokAuthResponse): Observable<TikTokTokenResponse> {
    if (!response.code) {
      return throwError(() => new Error('No authorization code provided'));
    }
    
    return this.exchangeCodeForToken(response.code);
  }
  
  /**
   * Exchange authorization code for token
   */
  private exchangeCodeForToken(code: string): Observable<TikTokTokenResponse> {
    const body = new URLSearchParams({
      client_key: this.config.clientKey,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUri
    });
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    
    return this.http.post<TikTokTokenResponse>(this.TOKEN_URL, body.toString(), { headers }).pipe(
      tap(token => {
        this.tokenSubject.next(token);
        this.saveToken(token);
        this.fetchUserInfo(token.access_token);
      }),
      catchError(error => {
        console.error('Error exchanging code for token:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Refresh access token
   */
  refreshToken(): Observable<TikTokTokenResponse> {
    const currentToken = this.tokenSubject.getValue();
    
    if (!currentToken || !currentToken.refresh_token) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    const body = new URLSearchParams({
      client_key: this.config.clientKey,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: currentToken.refresh_token
    });
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    
    return this.http.post<TikTokTokenResponse>(this.TOKEN_URL, body.toString(), { headers }).pipe(
      tap(token => {
        this.tokenSubject.next(token);
        this.saveToken(token);
      }),
      catchError(error => {
        console.error('Error refreshing token:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Fetch user information
   */
  private fetchUserInfo(accessToken: string): Observable<TikTokUserInfo> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    
    return this.http.get<{ data: TikTokUserInfo }>(this.USER_INFO_URL, { headers }).pipe(
      map(response => response.data),
      tap(userInfo => {
        this.userInfoSubject.next(userInfo);
      }),
      catchError(error => {
        console.error('Error fetching user info:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.tokenSubject.getValue();
  }
  
  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    const token = this.tokenSubject.getValue();
    return token ? token.access_token : null;
  }
  
  /**
   * Logout user
   */
  logout(): void {
    this.tokenSubject.next(null);
    this.userInfoSubject.next(null);
    localStorage.removeItem('tiktok_token');
  }
  
  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Save token to localStorage
   */
  private saveToken(token: TikTokTokenResponse): void {
    try {
      localStorage.setItem('tiktok_token', JSON.stringify({
        ...token,
        expires_at: Date.now() + (token.expires_in * 1000),
        refresh_expires_at: Date.now() + (token.refresh_expires_in * 1000)
      }));
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  }
  
  /**
   * Load saved token from localStorage
   */
  private loadSavedToken(): void {
    try {
      const savedToken = localStorage.getItem('tiktok_token');
      
      if (savedToken) {
        const token = JSON.parse(savedToken);
        
        // Check if token is expired
        if (token.expires_at && token.expires_at > Date.now()) {
          this.tokenSubject.next(token);
          this.fetchUserInfo(token.access_token);
        } 
        // Check if refresh token is still valid
        else if (token.refresh_expires_at && token.refresh_expires_at > Date.now()) {
          this.refreshToken().subscribe();
        }
        // Both tokens expired, clear storage
        else {
          localStorage.removeItem('tiktok_token');
        }
      }
    } catch (error) {
      console.error('Error loading token from localStorage:', error);
      localStorage.removeItem('tiktok_token');
    }
  }
}
