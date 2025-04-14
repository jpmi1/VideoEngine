import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TikTokAuthService } from '../tiktok-auth.service';
import { TikTokPostingService, TikTokPostOptions, TikTokHashtagSuggestion } from '../tiktok-posting.service';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-tiktok-post',
  templateUrl: './tiktok-post.component.html',
  styleUrls: ['./tiktok-post.component.scss']
})
export class TikTokPostComponent implements OnInit {
  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  postForm!: FormGroup;
  selectedFile: File | null = null;
  videoUrl: string | null = null;
  isUploading = false;
  uploadProgress = 0;
  
  privacyOptions = [
    { value: 'PUBLIC_TO_EVERYONE', label: 'Public' },
    { value: 'MUTUAL_FOLLOW_FRIENDS', label: 'Friends' },
    { value: 'FOLLOWER_OF_CREATOR', label: 'Followers' },
    { value: 'SELF_ONLY', label: 'Private' }
  ];
  
  hashtagSuggestions: TikTokHashtagSuggestion[] = [];
  isLoadingHashtags = false;
  
  captionTemplates: Record<string, string> = {};
  selectedTemplate: string | null = null;
  
  optimalPostingTimes: string[] = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private tikTokAuthService: TikTokAuthService,
    private tikTokPostingService: TikTokPostingService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Check if authenticated
    if (!this.tikTokAuthService.isAuthenticated()) {
      this.router.navigate(['/tiktok/auth']);
      return;
    }
    
