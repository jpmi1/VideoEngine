import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpreadsheetImportService, VideoSpecification } from './spreadsheet-import.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-spreadsheet-import',
  templateUrl: './spreadsheet-import.component.html',
  styleUrls: ['./spreadsheet-import.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SpreadsheetImportComponent implements OnInit {
  file: File | null = null;
  fileName: string = '';
  isUploading: boolean = false;
  uploadProgress: number = 0;
  spreadsheetData: any[] = [];
  headers: string[] = [];
  validationErrors: string[] = [];
  isValid: boolean = false;
  requiredColumns: string[] = ['name', 'length', 'script', 'style'];
  
  // Processing options
  addCaptions: boolean = true;
  addBackgroundMusic: boolean = true;
  extendVideoSegments: boolean = true;
  
  constructor(private spreadsheetService: SpreadsheetImportService) { }

  ngOnInit() { }

  /**
   * Handle file selection from the file input
   */
  onFileChange(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.file = files[0];
      this.fileName = this.file.name;
      this.readFile();
    }
  }

  /**
   * Read the selected spreadsheet file
   */
  readFile() {
    if (!this.file) return;
    
    this.isUploading = true;
    this.uploadProgress = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.parseFile();
      }
    }, 100);
  }

  /**
   * Parse the spreadsheet file content
   */
  parseFile() {
    if (!this.file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      this.spreadsheetData = XLSX.utils.sheet_to_json(worksheet);
      
      // Extract headers
      if (this.spreadsheetData.length > 0) {
        this.headers = Object.keys(this.spreadsheetData[0]);
      }
      
      this.validateData();
      this.isUploading = false;
    };
    
    reader.readAsBinaryString(this.file);
  }

  /**
   * Validate the imported spreadsheet data
   */
  validateData() {
    this.validationErrors = [];
    
    // Check for required columns
    const missingColumns = this.requiredColumns.filter(col => 
      !this.headers.some(header => header.toLowerCase() === col.toLowerCase())
    );
    
    if (missingColumns.length > 0) {
      this.validationErrors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    // Check for empty data
    if (this.spreadsheetData.length === 0) {
      this.validationErrors.push('Spreadsheet contains no data');
    }
    
    // Validate each row
    this.spreadsheetData.forEach((row, index) => {
      const rowErrors = this.spreadsheetService.validateRow(row, this.headers);
      if (rowErrors.length > 0) {
        rowErrors.forEach(error => {
          this.validationErrors.push(`Row ${index + 1}: ${error}`);
        });
      }
    });
    
    this.isValid = this.validationErrors.length === 0;
  }

  /**
   * Reset the form and clear data
   */
  resetForm() {
    this.file = null;
    this.fileName = '';
    this.spreadsheetData = [];
    this.headers = [];
    this.validationErrors = [];
    this.isValid = false;
    this.isUploading = false;
    this.uploadProgress = 0;
    this.addCaptions = true;
    this.addBackgroundMusic = true;
    this.extendVideoSegments = true;
  }

  /**
   * Process the validated data
   */
  processData() {
    if (!this.isValid) return;
    
    // Map data to standardized format
    const processedData: VideoSpecification[] = this.spreadsheetData.map(row => {
      // Find the actual column names (case insensitive)
      const nameHeader = this.headers.find(h => h.toLowerCase() === 'name');
      const lengthHeader = this.headers.find(h => h.toLowerCase() === 'length');
      const scriptHeader = this.headers.find(h => h.toLowerCase() === 'script');
      const styleHeader = this.headers.find(h => h.toLowerCase() === 'style');
      
      return {
        name: nameHeader ? row[nameHeader] : '',
        length: lengthHeader ? this.spreadsheetService.normalizeLength(row[lengthHeader]) : 0,
        script: scriptHeader ? row[scriptHeader] : '',
        style: styleHeader ? row[styleHeader] : 'default',
        // Processing options
        addCaptions: this.addCaptions,
        addBackgroundMusic: this.addBackgroundMusic,
        extendVideoSegments: this.extendVideoSegments
      };
    });
    
    // Store the processed data in the service
    this.spreadsheetService.setVideoSpecifications(processedData);
    
    // In a real app, you would navigate to the next screen or emit an event
    console.log('Processed data:', processedData);
    
    // Return the processed data (in a real app, you might emit an event instead)
    return processedData;
  }

  /**
   * Download a template spreadsheet
   */
  downloadTemplate() {
    const template = [
      {
        name: 'Example Video 1',
        length: '0:45',
        script: 'This is an example script for the first video.',
        style: 'modern'
      },
      {
        name: 'Example Video 2',
        length: '1:30',
        script: 'This is an example script for the second video.',
        style: 'vintage'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Videos');
    
    XLSX.writeFile(workbook, 'video_template.xlsx');
  }
}
