import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { language } from '../../translations/language';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

export type TranslationEntry = {
  [languageCode: string]: string;
};
export interface TranslationData {
    languages?: TranslationEntry[];
    header?: {
        ptrcs: TranslationEntry;
        menuHome: TranslationEntry;
        menuResume: TranslationEntry;
        menuContact: TranslationEntry;
        theme: TranslationEntry;
        themeLight: TranslationEntry;
        themeDark: TranslationEntry;
        gitHub: TranslationEntry;
        language: TranslationEntry;
    }
    home?: {
        services: TranslationEntry;
        hi: TranslationEntry;
        softwareEngineer: TranslationEntry;
        buttonResume: TranslationEntry;
        buttonContact: TranslationEntry;
    }
    about?: {
        aboutMe: TranslationEntry;
        iLoveToBuild: TranslationEntry;
        specialization: TranslationEntry;
    }
    resume?: {
        resume: TranslationEntry;
        experienceHeader: TranslationEntry;
        publicationsHeader: TranslationEntry;
        educationHeader: TranslationEntry;
        highlightsHeader: TranslationEntry;
        skillsHeader: TranslationEntry;
        experience: {
            duration: TranslationEntry;
            role: TranslationEntry;
            organization: TranslationEntry;
            description: TranslationEntry;
            location: TranslationEntry;
        }[];
        publications: {
            publicationDate: TranslationEntry;
            description: TranslationEntry;
            location: TranslationEntry;
            link: TranslationEntry;
            organization: TranslationEntry;
        }[];
        education: {
            institution: TranslationEntry;
            location: TranslationEntry;
            duration: TranslationEntry;
            degree: TranslationEntry;
            highlights: TranslationEntry[];
        }[];
        skills: TranslationEntry[];
    }
    gems?: {
        gemsData: TranslationEntry;
        data: TranslationEntry;
        pauseData: TranslationEntry;
        resumeData: TranslationEntry;
        totalValue: TranslationEntry;
        totalValueTooltip: TranslationEntry;
        averageValue: TranslationEntry;
        averageValueTooltip: TranslationEntry;
        averageSize: TranslationEntry;
        averageSizeTooltip: TranslationEntry;
        averageRoughness: TranslationEntry;
        averageRoughnessTooltip: TranslationEntry;
        distribution: TranslationEntry;
        distributionTooltip: TranslationEntry;
        diamond: TranslationEntry;
        sapphire: TranslationEntry;
        ruby: TranslationEntry;
        emerald: TranslationEntry;
        topaz: TranslationEntry;
        amethyst: TranslationEntry;
        totalValueHistory: TranslationEntry;
        totalValueHistoryTooltip: TranslationEntry;
        mostRecentGems: TranslationEntry;
        mostRecentGemsTooltip: TranslationEntry;
        carats: TranslationEntry;
        time: TranslationEntry;
        totalValueChartLabel: TranslationEntry;
    },
    contact?: {
        contactInfo: TranslationEntry;
        contactInfoSubtext: TranslationEntry;
    },
    accessibility?: {
        accessibleControlsOn: TranslationEntry;
        accessibleControlsOff: TranslationEntry;
        rotate: TranslationEntry;
        rotateTooltip: TranslationEntry;
        rotateLeft: TranslationEntry;
        rotateRight: TranslationEntry;
        rotateUp: TranslationEntry;
        rotateDown: TranslationEntry;
        zoom: TranslationEntry;
        zoomTooltip: TranslationEntry;
        zoomIn: TranslationEntry;
        zoomOut: TranslationEntry;
    },
    settings?: {
        settings: TranslationEntry;
        theme: TranslationEntry;
        themeTooltip: TranslationEntry;
        themeLight: TranslationEntry;
        themeDark: TranslationEntry;
        display: TranslationEntry;
        displayTooltip: TranslationEntry;
        displayFullscreen: TranslationEntry;
        displayExitFullscreen: TranslationEntry;
        stats: TranslationEntry;
        statsTooltip: TranslationEntry;
        statsShow: TranslationEntry;
        statsHide: TranslationEntry;
        autoHideSettings: TranslationEntry;
        autoHideSettingsTooltip: TranslationEntry;
        autoHideSettingsShow: TranslationEntry;
        autoHideSettingsHide: TranslationEntry;
        color: TranslationEntry;
        colorTooltip: TranslationEntry;
        colorRandom: TranslationEntry;
        colorChoose: TranslationEntry;
        colorHex: TranslationEntry;
    }
}

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    
public supportedLanguages: {
    [languageName: string]: {
        languageCode: string; // ISO 639-1
        countryCode: string;  // ISO 3166-1 alpha-2
    };
    } = {
    English:  { languageCode: "en", countryCode: "US" },
    Japanese: { languageCode: "ja", countryCode: "JP" },
    German:   { languageCode: "de", countryCode: "DE" },
    Italian:  { languageCode: "it", countryCode: "IT" },
    Norwegian:{ languageCode: "no", countryCode: "NO" },
    Swedish:  { languageCode: "sv", countryCode: "SE" },
    Danish:   { languageCode: "da", countryCode: "DK" },
    French:   { languageCode: "fr", countryCode: "FR" },
    Spanish:  { languageCode: "es", countryCode: "ES"}
};

    public translationData?: TranslationData;
    private router = inject(Router);

    private readonly key = 'app-language';

    private _language$ = new BehaviorSubject<string>('en');
    language$ = this._language$.asObservable();

    constructor(private http: HttpClient, public datePipe: DatePipe) {
        const savedLang = localStorage.getItem(this.key);
        if (savedLang) {
            this._language$.next(savedLang);
        }

        if (this.translationData) return;

        this.translationData = language.translations;
    }

    get language(): string {
        return this._language$.value;
    }

    set language(language: string) {
        localStorage.setItem(this.key, language);
        this._language$.next(language);
    }
    
    getText(text: TranslationEntry | undefined): string {
        if (!text) return "";

        const languageCode = Object.values(this.supportedLanguages)
            .find(lang => lang.languageCode === this.language)?.languageCode;

        if (!languageCode) return "";

        return text[languageCode] || "";
    }
    
    getFlagClass(translationEntry: TranslationEntry): string {
        const language = translationEntry['en'];
        if (!language) return "";

        const entry = this.supportedLanguages[language];

        return `fi-${entry!.countryCode.toLowerCase()}`;
    }
    
    getFlagClassByLanguageCode(languageCode: string) : string {
        const entry = Object.values(this.supportedLanguages).find(
            lang => lang.languageCode === languageCode
        );
        
        if (!entry) return "";

        return `fi-${entry.countryCode.toLowerCase()}`;
    }
    
    setLanguage(translationEntry: TranslationEntry): void {
        const language = translationEntry['en'];
        if (!language) return;
        
        const entry = this.supportedLanguages[language];
        
        if (entry) {
            this.language = entry.languageCode;
            
            this.prepareRouteWithLangParam(this.language);
            
            this.updateDocumentLang(entry.languageCode);
        }
    }
    
    setLanguageByCode(languageCode: string): void {
        const entry = Object.values(this.supportedLanguages).find(
            lang => lang.languageCode === languageCode
        );
        
        if (!entry) return;
        
        if (entry) {
            this.language = languageCode;
            
            this.prepareRouteWithLangParam(this.language);
            
            this.updateDocumentLang(entry.languageCode);
        }
    }
    
    private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
        let r = route;
        while (r.firstChild) r = r.firstChild;
        return r;
    }
    
    private prepareRouteWithLangParam(languageCode: string) {
        const current = this.getDeepestChild(this.router.routerState.root);
        this.router.navigate([], {
        relativeTo: current,
        queryParams: { lang: languageCode },
        queryParamsHandling: 'merge',
        replaceUrl: true,
        fragment: current.snapshot.fragment ? current.snapshot.fragment : ''
        });
    }
    
    translateGemEntry(gem: string): string {
        const entry =  this.translationData?.gems?.[gem as keyof typeof this.translationData.gems];
        return this.getText(entry) ?? "";
    }
    
    getFormattedDate(date: Date): string {
        return this.datePipe.transform(date, "medium", undefined, this.language) ?? '';
    }
    
    getBcp47String(languageCode: string) : string {
        const entry = Object.values(this.supportedLanguages).find(
            lang => lang.languageCode === languageCode
        );
        
        if (!entry) return "";

        return `${entry.languageCode}-${entry.countryCode}`;
    }
    
    applyLanguageFromUrl(): void {
        const url = new URL(window.location.href);
        const langParam = url.searchParams.get('lang');

        if (!langParam) return;

        const entry = Object.values(this.supportedLanguages).find(
            (lang: any) => lang.languageCode === langParam
        );
        if (entry) {
            this.setLanguageByCode(entry.languageCode);
        }
    }
    
    private updateDocumentLang(languageCode: string): void {
        const html = document.documentElement;
        if (!html) return;

        html.setAttribute('lang', languageCode);
    }
}
