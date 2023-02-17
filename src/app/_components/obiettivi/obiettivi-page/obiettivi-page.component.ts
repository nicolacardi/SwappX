import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ObiettiviDuplicaComponent } from '../obiettivi-duplica/obiettivi-duplica.component';
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

  
  constructor(
    public _dialog:                         MatDialog, 
  ) { }

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
