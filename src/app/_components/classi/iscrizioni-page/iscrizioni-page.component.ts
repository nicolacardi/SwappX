import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { IscrizioniListComponent } from '../iscrizioni-list/iscrizioni-list.component';

@Component({
  selector: 'app-iscrizioni-page',
  templateUrl: './iscrizioni-page.component.html',
  styleUrls: ['./../classi.css']
})
export class IscrizioniPageComponent implements OnInit {


  @ViewChild(IscrizioniListComponent) IscrizioniListComponent!: IscrizioniListComponent; 

  
//  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
      this.IscrizioniListComponent.addRecord()
  }
  resetFiltri() {

  }

  // openDrawer() {
  //   this.drawerFiltriAvanzati.open();
  // }

}
