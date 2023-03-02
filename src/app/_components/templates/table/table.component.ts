//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit }             from '@angular/core';
import { Observable } from 'rxjs';
import { TEM_BloccoCella } from 'src/app/_models/TEM_BloccoCella';

//services
import { BlocchiCelleService }                  from '../blocchicelle.service';

//#endregion

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['../templates.css']
})


export class TableComponent implements OnInit{

//#region ----- Variabili --------------------
  obsBlocchiCelle$!:                                    Observable<TEM_BloccoCella[]>;

//#endregion

//#region ----- ViewChild Input Output -------
  @Input('bloccoID') public bloccoID!:          number;
//#endregion

//#region ----- Constructor --------------------

constructor(
  private svcBlocchiCelle:                           BlocchiCelleService,
) { }

//#endregion

  ngOnInit() {
    this.loadData()
  }

  loadData() {
    this.obsBlocchiCelle$  = this.svcBlocchiCelle.listByBlocco(this.bloccoID);
  }
}
