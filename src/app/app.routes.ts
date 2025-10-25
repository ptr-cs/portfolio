import { Router, Routes } from '@angular/router';

import { HomeComponent } from '../app/pages/home/home.component';
import { ResumeComponent } from '../app/pages/resume/resume.component';
import { ContactComponent } from '../app/pages/contact/contact.component';
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