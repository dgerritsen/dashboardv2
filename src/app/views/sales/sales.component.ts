import {Component, OnInit} from '@angular/core';
import {Restangular} from 'ngx-restangular';

import * as moment from 'moment';
import {Moment} from 'moment';
import * as _ from 'lodash'


declare const $: any;

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  table: any;
  totals: any;
  revenue: any;
  mostorders: any;


  constructor(
    private restangular: Restangular,
  ) {}

  setDateRange = (start: Moment, end: Moment) => {
    $('.loader').show();
    console.log(start, end);

    const startTimestamp = start.unix();
    const endTimestamp = end.unix();

    this.initApi(startTimestamp, endTimestamp);

  }

  getRevenueApiData = (start?, end?) => {

    const startTimestamp = start ||  new Date(Date.now()).getTime() - (24 * 60 * 60);
    const endTimestamp = end || new Date(Date.now()).getTime();

    const query = {
      DateTimeStart: startTimestamp,
      DateTimeEnd: endTimestamp,
    };

    return this.restangular.one('salesrevenue').get(query).toPromise();
  }

  getApiData = (start?, end?) => {

    const startTimestamp = start ||  new Date(Date.now()).getTime() - (24 * 60 * 60);
    const endTimestamp = end || new Date(Date.now()).getTime();

    const query = {
      DateTimeStart: startTimestamp,
      DateTimeEnd: endTimestamp,
    };

    return this.restangular.all('salesData').getList(query).toPromise();
  }

  calculateTotals = (data) => {
    return new Promise((resolve => {

      const totals = {
        orders: 0,
        orderlines: 0,
        quotations: 0,
        quotationlines: 0,
      };

      data.forEach(d => {
        totals.orders += d.OrderCount;
        totals.orderlines += d.OrderLineCount;
        totals.quotations += d.QuotationCount;
        totals.quotationlines += d.QuotationLineCount;
      });

      resolve(totals);
    }));
  }

  initApi = async (startTimestamp?, endTimestamp?) => {
    const raw_data = await this.getApiData(startTimestamp, endTimestamp);
    const raw_revenue_data = await this.getRevenueApiData(startTimestamp, endTimestamp);
    const data = raw_data.plain();
    const revenue_data = raw_revenue_data.plain();

    const formatter = new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });

    this.table = data;
    this.mostorders = _.orderBy(data, ['OrderCount', 'OrderLineCount'], ['desc', 'desc'])[0];
    this.revenue = formatter.format(revenue_data.Amount);
    this.totals = await this.calculateTotals(data);

    $('.loader').hide();

  }

  ngOnInit() {
    this.initApi();

    $('input[name="dates"]').daterangepicker({
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
      this.setDateRange(start, end);
    });

  }

}
