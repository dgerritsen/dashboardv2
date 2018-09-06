import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-picks-history',
  templateUrl: './history.component.html',
  styleUrls: ['./picks.component.scss']
})
export class PicksHistoryComponent implements OnInit {

  hours = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  days = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'];

  weekView = {
    title: {
      text: 'Weekoverzicht'
    },
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      y: '10%'
    },
    xAxis: {
      type: 'category',
      data: this.hours,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: this.days,
      inverse: true,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 250,
      calculable: true,
      bottom: '10%',
      orient: 'horizontal',
      left: 'center',
      inRange: {
        color: ['#DD4B4B', '#E5CF25', '#79BF34'],
      }
    },
    series: [{
      name: '',
      type: 'heatmap',
      data: [
        [0, 0, 46],
        [1, 0, 62],
        [2, 0, 21],
        [3, 0, 54],
        [4, 0, 44],
        [5, 0, 159],
        [6, 0, 107],
        [7, 0, 212],
        [8, 0, 103],
        [9, 0, 178],
        [10, 0, 201],
        [11, 0, 279],
        [12, 0, 143],
        [13, 0, 80],
        [14, 0, 0],
        [0, 1, 72],
      ],
      label: {
        normal: {
          show: true
        }
      },
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };


  pieChartData: any = {
    legendData: [],
    seriesData: [],
    selected: []
  };

  pieChart = {
    title : {
      text: 'Picks per werknemer',
      x: 'center'
    },
    tooltip : {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20,
      data: [],
    },
    series : [
      {
        name: '',
        type: 'pie',
        radius : '50%',
        center: 'center',
        data: [],
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  pieChartInstance: any;

  constructor() {}

  onPieChartInit(ec) {
    this.pieChartInstance = ec;
    let data = this.genData(15);
    this.pieChart.series[0].data = data.seriesData;
    this.pieChart.legend.data = data.legendData;
    this.pieChartInstance.setOption(this.pieChart);
  }

  ngOnInit() {
    if (this.pieChartInstance) {

    }
  }

  genData = (count) => {
    const legendData = [
      'Dion Gerritsen',
      'Jurre Kruse',
      'Marcel Wijnstekers',
    ];
    const seriesData = [
      { name: 'Dion Gerritsen', value: 121 },
      { name: 'Jurre Kruse', value: 89 },
      { name: 'Marcel Wijnstekers', value: 20 },
    ];

    return {
      legendData: legendData,
      seriesData: seriesData,
    };
  }
}
