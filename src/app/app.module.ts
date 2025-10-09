import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app.routes';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MiniColorPickerComponent } from './util/mini-color-picker/mini-color-picker';
import { OverlayContainer, FullscreenOverlayContainer } from '@angular/cdk/overlay';
import { LavaLampWallComponent } from  './lava-lamp-wall/lava-lamp-wall.component'

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    ContactComponent,
    MiniColorPickerComponent,
    LavaLampWallComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,
    FormsModule
  ],
  providers: [{ provide: OverlayContainer, useClass: FullscreenOverlayContainer }],
  bootstrap: [AppComponent]
})
export class AppModule { }
