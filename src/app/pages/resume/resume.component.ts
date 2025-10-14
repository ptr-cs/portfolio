import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { Resume } from './resume.model'
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-resume',
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent {
  resumeData?: Resume;
  
  constructor(public themeService: ThemeService, public languageService: LanguageService) { }
}

