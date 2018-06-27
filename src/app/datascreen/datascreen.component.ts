import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Xml2jsService} from '../services/xml2js.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-datascreen',
  templateUrl: './datascreen.component.html',
  styleUrls: ['./datascreen.component.scss']
})
export class DatascreenComponent implements OnInit {

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
  percentages: any;

  constructor(
    private http: HttpClient,
    public xml2js: Xml2jsService,
  ) { }

  initDashboard() {

  }

  calculateIndividualTotals(data) {
    return new Promise(((resolve, reject) => {
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

  calculateTotals(data) {
    return new Promise(((resolve, reject) => {
      const obj = {
        systemUsers: {
          picks: 0,
          orders: 0,
        },
        otherUsers: {
          picks: 0,
          orders: 0,
        }
      };

      data.forEach(row => {
        if (this.settings.systemUsers.indexOf(row.name) === -1) {
          row.pickings.picking.forEach(pick => {
            obj.otherUsers.picks += parseInt(pick.picked, 0);
            obj.otherUsers.orders += parseInt(pick.orderscount, 0);
          });
        } else {
          row.pickings.picking.forEach(pick => {
            obj.systemUsers.picks += parseInt(pick.picked, 0);
            obj.systemUsers.orders += parseInt(pick.orderscount, 0);
          });
        }
      });

      resolve(obj);
    }));
  }

  populateHours(data) {
    return new Promise(((resolve, reject) => {
      const hours = [];
      resolve(hours);
    }));
  }

  renderGraphs() {

  }

  populateTable(data) {
    this.table = [];

    data.forEach((point) => {
      if (this.settings.systemUsers.indexOf(point.name) === -1 && this.settings.hideSystemUsersInTable) {
        this.table.push(point);
      }
    });

    console.log(this.table);
  }

  calculatePercentages(data) {
    return new Promise(((resolve, reject) => {
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

  calculateRatios(data) {
    return new Promise(((resolve, reject) => {
      const res = [];

      data.forEach(row => {
        row.ratio = +(row.total.picks / row.total.orders).toFixed(2);
        res.push(row);
      });

      resolve(res);
    }));
  }

  getApiData = () => {
    return new Promise((resolve, reject) => {
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

        // Populate Hours
        await this.populateHours(this.data);

        // Calculate Totals
        await this.calculateIndividualTotals(this.data).then(res => { this.data = res; });
        await this.calculateTotals(this.data).then(res => { this.totals = res; console.log(this.totals); });

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
      }
    );
  }

  ngOnInit() {
    this.initApi();
  }

}
