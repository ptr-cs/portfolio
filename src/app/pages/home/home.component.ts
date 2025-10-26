import {
  Component,
  inject,
  OnDestroy} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OverlayContainer, FullscreenOverlayContainer } from '@angular/cdk/overlay';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { LampService } from '../../services/lamp.service';
import { LavaLampWallComponent } from '../../lava-lamp-wall/lava-lamp-wall.component';
import { LavaLampSingleComponent } from '../../lava-lamp-single/lava-lamp-single.component';
import { ResumeComponent } from '../resume/resume.component';
import { ContactComponent } from '../contact/contact.component';
import { GemstonesComponent } from '../../gemstones/gemstones.component';
import { GemstoneDashComponent } from '../../gemstone-dash/gemstone-dash.component'
import { SettingsService } from '../../services/settings.service';
import { getFullscreenElement } from '../../util/fullscreen-utils';
import { LanguageService } from '../../services/language.service';
import { ACTIVE_SCENE_KEY, PerformanceService } from '../../services/performance.service';
import { NgbScrollSpyModule, NgbScrollSpyService } from '@ng-bootstrap/ng-bootstrap';
import { updateUrl } from '../../util/route-utils';
import { ScrollIntoViewOnFocusDirective } from '../../directives/scroll-into-view-on-focus.directive'

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, FormsModule, LavaLampWallComponent, LavaLampSingleComponent, 
    ResumeComponent, ContactComponent, GemstonesComponent, GemstoneDashComponent, NgbScrollSpyModule, ScrollIntoViewOnFocusDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [{ provide: OverlayContainer, useClass: FullscreenOverlayContainer }]
})
export class HomeComponent implements OnDestroy {
  service = inject(NgbScrollSpyService);
  
  router = inject(Router);

  constructor(
    public readonly lamp: LampService,
    private settingsService: SettingsService,
    public themeService: ThemeService,
    public languageService: LanguageService,
    public performanceService: PerformanceService,
    private location: Location,
    private route: ActivatedRoute
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
      this.performanceService.setActiveScene(this.performanceService.activeScene);
    }, 250);
    setTimeout(() => {
      this.languageService.applyLanguageFromUrl();
    }, 0);
    
    this.service.active$.subscribe((activeId) => {
      if (activeId === "home") {
          this.performanceService.setActiveScene("LAVA_SINGLE") 
          this.performanceService.setActiveScenePaused(false);
          updateUrl("home", this.route, this.router, this.location);
        } else if (activeId === "lavaLampWall") {
          this.performanceService.setActiveScene("LAVA_WALL")
          this.performanceService.setActiveScenePaused(false);
          updateUrl("lavaLampWall", this.route, this.router, this.location);
        } else if (activeId === "gemstones") {
          this.performanceService.setActiveScene("GEMS")
          if (this.performanceService.pausedFromGemsDash === false)
            this.performanceService.setActiveScenePaused(false);
          updateUrl("gemstones", this.route, this.router, this.location);
        } else if (activeId === "gemstonesDash") {
          this.performanceService.setActiveScene("GEMS");
          updateUrl("gemstonesDash", this.route, this.router, this.location);
        } else if (activeId === "contactInfo") {
          this.performanceService.setActiveScene("GEMS");
          updateUrl("contactInfo", this.route, this.router, this.location);
        } else if (activeId === "resumeInfo") {
          this.performanceService.setActiveScene("GEMS");
          updateUrl("resumeInfo", this.route, this.router, this.location);
        } else if (activeId === "about") {
          this.performanceService.setActiveScene("LAVA_WALL");
          updateUrl("about", this.route, this.router, this.location);
        }
        
        this.performanceService.setActiveScrollElement(activeId);
    });
    
    this.service.observe('home');
    this.service.observe('about');
    this.service.observe('lavaLampWall');
    this.service.observe('resumeInfo');
    this.service.observe('gemstones');
    this.service.observe('gemstonesDash');
    this.service.observe('contactInfo');
    
    this.service.start({rootMargin: "-120px"});
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.onFullscreenChange);
  }
  
  sceneClicked(sceneKey: ACTIVE_SCENE_KEY) {
    if (this.performanceService.activeScene !== sceneKey)
      this.performanceService.setActiveScene(sceneKey);
  }
}
