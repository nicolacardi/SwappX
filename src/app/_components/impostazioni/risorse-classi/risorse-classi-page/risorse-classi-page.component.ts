//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

//components
import { RisorseClassiListComponent }               from '../risorse-classi-list/risorse-classi-list.component';

//services
// import { NavigationService } from '../../utilities/navigation/navigation.service';

//#endregion

@Component({
  selector: 'app-risorse-classi-page',
  templateUrl: './risorse-classi-page.component.html',
  styleUrls: ['../risorse-classi.css']
})

export class RisorseClassiPageComponent implements OnInit {

//#region ----- ViewChild Input Output -------
  @ViewChild(RisorseClassiListComponent) RisorseClassiList!: RisorseClassiListComponent; 
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
