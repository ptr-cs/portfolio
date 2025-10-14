import { Component, OnDestroy, Renderer2, NgZone, signal, ViewChild, ElementRef } from '@angular/core';
import { Chart, LineController, DoughnutController, CategoryScale, LinearScale, ArcElement, PointElement, LineElement, Filler, ChartConfiguration } from 'chart.js'
import { GemsService } from '../services/gems.service';
import { Subscription } from 'rxjs';
import { CommonModule, formatCurrency } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { LampService } from '../services/lamp.service';
import { getDefaultTheme, Theme, ThemeService } from '../services/theme.service';
import { LanguageService } from '../services/language.service';
import { language } from '../../translations/language';

Chart.register(DoughnutController, LineController, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, ChartDataLabels, Filler);

@Component({
  selector: 'gemstone-dash',
  templateUrl: './gemstone-dash.component.html',
  styleUrls: ['./gemstone-dash.component.scss'],
  imports: [MatTooltip, CommonModule]
})
export class GemstoneDashComponent implements OnDestroy {

  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef<HTMLCanvasElement>;
  distributionChart!: Chart;

  @ViewChild('totalValueHistoryChart') totalValueHistoryChartRef!: ElementRef<HTMLCanvasElement>;
  totalValueHistoryChart!: Chart;

  gemsSubTotalValue?: Subscription;
  gemsSubAverageValue?: Subscription;
  gemsSubAverageScale?: Subscription;
  gemsSubAverageRoughness?: Subscription;
  gemsSubDistribution?: Subscription;
  gemsSubTotalValueHistory?: Subscription;
  gemsSubRecentlyAdded?: Subscription;
  lampSub?: Subscription;
  themeSub?: Subscription;
  languageSub?: Subscription;

  totalValueString = signal("");
  averageValueString = signal("");
  averageScaleString = signal("");
  averageRoughnessString = signal("");
  mostRecentItems: any[] = [];
  
  formatCurrency = formatCurrency;
  
  theme: Theme = getDefaultTheme();
  pointBorderColorContrast = '#222';

  constructor(
    private renderer: Renderer2, 
    private zone: NgZone, 
    private gemsService: GemsService, 
    private lampService: LampService,
    public themeService: ThemeService,
    public languageService: LanguageService) {
  }
  ngOnDestroy(): void {
    this.gemsSubTotalValue?.unsubscribe()
    this.gemsSubAverageValue?.unsubscribe()
    this.gemsSubAverageScale?.unsubscribe()
    this.gemsSubAverageRoughness?.unsubscribe()
    this.gemsSubDistribution?.unsubscribe()
    this.gemsSubTotalValueHistory?.unsubscribe();
    this.lampSub?.unsubscribe();
    this.themeSub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.gemsSubTotalValue = this.gemsService.totalValue$.subscribe(v => {
      this.totalValueString.set(formatCurrency(v, this.languageService.language, "$", "USD"))
    });

    this.gemsSubAverageValue = this.gemsService.averageValue$.subscribe(v => {
      this.averageValueString.set(formatCurrency(v, this.languageService.language, "$", "USD"))
    });

    this.gemsSubAverageScale = this.gemsService.averageScale$.subscribe(s => {
      this.averageScaleString.set((s).toFixed(2).toString() + " " + this.languageService.translateGemEntry("carats"))
    });

    this.gemsSubAverageRoughness = this.gemsService.averageRoughness$.subscribe(r => {
      this.averageRoughnessString.set(((r.toFixed(4)) + "%").toString())
    });

    this.gemsSubDistribution = this.gemsService.distribution$.subscribe(d => {
      if (this.distributionChart) {
        this.updateChartData(this.distributionChart, d);
      }
    });

    this.gemsSubTotalValueHistory = this.gemsService.totalValueHistory$.subscribe(v => {
      if (this.totalValueHistoryChart) {
        this.updateChartData(this.totalValueHistoryChart, v);
      }
    });
    
    this.gemsSubRecentlyAdded = this.gemsService.recentlyAdded$.subscribe(r => {
      this.mostRecentItems = (r);
    });
    
    this.languageSub = this.languageService.language$.subscribe(l => {
      this.updateChartLabels();
    });
    
    this.themeSub = this.themeService.theme$.subscribe(t => {
      this.updateChartColors(this.themeService.theme);
    });

    const distributionChartCtx = this.doughnutChartRef.nativeElement.getContext('2d');
    const totalValueHistoryCtx = this.totalValueHistoryChartRef.nativeElement.getContext('2d');

    const distributionChartLabels = [
      'Diamond',
      'Ruby',
      'Emerald',
      'Sapphire',
      'Topaz',
      'Amethyst'
    ];

    const distributionChartColors = [
      '#ffffff',
      '#ff4b4b',
      '#34d399',
      '#3b82f6',
      '#facc15',
      '#a855f7'
    ];

    const distributionChartConfig: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: distributionChartLabels,
        datasets: [{
          label: 'Gemstone Distribution',
          data: [],
          backgroundColor: distributionChartColors,
          borderColor: '#1a1a1a',
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: '#000000',
            font: {
              size: 18,
              weight: 'bold'
            },
            formatter: (value: any) => value,
            display: (context: any) => {
              return context.dataset.data[context.dataIndex] !== 0;
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    };

    const totalValueLabels = Array.from({ length: 20 }, (_, i) => `T${i + 1}`);

    const totalValueChartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: totalValueLabels,
        datasets: [{
          label: 'Total Gemstone Value Over Time',
          data: [],
          fill: false,
          borderColor: '#ddd',
          backgroundColor: '#ddd',
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#ddd',
          pointBorderColor: '#eee'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 100
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            },
            grid: {
              color: '#888'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Total Value (USD)'
            },
            grid: {
              color: '#888'
            }
          }
        },
        plugins: {
        datalabels: {
          display: false
        }
      },
      }
    };

