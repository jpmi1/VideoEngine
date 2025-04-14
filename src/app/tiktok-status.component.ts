import { Component, OnInit } from '@angular/core';
import { TikTokPostingService, TikTokPostStatus } from '../tiktok-posting.service';
import { TikTokAuthService } from '../tiktok-auth.service';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tiktok-status',
  templateUrl: './tiktok-status.component.html',
  styleUrls: ['./tiktok-status.component.scss']
})
export class TikTokStatusComponent implements OnInit {
  postStatuses: TikTokPostStatus[] = [];
  isLoading = true;
  
  constructor(
    private tikTokAuthService: TikTokAuthService,
    private tikTokPostingService: TikTokPostingService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}
  
  ngOnInit() {
    // Check if authenticated
    if (!this.tikTokAuthService.isAuthenticated()) {
      this.router.navigate(['/tiktok/auth']);
      return;
    }
    
    // Subscribe to post status updates
    this.tikTokPostingService.postStatus$.subscribe(statuses => {
      this.postStatuses = statuses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      this.isLoading = false;
    });
    
    // Check status of processing posts
    this.checkProcessingPosts();
  }
  
  /**
   * Check status of posts that are still processing
   */
  checkProcessingPosts() {
    const processingPosts = this.postStatuses.filter(post => post.status === 'PROCESSING');
    
    processingPosts.forEach(post => {
      this.tikTokPostingService.checkPostStatus(post.publishId).subscribe();
    });
  }
  
  /**
   * Refresh post statuses
   */
  refreshStatuses(event: any) {
    this.checkProcessingPosts();
    
    // Complete the refresh after 2 seconds
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }
  
  /**
   * Open TikTok video
   */
  openTikTokVideo(videoUrl: string) {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  }
  
  /**
   * Show post details
   */
  async showPostDetails(post: TikTokPostStatus) {
    const alert = await this.alertController.create({
      header: 'Post Details',
      message: `
        <p><strong>Status:</strong> ${post.status}</p>
        <p><strong>Created:</strong> ${post.createdAt.toLocaleString()}</p>
        <p><strong>Publish ID:</strong> ${post.publishId}</p>
        ${post.errorMessage ? `<p><strong>Error:</strong> ${post.errorMessage}</p>` : ''}
      `,
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        },
        {
          text: 'Check Status',
          handler: () => {
            this.tikTokPostingService.checkPostStatus(post.publishId).subscribe({
              next: () => {
                this.presentToast('Status updated', 'success');
              },
              error: (error) => {
                this.presentToast(`Error checking status: ${error.message || 'Unknown error'}`, 'danger');
              }
            });
          }
        }
      ]
    });
    
    await alert.present();
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
