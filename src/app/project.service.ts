import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { VideoSpecification } from './spreadsheet-import.service';

export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  videoCount: number;
  apiProvider: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: ProjectMetadata[] = [];
  
  constructor(private http: HttpClient) { }

  /**
   * Create a new project with the given specifications
   */
  createProject(name: string, description: string, apiProvider: string, specifications: VideoSpecification[]): Observable<ProjectMetadata> {
    // In a real app, this would make an API call to create the project
    // For now, we'll simulate it locally
    
    const projectId = `project-${Date.now()}`;
    const newProject: ProjectMetadata = {
      id: projectId,
      name,
      description,
      createdAt: new Date(),
      videoCount: specifications.length,
      apiProvider
    };
    
    // Store project metadata
    this.projects.push(newProject);
    
    // In a real app, we would also store the specifications linked to this project
    // For now, we'll just return the project metadata
    return of(newProject);
  }

  /**
   * Get all projects
   */
  getProjects(): Observable<ProjectMetadata[]> {
    // In a real app, this would make an API call to get all projects
    return of(this.projects);
  }

  /**
   * Get a specific project by ID
   */
  getProject(id: string): Observable<ProjectMetadata | undefined> {
    // In a real app, this would make an API call to get a specific project
    const project = this.projects.find(p => p.id === id);
    return of(project);
  }

  /**
   * Delete a project
   */
  deleteProject(id: string): Observable<boolean> {
    // In a real app, this would make an API call to delete the project
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    
    return of(this.projects.length < initialLength);
  }
}
