import {Component, OnDestroy, OnInit} from '@angular/core';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';

import { Xml2jsService } from '../../services/xml2js.service';
import {Http, HttpModule} from '@angular/http';
import {HttpClient} from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Component({
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  settings = {
    systemNames: ['Crossdock', 'Lift'],
    dayTarget: 2000,
    variables: { // For linking the xml api names
      employee_list: 'employees',
      employee: 'employee',
      picking_list: 'pickings',
      picking: 'picking',
      hour: 'hours',
      picks: 'picked',
      orders: 'orderscount'
    }
  };

  private XmlLocation = environment.xmlApi;

  refreshInterval;

  data = [];
  graphData = [];
  sysGraph = [];
  employees: any[] = [];
  system: any[] = [];
  overall: any = {};
  hours: any[] = [];

  // social box charts

  public EmployeeGraph = { data: [] };
  public TotalGraph = { data: [] };

  public brandBoxChartLabels: Array<any> = [];
  public brandBoxChartOptions: any = {
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
  };
  public brandBoxChartColours: Array<any> = [
    {
      backgroundColor: 'rgba(255,255,255,.1)',
      borderColor: 'rgba(255,255,255,.55)',
      pointHoverBackgroundColor: '#fff'
    }
  ];
  public brandBoxChartLegend = false;
  public brandBoxChartType = 'line';

  private dataCache;

  bottomChartDatasets = [];
  bottomChartLabels = [];
  bottomChartLegend = true;
  bottomChartColours = [
    {
      backgroundColor: getStyle('--primary'),
      borderColor: 'rgba(0,0,0,.55)',
      pointHoverBackgroundColor: '#ccc'
    }
  ];
  bottomChartType = 'bar';
  bottomChartOptions: any = {
    tooltips: {
      enabled: false,
      custom: CustomTooltips
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        display: true,
        ticks: {
          callback: function(value, index, values) {
            return value + ':00';
          }
        }
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
  };

  constructor(
    private http: HttpClient,
    public xml2js: Xml2jsService,
  ) { }

  calculate(hours, type) {
    let total = 0;
    hours.forEach(hour => {
      total = total + parseInt(hour[type], 0);
    });
    return total;
  }

  hexToRgbA(hex, opacity = 1) {
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
    throw new Error('Bad Hex');
  }


  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getDataOrCached() {
    if (this.dataCache) {
      this.http.get(this.XmlLocation, {responseType: 'text'}).subscribe(data => {
        if (data === this.dataCache) {
          // Do nothing, cache hasn't changed
        } else {
          this.getData();
        }
      });
    }
  }

  resetCharts() {
    this.EmployeeGraph = null;
    this.TotalGraph = null;

    this.EmployeeGraph = { data: [] };
    this.TotalGraph = { data: [] };
  }


  getData() {

    this.graphData = [];
    this.bottomChartDatasets = [];

    this.http.get(this.XmlLocation, {responseType: 'text'}).subscribe(data => {
      this.dataCache = data;
      let tmpAllEmployees = [];
      let tmpEmployees = [];
      let tmpSystem = [];
      const tmpAllHourlyPicks = [];
      const tmpOverall = {
        targetpercentage: 0,
        autopicks: 0,
        autoorders: 0,
        orders: 0,
        manualpicks: 0,
        manualorders: 0,
        manualpercentage: 0
      };

      // Parse the xml file to json
      let parsed = this.xml2js.parse(data);
      parsed = parsed[this.settings.variables.employee_list][this.settings.variables.employee];

      // Map Pickings to hours
      tmpAllEmployees = parsed.map((employee) => {
        const curEmployee = {
          name: employee.name,
          picks: [],
          today: {
            ratio: 0,
            picks: {
              amount: 0,
              percentage: 0
            },
            orders: {
              amount: 0,
              percentage: 0
            }
          }
        };

        employee[this.settings.variables.picking_list][this.settings.variables.picking].forEach(item => {
          const newitem = {
            hour: item[this.settings.variables.hour],
            picks: item[this.settings.variables.picks],
            orders: item[this.settings.variables.orders],
          };
          curEmployee.picks.push(newitem);
        });
        curEmployee.today.picks.amount = this.calculate(curEmployee.picks, 'picks');
        curEmployee.today.orders.amount = this.calculate(curEmployee.picks, 'orders');
        curEmployee.today.ratio = Math.round((curEmployee.today.picks.amount / curEmployee.today.orders.amount) * 100) / 100;

        if (this.settings.systemNames.indexOf(curEmployee.name) === -1 && curEmployee.name !== 'Systeem') {
          tmpOverall.manualpicks += curEmployee.today.picks.amount;
          tmpOverall.manualorders += curEmployee.today.orders.amount;
        } else {
          tmpOverall.autopicks += curEmployee.today.picks.amount;
          tmpOverall.autoorders += curEmployee.today.orders.amount;
        }

        tmpOverall.orders = tmpOverall.orders + curEmployee.today.orders.amount;
        tmpOverall.targetpercentage = Math.round((tmpOverall.autopicks + tmpOverall.manualpicks) / this.settings.dayTarget * 100);

        return curEmployee;
      });

      if (this.hours.length !== tmpAllEmployees[0].picks.length) {
        console.log('NEW');
        this.resetCharts();
      } else {
        console.log('NOT NEW');
      }

      this.initCharts(tmpAllEmployees[0].picks);

      // Calculating the individual percentage of manual picks
      tmpAllEmployees = tmpAllEmployees.map(employee => {
        employee.today.picks.percentage = Math.round(employee.today.picks.amount / tmpOverall.manualpicks * 100);
        return employee;
      });

      tmpAllEmployees.forEach(employee => {
        const hourlyPicks = [];
        const hours = [];
        employee.picks.forEach(hour => {
          // if (hour.picks > 0) {
            const d = new Date();
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
            d.setHours(hour.hour);
            hours.push(d);
            hourlyPicks.push({ y: hour.picks, x: hour.hour });
            tmpAllHourlyPicks.push(hour.picks);
          // }
        });
        const line = {
          data: hourlyPicks,
          label: employee.name,
        };
        if (this.settings.systemNames.indexOf(employee.name) === -1) {
          this.graphData.push(line);
        }
      });

      // Extract the employees and the not-employees differently
      tmpSystem = tmpAllEmployees.filter(x => this.settings.systemNames.indexOf(x.name) !== -1);
      tmpEmployees = tmpAllEmployees.filter(x => this.settings.systemNames.indexOf(x.name) === -1 && x.name !== 'Systeem');

      this.employees = tmpEmployees;
      this.bottomChartDatasets = this.graphData;

      tmpSystem.forEach(sys => {
        const dt = this.getPicksPerHour([ sys, ]);
        sys.graph = [{ data: dt, label: sys.name }];
      });

      this.system = tmpSystem;
      this.overall = tmpOverall;

      this.settings.systemNames.forEach(name => {
        this.data[name] = tmpAllEmployees.filter(x => x.name === name);
      });

      // Calculate the manual picks percentage
      tmpOverall.manualpercentage = Math.floor(tmpOverall.manualpicks / (tmpOverall.manualpicks + tmpOverall.autopicks) * 100);

      const empdata = this.getPicksPerHour(tmpEmployees);
      const totdata = this.getPicksPerHour(tmpEmployees);

      this.EmployeeGraph.data = [{ data: empdata, label: 'Personeel' }];
      this.TotalGraph.data = [{ data: totdata, label: 'Totaal' }];

      const colors = [];
      this.bottomChartDatasets.forEach(dataset => {
        const curColor = this.getRandomColor();
        colors.push({
          backgroundColor: this.hexToRgbA(curColor, .9),
          borderColor: this.hexToRgbA(curColor, .55),
          pointHoverBackgroundColor: '#fff'
        });
      });
      this.bottomChartColours = colors;

    });
  }

  initCharts(hours) {
    this.hours = [];
    this.brandBoxChartLabels = [];
    this.bottomChartLabels = [];

    // this.EmployeeGraph.data = [];
    // this.TotalGraph.data = [];

    for (let i = 0; i < hours.length; i++) {
      this.hours.push(hours[i].hour);
    }

    this.brandBoxChartLabels = this.hours;
    this.bottomChartLabels = this.hours;
  }

  getPicksPerHour(employees, debug = false) {
    const result = [];
    this.hours.forEach(hour => {
      let curhour = 0;
      employees.forEach(employee => {
        if (debug) { console.log('DEBUG', employee.name); }
        const amount = employee.picks.filter(x => x.hour === hour)[0].picks;
        curhour += parseInt(amount, 0);
      });
      result.push(curhour);
      curhour = 0;
    });
    return result;
  }

  ngOnInit(): void {
    this.getData();
    this.refreshInterval = setInterval(
      () => {
        this.getDataOrCached();
      }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

}

