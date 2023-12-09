//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

//components
import { RisorseCSAListComponent }               from '../risorse-csa-list/risorse-csa-list.component';

//services
// import { NavigationService } from '../../utilities/navigation/navigation.service';

//#endregion

@Component({
  selector: 'app-risorse-csa-page',
  templateUrl: './risorse-csa-page.component.html',
  styleUrls: ['../risorse-csa.css']
})

export class RisorseCSAPageComponent implements OnInit {

//#region ----- ViewChild Input Output -------
  @ViewChild(RisorseCSAListComponent) RisorseClassiList!: RisorseCSAListComponent; 
  @ViewChild('filterSidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion

  constructor() { }

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {

  }
//#endregion

//#region ----- Add Edit Drop -------
  // addRecord() {
  //   this.ParametriList.addRecord()
  // }
//#endregion

//#region ----- Reset vari -------

  // resetFiltri() {
  //   this.ParametriFilterComponent.resetAllInputs();
  // }
//#endregion

//#region ----- Altri metodi -------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }


//#endregion

}
