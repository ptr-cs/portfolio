import { Router, Routes } from '@angular/router';

import { HomeComponent } from './components/pages/home/home.component';
import { ResumeComponent } from './components/pages/resume/resume.component';
import { ContactComponent } from './components/pages/contact/contact.component';
import { inject } from '@angular/core';

export const routes: Routes = [
{ path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'resumeInfo', component: ResumeComponent },
  { path: 'contactInfo', component: ContactComponent },
  {
    path: '**',
    redirectTo: (route) =>
      inject(Router).createUrlTree([''], { queryParams: route.queryParams })
  }
];