    this.zone.runOutsideAngular(() => {
      if (distributionChartCtx) {
        this.distributionChart = new Chart(distributionChartCtx, distributionChartConfig);
      }
      if (totalValueHistoryCtx) {
        this.totalValueHistoryChart = new Chart(totalValueHistoryCtx, totalValueChartConfig);
      }
    });
    
    this.updateChartColors(this.themeService.theme);
    this.updateChartLabels();
  }
  
  updateChartLabels() {
    if (!this.totalValueHistoryChart) return;
    (this.totalValueHistoryChart.options.scales!['x'] as any)!.title!.text = this.languageService.translateGemEntry("time");
    (this.totalValueHistoryChart.options.scales!['y'] as any)!.title!.text = this.languageService.translateGemEntry("totalValueChartLabel") + " (USD)";
    this.totalValueHistoryChart.update();
  }
  
  updateChartColors(t: Theme) {
    if (this.totalValueHistoryChart) {
        const pointColor = t === 'dark' ? '#eee' : '#000';
        const pointBorderColor = t === 'dark' ? '#222' : '#eee';
        const labelColor = t === 'dark' ? '#eee' : '#000';
        
        this.totalValueHistoryChart.options.scales!['x']!.ticks!.color = labelColor;
        (this.totalValueHistoryChart.options.scales!['x'] as any)!.title!.color = labelColor;
        this.totalValueHistoryChart.options.scales!['y']!.ticks!.color = labelColor;
        (this.totalValueHistoryChart.options.scales!['y'] as any)!.title!.color = labelColor;
        
        this.totalValueHistoryChart.data.datasets[0].backgroundColor = pointColor;
          this.totalValueHistoryChart.data.datasets[0].borderColor = pointColor;
          (this.totalValueHistoryChart.data.datasets[0] as any).pointBackgroundColor = pointColor;
          (this.totalValueHistoryChart.data.datasets[0] as any).pointBorderColor = pointBorderColor;
        
        this.totalValueHistoryChart.update();
      }
  }

  updateChartData(chart: Chart, newData: number[]) {
    chart.data.datasets[0].data = [];
    chart.data.datasets[0].data = newData;
    chart.update();
  }
}