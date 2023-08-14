//#region ----- IMPORTS ------------------------

import { Component, ViewChild }                 from '@angular/core';

//components
import { ConsensiListComponent }                from '../consensi-list/consensi-list.component';
//#endregion
@Component({
  selector: 'app-consensi-page',
  templateUrl: './consensi-page.component.html',
  styleUrls: ['../consensi.css']
})
export class ConsensiPageComponent {

  //#region ----- ViewChild Input Output ---------

  @ViewChild(ConsensiListComponent) consensiList!: ConsensiListComponent; 

  //#endregion

  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.consensiList.addRecord()
  }

}