    // Initialize form
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(2200)]],
      privacyLevel: ['PUBLIC_TO_EVERYONE', Validators.required],
      disableDuet: [false],
      disableStitch: [false],
      disableComment: [false],
      isAigc: [true],
      hashtags: [''],
      mentions: [''],
      scheduleTime: ['']
    });
    
    // Load caption templates
    this.tikTokPostingService.getCaptionTemplates().subscribe(templates => {
      this.captionTemplates = templates;
    });
    
    // Load optimal posting times
    this.tikTokPostingService.getOptimalPostingTimes().subscribe(times => {
      this.optimalPostingTimes = times;
    });
    
    // Set up hashtag suggestions
    this.postForm.get('hashtags')?.valueChanges.pipe(
      debounceTime(500),
      tap(() => {
        this.isLoadingHashtags = true;
      }),
      switchMap(value => {
        if (!value || value.length < 3) {
          this.isLoadingHashtags = false;
          return of([]);
        }
        
        const keywords = value.split(/[,\s]+/).filter((k: string) => k.length > 0);
        if (keywords.length === 0) {
          this.isLoadingHashtags = false;
          return of([]);
        }
        
        return this.tikTokPostingService.getHashtagSuggestions(keywords);
      })
    ).subscribe({
      next: (suggestions) => {
        this.hashtagSuggestions = suggestions;
        this.isLoadingHashtags = false;
      },
      error: () => {
        this.isLoadingHashtags = false;
      }
    });
  }
  
  /**
   * Open file selector
   */
  openFileSelector() {
    this.fileInput.nativeElement.click();
  }
  
  /**
   * Handle file selection
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        this.presentToast('Please select a video file', 'danger');
        return;
      }
      
      // Check file size (TikTok limit is 500MB, but we'll use 300MB to be safe)
      if (file.size > 300 * 1024 * 1024) {
        this.presentToast('Video file is too large. Maximum size is 300MB', 'danger');
        return;
      }
      
      this.selectedFile = file;
      this.videoUrl = URL.createObjectURL(file);
      
      // Reset form if a new file is selected
      if (this.postForm.get('title')?.value === '') {
        this.postForm.patchValue({
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        });
      }
    }
  }
  
  /**
   * Apply caption template
   */
  applyTemplate(templateKey: string) {
    this.selectedTemplate = templateKey;
    let template = this.captionTemplates[templateKey];
    
    // Replace placeholders with user input
    const placeholders = template.match(/\{([^}]+)\}/g);
    
    if (placeholders) {
      this.presentTemplateInputAlert(templateKey, placeholders, template);
    } else {
      this.postForm.patchValue({ title: template });
    }
  }
  
  /**
   * Present alert to input template placeholders
   */
  async presentTemplateInputAlert(templateKey: string, placeholders: string[], template: string) {
    const inputs = placeholders.map(placeholder => {
      const field = placeholder.replace(/[{}]/g, '');
      return {
        name: field,
        type: 'text',
        placeholder: `Enter ${field.replace(/_/g, ' ')}`
      };
    });
    
    const alert = await this.alertController.create({
      header: 'Complete Template',
      inputs,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Apply',
          handler: (data) => {
            let filledTemplate = template;
            
            // Replace each placeholder with user input
            Object.keys(data).forEach(key => {
              const regex = new RegExp(`\\{${key}\\}`, 'g');
              filledTemplate = filledTemplate.replace(regex, data[key]);
            });
            
            this.postForm.patchValue({ title: filledTemplate });
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  /**
   * Add hashtag to caption
   */
  addHashtag(hashtag: string) {
    const currentHashtags = this.postForm.get('hashtags')?.value || '';
    const hashtagsArray = currentHashtags.split(/[,\s]+/).filter((h: string) => h.length > 0);
    
    // Add hashtag if not already present
    if (!hashtagsArray.includes(hashtag)) {
      hashtagsArray.push(hashtag);
      this.postForm.patchValue({
        hashtags: hashtagsArray.join(' ')
      });
    }
  }
  
  /**
   * Set optimal posting time
   */
  setPostingTime(time: string) {
    // Get current date
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    // Set time for today
    const scheduleDate = new Date(now);
    scheduleDate.setHours(hours, minutes, 0, 0);
    
    // If time is in the past, schedule for tomorrow
    if (scheduleDate < now) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }
    
    this.postForm.patchValue({
      scheduleTime: scheduleDate.toISOString()
    });
  }
  
  /**
   * Submit post to TikTok
   */
  async submitPost() {
    if (!this.selectedFile) {
      this.presentToast('Please select a video file', 'danger');
      return;
    }
    
    if (this.postForm.invalid) {
      this.presentToast('Please fill in all required fields', 'danger');
      return;
    }
    
    const formValues = this.postForm.value;
    
    // Prepare post options
    const postOptions: TikTokPostOptions = {
      title: formValues.title,
      privacyLevel: formValues.privacyLevel,
      disableDuet: formValues.disableDuet,
      disableStitch: formValues.disableStitch,
      disableComment: formValues.disableComment,
      isAigc: formValues.isAigc,
      hashtags: formValues.hashtags ? formValues.hashtags.split(/[,\s]+/).filter((h: string) => h.length > 0) : [],
      mentions: formValues.mentions ? formValues.mentions.split(/[,\s]+/).filter((m: string) => m.length > 0) : []
    };
    
    // Show loading indicator
    const loading = await this.loadingController.create({
      message: 'Uploading video to TikTok...',
      backdropDismiss: false
    });
    await loading.present();
    
    this.isUploading = true;
    
    // Initialize post
    this.tikTokPostingService.initializePost(this.selectedFile, postOptions).subscribe({
      next: (response) => {
        this.isUploading = false;
        loading.dismiss();
        this.presentToast('Video uploaded successfully! It will be published to TikTok shortly.', 'success');
        
        // Navigate to status page or dashboard
        this.router.navigate(['/tiktok/status']);
      },
      error: (error) => {
        this.isUploading = false;
        loading.dismiss();
        this.presentToast(`Error uploading video: ${error.message || 'Unknown error'}`, 'danger');
      }
    });
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
  
  /**
   * Reset form and selected file
   */
  resetForm() {
    this.postForm.reset({
      privacyLevel: 'PUBLIC_TO_EVERYONE',
      disableDuet: false,
      disableStitch: false,
      disableComment: false,
      isAigc: true
    });
    
    this.selectedFile = null;
    this.videoUrl = null;
    
    if (this.videoPreview) {
      this.videoPreview.nativeElement.src = '';
      this.videoPreview.nativeElement.load();
    }
  }
}
