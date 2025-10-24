import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  signal,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { OverlayContainer, FullscreenOverlayContainer } from '@angular/cdk/overlay';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ThemeService } from '../../services/theme.service';
import { LampService } from '../../services/lamp.service';

import { LavaLampWallComponent } from '../../lava-lamp-wall/lava-lamp-wall.component';
import { LavaLampSingleComponent } from '../../lava-lamp-single/lava-lamp-single.component';
import { ResumeComponent } from '../resume/resume.component';
import { ContactComponent } from '../contact/contact.component';
import { GemstonesComponent } from '../../gemstones/gemstones.component';
import { ScrollSpy } from 'bootstrap';
import { InViewportDirective } from '../../util/in-viewport.directive';
import { GemstoneDashComponent } from '../../gemstone-dash/gemstone-dash.component'
import { SettingsService } from '../../services/settings.service';
import { getFullscreenElement } from '../../util/fullscreen-utils';
import { LanguageService } from '../../services/language.service';
import { ACTIVE_SCENE_KEY, PerformanceService } from '../../services/performance.service';
import { ScrollIntoViewOnFocusDirective } from '../../util/scroll-into-view-on-focus.directive';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, FormsModule, LavaLampWallComponent, LavaLampSingleComponent, ResumeComponent, ContactComponent, GemstonesComponent, InViewportDirective, GemstoneDashComponent, ScrollIntoViewOnFocusDirective ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None, // set for the tooltips to recieve custom styling 
  providers: [{ provide: OverlayContainer, useClass: FullscreenOverlayContainer }]
})
export class HomeComponent implements OnDestroy {
  active = signal('');
  
  private scrollSpy?: ScrollSpy;

  @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLDivElement>;
  @ViewChild('contentContainer', { static: true }) contentContainer!: ElementRef<HTMLDivElement>;

  constructor(
    public readonly lamp: LampService,
    private settingsService: SettingsService,
    public themeService: ThemeService,
    public languageService: LanguageService,
    public performanceService: PerformanceService
  ) {}
  
  private onFullscreenChange = () => {
    let isFullscreen = !!getFullscreenElement();
    this.settingsService.setFullscreenActive(isFullscreen);
  };
  
  ngOnInit(): void {
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.onFullscreenChange);
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.performanceService.setHomeLoaded(true);
      this.performanceService.setActiveScene(this.performanceService.activeScene);
    }, 250);
  }

  ngOnDestroy(): void {
    this.scrollSpy?.dispose();
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.onFullscreenChange);
  }
  
  goToSection(sectionId: string): void {
    let element = document.querySelector(`#${sectionId}`)
    if (element)
      element.scrollIntoView({ behavior: 'smooth'});
  }
  
  sceneClicked(sceneKey: ACTIVE_SCENE_KEY) {
    if (this.performanceService.activeScene !== sceneKey)
      this.performanceService.setActiveScene(sceneKey);
  }
}
