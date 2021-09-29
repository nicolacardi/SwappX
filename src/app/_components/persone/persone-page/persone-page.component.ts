import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { PersoneFilterComponent } from '../persone-filter/persone-filter.component';
import { PersoneListComponent } from '../persone-list/persone-list.component';

@Component({
  selector: 'app-persone-page',
  templateUrl: './persone-page.component.html',
  styleUrls: ['../persone.css']
})
export class PersonePageComponent implements OnInit {

  @ViewChild(PersoneListComponent) personeList!: PersoneListComponent; 
  @ViewChild(PersoneFilterComponent) personeFilterComponent!: PersoneFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
  
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.personeList.addRecord()
  }

  resetFiltri() {
    this.personeFilterComponent.nomeFilter.setValue('');
    this.personeFilterComponent.cognomeFilter.setValue('');
    this.personeFilterComponent.indirizzoFilter.setValue('');
    this.personeFilterComponent.annoNascitaFilter.setValue('');
    this.personeFilterComponent.comuneFilter.setValue('');
    this.personeFilterComponent.provFilter.setValue('');
    this.personeFilterComponent.emailFilter.setValue('');
    this.personeFilterComponent.telefonoFilter.setValue('');
  }

  openDrawer() {
    this.drawerFiltriAvanzati.open();
    //console.log ("apriDrawer");
  }

}
