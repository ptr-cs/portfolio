import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { language } from '../../translations/language';
import { DatePipe } from '@angular/common';

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
    }
    gems?: {
        gemsData: TranslationEntry;
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
        email: TranslationEntry;
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
    English:  { languageCode: "en", countryCode: "us" },
    Japanese: { languageCode: "ja", countryCode: "jp" },
    German:   { languageCode: "de", countryCode: "de" },
    Italian:  { languageCode: "it", countryCode: "it" },
    Norwegian:{ languageCode: "no", countryCode: "no" },
    Swedish:  { languageCode: "sv", countryCode: "se" },
    Danish:   { languageCode: "da", countryCode: "dk" },
    French:   { languageCode: "fr", countryCode: "fr" },
};

    public translationData?: TranslationData;

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
        
        const languageEntry = this.supportedLanguages[language];

        if (languageEntry) {
            this.language = languageEntry.languageCode;
        }
    }
    
    translateGemEntry(gem: string): string {
        const entry =  this.translationData?.gems?.[gem as keyof typeof this.translationData.gems];
        return this.getText(entry) ?? "";
    }
    
    getFormattedDate(date: Date): string {
        return this.datePipe.transform(date, "medium", undefined, this.language) ?? '';
    }
}
