import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { Resume } from './resume.model'
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume',
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent {
  resumeData?: Resume;
  
  constructor(public themeService: ThemeService, private http: HttpClient) 
  {
    http.get<Resume>('assets/resume.json')
      .subscribe({
        next: data => this.resumeData = data,
        error: err => console.info('assets/resume.json not found, skipping...', err)
      });
  }
}

