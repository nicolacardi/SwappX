//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatDrawer }                            from '@angular/material/sidenav';

//components
import { ObiettiviDuplicaComponent }            from '../obiettivi-duplica/obiettivi-duplica.component';
import { ObiettiviFilterComponent }             from '../obiettivi-filter/obiettivi-filter.component';
import { ObiettiviListComponent }               from '../obiettivi-list/obiettivi-list.component';

//#endregion
@Component({
  selector: 'app-obiettivi-page',
  templateUrl: './obiettivi-page.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettiviPageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------

  @ViewChild(ObiettiviListComponent) obiettiviList!: ObiettiviListComponent; 
  @ViewChild(ObiettiviFilterComponent) obiettiviFilterComponent!: ObiettiviFilterComponent; 

  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion
  
//#region ----- Constructor --------------------

  constructor(
    public _dialog:                             MatDialog, 
  ) { }

//#endregion

  ngOnInit(): void {}

//#region ----- Reset vari -------
  resetFiltri() {
    this.obiettiviFilterComponent.resetAllInputs();
  }
//#endregion

//#region ----- Altri metodi -------

  addRecord() {
    this.obiettiviList.addRecord()
  }

  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }

  openDuplica() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '430px',
      data: 0
    };
    const dialogRef = this._dialog.open(ObiettiviDuplicaComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => this.obiettiviList.loadData());
  }
//#endregion

}
