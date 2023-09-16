//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

//components
import { ImpostazioneParametriFilterComponent } from '../impostazione-parametri-filter/impostazione-parametri-filter.component';
import { ImpostazioneParametriListComponent } from '../impostazione-parametri-list/impostazione-parametri-list.component';

//services
// import { NavigationService } from '../../utilities/navigation/navigation.service';

//#endregion

@Component({
  selector: 'app-impostazione-parametri-page',
  templateUrl: './impostazione-parametri-page.component.html',
  styleUrls: ['../impostazione-parametri.css']
})

export class ImpostazioneParametriPageComponent implements OnInit {

//#region ----- ViewChild Input Output -------
  @ViewChild(ImpostazioneParametriListComponent) impostazioneparametriList!: ImpostazioneParametriListComponent; 
  @ViewChild(ImpostazioneParametriFilterComponent) impostazioneparametriFilterComponent!: ImpostazioneParametriFilterComponent; 
  @ViewChild('filterSidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion

  constructor() { }

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {

  }
//#endregion

//#region ----- Add Edit Drop -------
  // addRecord() {
  //   this.impostazioneParametriList.addRecord()
  // }
//#endregion

//#region ----- Reset vari -------

  // resetFiltri() {
  //   this.impostazioneParametriFilterComponent.resetAllInputs();
  // }
//#endregion

//#region ----- Altri metodi -------
  openDrawer() {
    console.log("impostazione-parametri-page - openDrawer");
    this.drawerFiltriAvanzati.open();
  }

  refreshChildCols(){
    this.impostazioneparametriList.loadLayout();
  }
//#endregion

}
