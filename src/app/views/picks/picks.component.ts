import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Xml2jsService} from '../../services/xml2js.service';
import {environment} from '../../../environments/environment';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips/';
import palette from 'google-palette';

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
  graphs: any;

  hours: any = [];
  previousHours: any = [];

  percentageData = {
    picksbypersonnel: 0,
    daytarget: 0,
  };

  most: any;

  constructor(
    private http: HttpClient,
    public xml2js: Xml2jsService,
  ) { }

  calculateIndividualTotals = (data) => {
    return new Promise<any>(((resolve, reject) => {
      data.forEach(line => {
        let totalPicks = 0;
        let totalOrders = 0;
        line.pickings.picking.forEach(pick => {
          totalPicks += parseInt(pick.picked, 0);
          totalOrders += parseInt(pick.orderscount, 0);
        });

        line.total = {
          picks: totalPicks,
          orders: totalOrders,
        };
      });

      resolve(data);
    }));
  }

  calculateTotals = (data) => {
    return new Promise<any>(((resolve, reject) => {
      const obj = {
        picks: 0,
        orders: 0,
      };

      data.forEach(row => {
        row.pickings.picking.forEach(pick => {
          obj.picks += parseInt(pick.picked, 0);
          obj.orders += parseInt(pick.orderscount, 0);
        });
      });
      resolve(obj);
    }));
  }

  calculateHourTotals = (userset) => {
    return new Promise<any>(( async (resolve, reject) => {
      await this.populateHours(this.data).then((hours: any[]) => {

        hours.forEach(hour => {
          let hTotalPicks = 0;
          let hTotalOrders = 0;
          userset.forEach(user => {
            user.pickings.picking.forEach(pick => {
              if (pick.hours === hour.hour) {
                hTotalPicks += parseInt(pick.picked, 0);
                hTotalOrders += parseInt(pick.orderscount, 0);
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

  populateHours = (data) => {
    /**
     * populateHours
     * - data
     *
     * Takes the first user and returns the hours
     * returns: Array with strings
     */

    return new Promise<any>(((resolve, reject) => {
      const hours = [];

      data[0].pickings.picking.forEach(hour => {
        hours.push({ hour: hour.hours });
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
        const u = [];
        user.pickings.picking.forEach(pick => {
          u.push(pick.picked);
        });
        users.push({ data: u, label: user.name });
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

  renderGraphs = async (data) => {

    const otherUsers = this.data.filter(user => this.settings.systemUsers.indexOf(user.name) === -1);
    const systemUsers = this.data.filter(user => this.settings.systemUsers.indexOf(user.name) !== -1);
    const crossdock = this.data.filter(user => user.name === 'Crossdock');
    const lift = this.data.filter(user => user.name === 'Lift');
    const allUsers = this.data;


    const curHours = await this.populateHours(this.data);
    if (this.previousHours.length > 0 && this.previousHours.length !== curHours.length) {
      this.resetGraphs().then(async () => {
        this.previousHours = this.hours;

        if (!this.graphs) { this.graphs = {}; }

        this.graphs.otherUsers = await this.generateGraph(otherUsers);
        this.graphs.allUsers = await this.generateGraph(allUsers);
        this.graphs.crossdock = await this.generateGraph(crossdock);
        this.graphs.lift = await this.generateGraph(lift);
        this.graphs.bottom = await this.generateGraph(otherUsers, 1, 'bar');
      });
    } else {
      this.previousHours = this.hours;

      if (!this.graphs) { this.graphs = {}; }

      this.graphs.otherUsers = await this.generateGraph(otherUsers);
      this.graphs.allUsers = await this.generateGraph(allUsers);
      this.graphs.crossdock = await this.generateGraph(crossdock);
      this.graphs.lift = await this.generateGraph(lift);
      this.graphs.bottom = await this.generateGraph(otherUsers, 1, 'bar');
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
      if (this.settings.systemUsers.indexOf(point.name) === -1 && this.settings.hideSystemUsersInTable) {
        this.table.push(point);
      }
    });

  }

  calculatePercentages = (data) => {
    return new Promise<any>(((resolve, reject) => {
      const res = [];

      data.forEach(row => {
        let totals: { picks: number, orders: number };
        totals = this.settings.systemUsers.indexOf(row.name) === -1 ? this.totals.otherUsers : this.totals.systemUsers;
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
      console.log('SET', userset);
      const mostpicks = userset.sort((a, b) => (a.total.picks < b.total.picks) ? 1 : ((b.total.picks < a.total.picks) ? -1 : 0))[0];
      const mostorders = userset.sort((a, b) => (a.total.orders < b.total.orders) ? 1 : ((b.total.orders < a.total.orders) ? -1 : 0))[0];
      const highestratio = userset.sort((a, b) => (a.ratio < b.ratio) ? 1 : ((b.ratio < a.ratio) ? -1 : 0))[0];
      const obj = {
        picks: {
          amount: mostpicks.total.picks,
          name: mostpicks.name
        },
        orders: {
          amount: mostorders.total.orders,
          name: mostorders.name
        },
        ratio: {
          amount: highestratio.ratio,
          name: highestratio.name
        }
      };

      console.log(obj);
      resolve(obj);
    });
  }

  getApiData = () => {
    return new Promise<any>((resolve, reject) => {
      this.http.get(this.settings.xmlFile, {responseType: 'text'}).subscribe((data) => {
        const api = this.xml2js.parse(data)['employees']['employee'];
        resolve(api);
      }, (err) => {
        reject(err);
      });
    });
  }

  initApi = () => {
    this.getApiData().then(
      async data => {
        this.data = data;

        // Specify different users
        const otherUsers = this.data.filter(user => this.settings.systemUsers.indexOf(user.name) === -1);
        const systemUsers = this.data.filter(user => this.settings.systemUsers.indexOf(user.name) !== -1);
        const crossdock = this.data.filter(user => user.name === 'Crossdock');
        const lift = this.data.filter(user => user.name === 'Lift');
        const allUsers = this.data;

        // Calculate Totals
        await this.calculateIndividualTotals(this.data).then(res => { this.data = res; });
        this.totals = {};
        this.totals.otherUsers = await this.calculateTotals(otherUsers);
        this.totals.allUsers = await this.calculateTotals(allUsers);
        this.totals.systemUsers = await this.calculateTotals(systemUsers);
        this.totals.crossdock = await this.calculateTotals(crossdock);
        this.totals.lift = await this.calculateTotals(lift);

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
        this.percentageData.picksbypersonnel = await this.calculatePicksPercentage(this.totals.otherUsers, this.totals.allUsers);
        this.percentageData.daytarget = await this.calculatePicksPercentage(this.totals.allUsers, { picks: 2000 });

        // Calculate Leaders
        this.most = await this.calculateLeaders(otherUsers);
      }
    );
  }

  ngOnInit() {
    this.initApi();
    setInterval(() => {
      this.initApi();
    }, 5000);
  }

}
