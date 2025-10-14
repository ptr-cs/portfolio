/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';
import localeDe from '@angular/common/locales/de';
import localeIt from '@angular/common/locales/it';
import localeNo from '@angular/common/locales/no';
import localeSv from '@angular/common/locales/sv';
import localeDa from '@angular/common/locales/da';
import localeFr from '@angular/common/locales/fr';

bootstrapApplication(AppComponent, appConfig)
  //.catch((err) => console.error(err));
registerLocaleData(localeJa);
registerLocaleData(localeDe);
registerLocaleData(localeIt);
registerLocaleData(localeNo);
registerLocaleData(localeSv);
registerLocaleData(localeDa);
registerLocaleData(localeFr);