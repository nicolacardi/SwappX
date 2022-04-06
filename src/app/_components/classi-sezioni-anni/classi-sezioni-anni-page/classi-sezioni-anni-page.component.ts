import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ClassiSezioniAnniListComponent } from '../classi-sezioni-anni-list/classi-sezioni-anni-list.component';

@Component({
  selector: 'app-classi-sezioni-anni-page',
  templateUrl: './classi-sezioni-anni-page.component.html',
  styleUrls: ['./../classi-sezioni-anni.css']
})
export class ClassiPageComponent implements OnInit {


  @ViewChild(ClassiSezioniAnniListComponent) ClassiSezioniAnniListComponent!: ClassiSezioniAnniListComponent; 

  
//  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
      this.ClassiSezioniAnniListComponent.addRecord()
  }
  resetFiltri() {

  }

  // openDrawer() {
  //   this.drawerFiltriAvanzati.open();
  // }

}
