import { Injectable } from '@angular/core';
import * as xml2js from 'xml2js';

@Injectable()
export class Xml2jsService {

  constructor() { }

  parse(xml: string) {
    let x = [];
    const options = {
      normalizeTags: true,
      normalize: true,
      explicitArray: false,
      mergeAttrs: false,
    };
    xml2js.parseString(xml, options, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        x = result;
      }
    });
    return x;
  }

}
