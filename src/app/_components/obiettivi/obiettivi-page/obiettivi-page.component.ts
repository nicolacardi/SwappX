import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ObiettiviFilterComponent } from '../obiettivi-filter/obiettivi-filter.component';
import { ObiettiviListComponent } from '../obiettivi-list/obiettivi-list.component';

@Component({
  selector: 'app-obiettivi-page',
  templateUrl: './obiettivi-page.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettiviPageComponent implements OnInit {

  @ViewChild(ObiettiviListComponent) obiettiviList!: ObiettiviListComponent; 
  @ViewChild(ObiettiviFilterComponent) obiettiviFilterComponent!: ObiettiviFilterComponent; 

  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;

  
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.obiettiviList.addRecord()
  }

//#region ----- Reset vari -------
  resetFiltri() {
    this.obiettiviFilterComponent.resetAllInputs();
  }
//#endregion

//#region ----- Altri metodi -------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }
//#endregion

}
