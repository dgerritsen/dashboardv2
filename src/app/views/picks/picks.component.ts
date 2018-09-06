import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Xml2jsService} from '../../services/xml2js.service';
import {environment} from '../../../environments/environment';
// noinspection TypeScriptCheckImport
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
// noinspection TypeScriptCheckImport
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips/';
import palette from 'google-palette';
import {Restangular} from 'ngx-restangular';
import * as moment from 'moment';
import * as _ from 'lodash';
import {Moment} from 'moment';


declare const $: any;

moment.locale('nl');
moment.utc();

@Component({
  selector: 'app-picks',
  templateUrl: './picks.component.html',
  styleUrls: ['./picks.component.scss']
})
export class PicksComponent implements OnInit {

  settings = {
    xmlFile: environment.xmlApi,
    systemUsers: [
      'Systeem',
      'Crossdock',
      'Lift',
    ],
    hideSystemUsersInTable: true,
  };

  data: any;

  table: any;
  totals: any;
  averages: any;
  graphs: any;

  hours: any = [];
  previousHours: any = [];

  requestParams: any;

  percentageData = {};

  most: any;
  interval;

  constructor(
    public xml2js: Xml2jsService,
    private restangular: Restangular,
  ) { }

  calculateIndividualTotals = (data) => {
    return new Promise<any>(((resolve, reject) => {
      data.forEach(line => {
        let totalPicks = 0;
        let totalOrders = 0;
        line.Pickings.forEach(pick => {
          totalPicks += parseInt(pick.Picked, 0);
          totalOrders += parseInt(pick.OrdersCount, 0);
        });

        line.total = {
          picks: totalPicks,
          orders: totalOrders,
        };
      });

      resolve(data);
    }));
  }

  calculateHourlyAvg = (userset) => {
    return new Promise(resolve => {

      this.populateHours().then((hours: any[]) => {

        hours.forEach(hour => {
          let hTotalPicks = 0;
          let hTotalOrders = 0;
          let amount = 0;
          userset.forEach(user => {
            let hasPicks = false;

            user.Pickings.forEach(pick => {
              if (moment.unix(pick.DateTimeStart).utc().hour() === hour.hour) {
                if (pick.Picked > 2) {
                  hTotalPicks += parseInt(pick.Picked, 0);
                  hTotalOrders += parseInt(pick.OrdersCount, 0);
                  hasPicks = true;
                }
              }
            });

            if (hasPicks) {
              amount++;
            }
          });

          hour.average = {
            picks: Math.round(hTotalPicks / amount),
            orders: Math.round(hTotalOrders  / amount),
          };

        });

        resolve(hours);
      });

    });
  }

  calculateTotals = (data) => {
    return new Promise<any>(((resolve, reject) => {
      const obj = {
        picks: 0,
        orders: 0,
      };

      data.forEach(row => {
        row.Pickings.forEach(pick => {
          obj.picks += parseInt(pick.Picked, 0);
          obj.orders += parseInt(pick.OrdersCount, 0);
        });
      });
      resolve(obj);
    }));
  }

  calculateHourTotals = (userset) => {
    return new Promise<any>(( async (resolve, reject) => {
      this.populateHours().then((hours: any[]) => {

        hours.forEach(hour => {
          let hTotalPicks = 0;
          let hTotalOrders = 0;
          userset.forEach(user => {
            user.Pickings.forEach(pick => {
              if (moment.unix(pick.DateTimeStart).utc().hour() === hour.hour) {
                hTotalPicks += parseInt(pick.Picked, 0);
                hTotalOrders += parseInt(pick.OrdersCount, 0);
              }
            });
          });

          hour.totals = {
            picks: hTotalPicks,
            orders: hTotalOrders,
          };

        });

        resolve(hours);
      });
    }));
  }

  generateLabels = (hours) => {
    return new Promise<any>(resolve => {
      const labels = [];
      hours.forEach(hour => {
        labels.push(hour.hour + ' uur');
      });
      resolve(labels);
    });
  }

  populateHours = () => {
    /**
     * populateHours
     * - data
     *
     * Takes the first user and returns the hours
     * returns: Array with strings
     */

    return new Promise<any>(((resolve, reject) => {
      const hours = [];

      [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].forEach(hour => {
        hours.push({ hour: hour });
      });

      this.hours = hours;
      resolve(hours);
    }));
  }

