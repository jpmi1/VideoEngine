import { Component, OnInit } from '@angular/core';
import { TikTokAuthService } from '../tiktok-auth.service';
import { TikTokPostingService, TikTokPostStatus } from '../tiktok-posting.service';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-tiktok-analytics',
  templateUrl: './tiktok-analytics.component.html',
  styleUrls: ['./tiktok-analytics.component.scss']
})
export class TikTokAnalyticsComponent implements OnInit {
  isLoading = true;
  postStatuses: TikTokPostStatus[] = [];
  
  // Analytics data
  totalPosts = 0;
  publishedPosts = 0;
  processingPosts = 0;
  failedPosts = 0;
  
  // Charts
  statusChart: Chart | null = null;
  timelineChart: Chart | null = null;
  
  // Time period filter
  timePeriod: 'week' | 'month' | 'all' = 'week';
  
  constructor(
    private tikTokAuthService: TikTokAuthService,
    private tikTokPostingService: TikTokPostingService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Check if authenticated
    if (!this.tikTokAuthService.isAuthenticated()) {
      this.router.navigate(['/tiktok/auth']);
      return;
    }
    
    // Subscribe to post status updates
    this.tikTokPostingService.postStatus$.subscribe(statuses => {
      this.postStatuses = statuses;
      this.calculateAnalytics();
      this.isLoading = false;
      
      // Initialize charts after data is loaded
      setTimeout(() => {
        this.initStatusChart();
        this.initTimelineChart();
      }, 100);
    });
  }
  
  /**
   * Calculate analytics data
   */
  calculateAnalytics() {
    // Filter posts based on selected time period
    const filteredPosts = this.filterPostsByTimePeriod();
    
    // Calculate totals
    this.totalPosts = filteredPosts.length;
    this.publishedPosts = filteredPosts.filter(post => post.status === 'PUBLISHED').length;
    this.processingPosts = filteredPosts.filter(post => post.status === 'PROCESSING').length;
    this.failedPosts = filteredPosts.filter(post => post.status === 'FAILED').length;
  }
  
  /**
   * Filter posts by selected time period
   */
  filterPostsByTimePeriod(): TikTokPostStatus[] {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (this.timePeriod) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        return [...this.postStatuses];
    }
    
    return this.postStatuses.filter(post => post.createdAt >= cutoffDate);
  }
  
  /**
   * Initialize status distribution chart
   */
  initStatusChart() {
    // Destroy existing chart if it exists
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    
    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Published', 'Processing', 'Failed'],
        datasets: [{
          data: [this.publishedPosts, this.processingPosts, this.failedPosts],
          backgroundColor: [
            'rgba(var(--ion-color-success-rgb), 0.7)',
            'rgba(var(--ion-color-warning-rgb), 0.7)',
            'rgba(var(--ion-color-danger-rgb), 0.7)'
          ],
          borderColor: [
            'var(--ion-color-success)',
            'var(--ion-color-warning)',
            'var(--ion-color-danger)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  /**
   * Initialize posting timeline chart
   */
  initTimelineChart() {
    // Destroy existing chart if it exists
    if (this.timelineChart) {
      this.timelineChart.destroy();
    }
    
    const ctx = document.getElementById('timelineChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    // Get filtered posts
    const filteredPosts = this.filterPostsByTimePeriod();
    
    // Group posts by date
    const postsByDate = this.groupPostsByDate(filteredPosts);
    
    // Prepare data for chart
    const labels = Object.keys(postsByDate).sort();
    const publishedData = labels.map(date => postsByDate[date].published || 0);
    const failedData = labels.map(date => postsByDate[date].failed || 0);
    
    this.timelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Published',
            data: publishedData,
            borderColor: 'var(--ion-color-success)',
            backgroundColor: 'rgba(var(--ion-color-success-rgb), 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Failed',
            data: failedData,
            borderColor: 'var(--ion-color-danger)',
            backgroundColor: 'rgba(var(--ion-color-danger-rgb), 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  /**
   * Group posts by date
   */
  groupPostsByDate(posts: TikTokPostStatus[]): Record<string, { published: number, failed: number }> {
    const result: Record<string, { published: number, failed: number }> = {};
    
    posts.forEach(post => {
      const dateStr = post.createdAt.toISOString().split('T')[0];
      
      if (!result[dateStr]) {
        result[dateStr] = { published: 0, failed: 0 };
      }
      
      if (post.status === 'PUBLISHED') {
        result[dateStr].published++;
      } else if (post.status === 'FAILED') {
        result[dateStr].failed++;
      }
    });
    
    return result;
  }
  
  /**
   * Change time period filter
   */
  changeTimePeriod(period: 'week' | 'month' | 'all') {
    this.timePeriod = period;
    this.calculateAnalytics();
    this.initStatusChart();
    this.initTimelineChart();
  }
  
  /**
   * Get success rate percentage
   */
  getSuccessRate(): number {
    if (this.totalPosts === 0) return 0;
    return Math.round((this.publishedPosts / this.totalPosts) * 100);
  }
}
