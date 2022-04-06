import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { IscrizioniListComponent } from '../iscrizioni-list/iscrizioni-list.component';

@Component({
  selector: 'app-iscrizioni-page',
  templateUrl: './iscrizioni-page.component.html',
  styleUrls: ['./../iscrizioni.css']
})
export class IscrizioniPageComponent implements OnInit {


  @ViewChild(IscrizioniListComponent) iscrizioniList!: IscrizioniListComponent; 

  
  // @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
      this.iscrizioniList.addRecord()
  }
  resetFiltri() {

  }

  // openDrawer() {
  //   this.drawerFiltriAvanzati.open();
  // }

}