  generateIndividualGraphData = (userset) => {
    return new Promise<any>(async resolve => {
      const hours = await this.calculateHourTotals(userset);
      const users = [];

      userset.forEach(user => {
        let u = [];
        user.Pickings.forEach(pick => {
          u.push({ hour: moment.unix(pick.DateTimeStart).utc().hour(), picks: pick.Picked });
        });

        hours.forEach(hour => {
          if (u.find(l => l.hour === hour.hour)) {

          } else {
            u.push({ hour: hour.hour, picks: 0 });
          }
        });

        u.sort((a, b) => a.hour - b.hour);
        u = u.map(x => {
          return x.picks;
        });

        users.push({ data: u, label: user.Name });
      });

      resolve(users);

    });
  }

  generateGraphData = (userset) => {
    return new Promise<any>(async resolve => {
      const hours = await this.calculateHourTotals(userset);

      const picks = [];
      const orders = [];

      hours.forEach(hour => {
        picks.push(hour.totals.picks);
        orders.push(hour.totals.orders);
      });

      const data = [
        { data: picks, label: 'Picks' },
        { data: orders, label: 'Orders' },
      ];

      resolve(data);
    });
  }

  hexToRgbA = (hex, opacity = 1) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      // tslint:disable-next-line no-bitwise
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + opacity + ')';
    }
    // throw new Error('Bad Hex');
  }

  generateGraphColors = (userset) => {
    return new Promise<any>(resolve => {
      const colors = [];

      const pal = palette('mpn65', userset.length);
      pal.forEach(p => {
        const obj = {
          backgroundColor: this.hexToRgbA('#' + p, .9),
          borderColor: this.hexToRgbA('#' + p, .55),
        };
        colors.push(obj);
      });
      resolve(colors);
    });
  }

  generateGraph = (userset, optionsid = 0, type = 'line') => {
    const graphOptions = [{
      tooltips: {
        enabled: false,
        custom: CustomTooltips
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          display: false,
        }],
        yAxes: [{
          display: false,
        }]
      },
      elements: {
        line: {
          borderWidth: 2,
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3,
        }
      },
      legend: {
        display: false
      }
    }, {
      tooltips: {
        enabled: false,
        custom: CustomTooltips
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          display: true,
        }],
        yAxes: [{
          display: true,
        }]
      },
      elements: {
        line: {
          borderWidth: 2
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3,
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        fullWidth: true,
      }
    }];

    const graphColors = [{
      backgroundColor: 'rgba(255,255,255,.1)',
      borderColor: 'rgba(255,255,255,.55)',
      pointHoverBackgroundColor: '#fff'
    }, {
      backgroundColor: 'rgba(255,255,255,.05)',
      borderColor: 'rgba(255,255,255,.2)',
      pointHoverBackgroundColor: '#fff'
    }];

    return new Promise<any>(async resolve => {
      const graph = {
        data: [],
        labels: [],
        options: {},
        colors: [],
        legend: optionsid === 1,
        type: type,
      };

      await this.calculateHourTotals(userset).then(async hours => {
        if (optionsid === 1) {
          graph.data = await this.generateIndividualGraphData(userset);
          graph.colors = await this.generateGraphColors(userset);
        } else {
          graph.data = await this.generateGraphData(userset);
          graph.colors = graphColors;
        }
        graph.labels = await this.generateLabels(hours);
        graph.options = graphOptions[optionsid];
      });

      resolve(graph);
    });
  }

  generateNewGraph = (userset) => {
    return new Promise(async (resolve) => {
      const graph = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {show: true},
            mark: {show: true}

          }
        },
        dataZoom: {
          show: true,
          realtime: true,
          height: 20,
        },
        xAxis: [
          {
            type: 'category',
            data: [],
            axisPointer: {
              type: 'shadow'
            },
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Picks',
            min: 0,
            interval: 10,
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: []
      };

      let hours = await this.populateHours();
      hours = hours.map(x => x.hour);
      graph.xAxis[0].data = hours;

      userset.forEach(user => {
        const item = {
          name: user.Name,
          type: 'bar',
          data: [],
        };

        hours.forEach(hour => {
          let hTotal = 0;
          const match = user.Pickings.filter(u => moment.unix(u.DateTimeStart).utc().hour() === hour);
          match.forEach(m => {
            hTotal = hTotal + m.Picked;
          });
          item.data.push(hTotal);
        });
        graph.series.push(item);
      });

      const avg = {
        name: 'Gemiddelde',
        type: 'line',
        smooth: true,
        data: []
      };

      this.averages.otherUsers.forEach(hour => {
        avg.data.push(hour.average.picks);
      });

      graph.series.push(avg);

      resolve(graph);
    });
  }

  generatePieChart = (userset) => {
    return new Promise(resolve => {
      const graph = {
        tooltip : {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [{
          name: 'Picks',
          type: 'pie',
          selectedMode: 'multiple',
          radius: '60%',
          center: 'center',
          data: [],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };

      userset.forEach(user => {
        const obj = {
          name: user.Name,
          value: user.total.picks
        };

        if (obj.value > this.totals.otherUsers.picks / userset.length) {
          graph.series[0].data.push(obj);
        }
      });

      graph.series[0].data = _.orderBy(graph.series[0].data, 'value', 'desc');
      resolve(graph);
    });
  }

  renderGraphs = async (data) => {

    const otherUsers = this.data.filter(user => this.settings.systemUsers.indexOf(user.Name) === -1);
    const systemUsers = this.data.filter(user => this.settings.systemUsers.indexOf(user.Name) !== -1);
    const crossdock = this.data.filter(user => user.Name === 'Crossdock');
    const lift = this.data.filter(user => user.Name === 'Lift');
    const allUsers = this.data;


    const curHours = await this.populateHours();
    if (this.previousHours.length > 0 && this.previousHours.length !== curHours.length) {
      this.resetGraphs().then(async () => {
        this.previousHours = this.hours;

        if (!this.graphs) { this.graphs = {}; }

        this.graphs.otherUsers = await this.generateGraph(otherUsers);
        this.graphs.allUsers = await this.generateGraph(allUsers);
        this.graphs.crossdock = await this.generateGraph(crossdock);
        this.graphs.lift = await this.generateGraph(lift);
        this.graphs.bottom = await this.generateGraph(otherUsers, 1, 'bar');
        this.graphs.bottomtwo = await this.generateNewGraph(otherUsers);
        this.graphs.piechart = await this.generatePieChart(otherUsers);
      });
    } else {
      this.previousHours = this.hours;

      if (!this.graphs) { this.graphs = {}; }

      this.graphs.otherUsers = await this.generateGraph(otherUsers);
      this.graphs.allUsers = await this.generateGraph(allUsers);
      this.graphs.crossdock = await this.generateGraph(crossdock);
      this.graphs.lift = await this.generateGraph(lift);
      this.graphs.bottom = await this.generateGraph(otherUsers, 1, 'bar');
      this.graphs.bottomtwo = await this.generateNewGraph(otherUsers);
      this.graphs.piechart = await this.generatePieChart(otherUsers);
    }
  }

  resetGraphs = () => {
    return new Promise<any>(resolve => {
      this.graphs = null;

      setTimeout(() => {
        resolve(this.graphs);
      }, 10);
    });
  }

  populateTable = (data) => {
    this.table = [];

    data.forEach((point) => {
      if (this.settings.systemUsers.indexOf(point.Name) === -1 && this.settings.hideSystemUsersInTable) {
        this.table.push(point);
      }
    });

  }

  calculatePercentages = (data) => {
    return new Promise<any>(((resolve, reject) => {
      const res = [];

      data.forEach(row => {
        let totals: { picks: number, orders: number };
        totals = this.settings.systemUsers.indexOf(row.Name) === -1 ? this.totals.otherUsers : this.totals.systemUsers;
        row.percentages = {
          picks: Math.round((row.total.picks / totals.picks) * 100),
          orders: Math.round((row.total.orders / totals.orders) * 100),
        };
        res.push(row);
      });

      resolve(res);
    }));
  }

  calculateRatios = (data) => {
    return new Promise<any>(((resolve, reject) => {
      const res = [];

      data.forEach(row => {
        row.ratio = +(row.total.picks / row.total.orders).toFixed(2);
        res.push(row);
      });

      resolve(res);
    }));
  }

  calculatePicksPercentage = (percentage, of) => {
    return new Promise<any>(resolve => {
      resolve(Math.round((percentage.picks / of.picks) * 100));
    });
  }

  calculateLeaders = (userset) => {
    return new Promise<any>(resolve => {
      const mostpicks = userset.sort((a, b) => (a.total.picks < b.total.picks) ? 1 : ((b.total.picks < a.total.picks) ? -1 : 0))[0];
      const mostorders = userset.sort((a, b) => (a.total.orders < b.total.orders) ? 1 : ((b.total.orders < a.total.orders) ? -1 : 0))[0];
      const highestratio = userset.sort((a, b) => (a.ratio < b.ratio) ? 1 : ((b.ratio < a.ratio) ? -1 : 0))[0];
      const obj = {
        picks: {
          amount: mostpicks.total.picks,
          Name: mostpicks.Name
        },
        orders: {
          amount: mostorders.total.orders,
          Name: mostorders.Name
        },
        ratio: {
          amount: highestratio.ratio,
          Name: highestratio.Name
        }
      };

      resolve(obj);
    });
  }

  getApiData = (start?, end?) => {

    const daystart = moment.utc().hours(4).minutes(0).seconds(0).milliseconds(0);

    const startTimestamp = start || daystart.unix();
    const endTimestamp = end || moment.utc().unix();

    const params = {
      DateTimeStart: startTimestamp,
      DateTimeEnd: endTimestamp,
    };

    this.requestParams = params;
    return this.restangular.all('Pickings').getList(params).toPromise();

  }

  initApi = (startTimestamp?, endTimestamp?) => {
    this.getApiData(startTimestamp, endTimestamp).then(
      async data => {
        this.data = data.plain();

        this.data.forEach(user => {
          user.Pickings.sort((a, b) => {
            return a.Hours > b.Hours;
          });
        });

        // Specify different users
        const otherUsers = this.data.filter(user => this.settings.systemUsers.indexOf(user.Name) === -1);
        const systemUsers = this.data.filter(user => this.settings.systemUsers.indexOf(user.Name) !== -1);
        const crossdock = this.data.filter(user => user.Name === 'Crossdock');
        const lift = this.data.filter(user => user.Name === 'Lift');
        const allUsers = this.data;

        if (this.data.length > 1) {
          // Calculate Totals
          await this.calculateIndividualTotals(this.data).then(res => { this.data = res; });
          this.totals = {};
          this.totals.otherUsers = await this.calculateTotals(otherUsers);
          this.totals.allUsers = await this.calculateTotals(allUsers);
          this.totals.systemUsers = await this.calculateTotals(systemUsers);
          this.totals.crossdock = await this.calculateTotals(crossdock);
          this.totals.lift = await this.calculateTotals(lift);

          // Calculate Hourly Averages
          this.averages = {};
          this.averages.otherUsers = await this.calculateHourlyAvg(otherUsers);

          // Calculate Percentages
          await this.calculatePercentages(this.data).then(res => {
            this.data = res;
          });

          await this.calculateRatios(this.data).then(res => {
            this.data = res;
          });

          // Generate Table
          await this.populateTable(this.data);

          // Generate Graphs
          await this.renderGraphs(this.data);

          // Generate Progress Data
          this.percentageData = {
            picksbypersonnel: await this.calculatePicksPercentage(this.totals.otherUsers, this.totals.allUsers),
            daytarget: await this.calculatePicksPercentage(this.totals.allUsers, { picks: 2000 }),
          };
          // this.percentageData.picksbypersonnel = await this.calculatePicksPercentage(this.totals.otherUsers, this.totals.allUsers);
          // this.percentageData.daytarget = await this.calculatePicksPercentage(this.totals.allUsers, { picks: 2000 });

          // Calculate Leaders
          this.most = await this.calculateLeaders(otherUsers);
        } else {
          this.data = [];
          this.graphs = null;
          this.table = null;
          this.percentageData = null;
          this.averages = {};
          this.most = null;
          this.totals = null;
        }

        $('.loader').hide();
      }
    );
  }

  setDateRange = (start: Moment, end: Moment) => {
    $('.loader').show();

    const startTimestamp = start.unix();
    const endTimestamp = end.unix();

    this.initApi(startTimestamp, endTimestamp);

    if (moment().isSame(start, 'day')) {
      this.interval = setInterval(() => {
        this.initApi();
      }, 30000);
    } else {
      clearInterval(this.interval);
    }

  }

  ngOnInit() {
    $('.loader').show();
    this.initApi();
    this.interval = setInterval(() => {
      this.initApi();
    }, 30000);

    $('input[name="pickdates"]').daterangepicker({
      'showWeekNumbers': true,
      ranges: {
        'Vandaag': [moment(), moment()],
        'Gisteren': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Afgelopen week': [moment().subtract(6, 'days'), moment()],
        'Afgelopen maand': [moment().subtract(29, 'days'), moment()],
        'Deze maand': [moment().startOf('month'), moment().endOf('month')],
        'Vorige maand': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      },
      'locale': {
        'format': 'DD/MM/YYYY',
        'separator': ' - ',
        'applyLabel': 'OK',
        'cancelLabel': 'Annuleren',
        'fromLabel': 'Van',
        'toLabel': 'Tot',
        'customRangeLabel': 'Aangepast',
        'weekLabel': 'W',
        'daysOfWeek': [
          'Zo',
          'Ma',
          'Di',
          'Wo',
          'Do',
          'Vr',
          'Za'
        ],
        'monthNames': [
          'Januari',
          'Februari',
          'Maart',
          'April',
          'Mei',
          'Juni',
          'Juli',
          'Augustus',
          'September',
          'Oktober',
          'November',
          'December'
        ],
        'firstDay': 1
      },
      'opens': 'left',
      'startDate': new Date(Date.now()),
      'endDate': new Date(Date.now()),
    }, (start, end, label) => {
      clearInterval(this.interval);
      this.setDateRange(start, end);
    });
  }

}
