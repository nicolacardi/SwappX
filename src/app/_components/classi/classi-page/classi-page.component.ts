import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-classi-page',
  templateUrl: './classi-page.component.html',
  styleUrls: ['./../classi.css']
})
export class ClassiPageComponent implements OnInit {

//  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {

  }
  resetFiltri() {

  }

  // openDrawer() {
  //   this.drawerFiltriAvanzati.open();
  // }

}
