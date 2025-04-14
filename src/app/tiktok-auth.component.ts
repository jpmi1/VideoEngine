import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TikTokAuthService, TikTokAuthResponse } from './tiktok-auth.service';
import { environment } from '../environments/environment';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tiktok-auth',
  templateUrl: './tiktok-auth.component.html',
  styleUrls: ['./tiktok-auth.component.scss']
})
export class TikTokAuthComponent implements OnInit {
  isLoading = false;
  isAuthenticated = false;
  userInfo: any = null;
  authError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tikTokAuthService: TikTokAuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Configure TikTok auth service with environment variables
    this.tikTokAuthService.configure({
      clientKey: environment.tiktok.clientKey,
      redirectUri: environment.tiktok.redirectUri,
      scope: environment.tiktok.scope
    }, environment.tiktok.clientSecret);

    // Check if this is a redirect from TikTok auth
    this.route.queryParams.subscribe(params => {
      if (params['code'] && params['state']) {
        this.handleAuthRedirect(params);
      }
    });

    // Subscribe to auth state changes
    this.tikTokAuthService.token$.subscribe(token => {
      this.isAuthenticated = !!token;
    });

    // Subscribe to user info changes
    this.tikTokAuthService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
    });
  }

  /**
   * Handle redirect from TikTok authorization
   */
  private handleAuthRedirect(params: any) {
    this.isLoading = true;
    this.authError = null;

    const authResponse: TikTokAuthResponse = {
      code: params['code'],
      scopes: params['scopes'] || '',
      state: params['state']
    };

    this.tikTokAuthService.handleAuthResponse(authResponse)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.presentToast('Successfully connected to TikTok');
          // Navigate to dashboard or TikTok posting page
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.authError = error.message || 'Failed to authenticate with TikTok';
          this.presentToast('Authentication failed: ' + this.authError, 'danger');
        }
      });
  }

  /**
   * Initiate TikTok login
   */
  login() {
    this.isLoading = true;
    const state = Math.random().toString(36).substring(2, 15);
    const authUrl = this.tikTokAuthService.getAuthorizationUrl(state);
    
    // Store state in session storage for verification when redirected back
    sessionStorage.setItem('tiktok_auth_state', state);
    
    // Redirect to TikTok authorization page
    window.location.href = authUrl;
  }

  /**
   * Logout from TikTok
   */
  logout() {
    this.tikTokAuthService.logout();
    this.presentToast('Logged out from TikTok');
  }

  /**
   * Present toast message
   */
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
