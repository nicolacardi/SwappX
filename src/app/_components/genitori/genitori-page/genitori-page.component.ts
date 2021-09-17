
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { GenitoriFilterComponent } from '../genitori-filter/genitori-filter.component';
import { GenitoriListComponent } from '../genitori-list/genitori-list.component';

@Component({
  selector: 'app-genitori-page',
  templateUrl: './genitori-page.component.html',
  styleUrls: ['../genitori.css']
})

export class GenitoriPageComponent implements OnInit {

  @ViewChild(GenitoriListComponent) genitoriList!: GenitoriListComponent; 
  @ViewChild(GenitoriFilterComponent) genitoriFilterComponent!: GenitoriFilterComponent; 
  
  //@ViewChild('sidenav') public drawerFiltriAvanzati!: MatSidenav;
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;

  constructor(private _navigationService:  NavigationService) { }

  ngOnInit(): void {
    this._navigationService.passPage("genitoriList");
  }

  addRecord() {
    this.genitoriList.addRecord()
  }

  resetFiltri() {
    this.genitoriFilterComponent.nomeFilter.setValue('');
    this.genitoriFilterComponent.cognomeFilter.setValue('');
    this.genitoriFilterComponent.indirizzoFilter.setValue('');
    this.genitoriFilterComponent.annoNascitaFilter.setValue('');
    this.genitoriFilterComponent.comuneFilter.setValue('');
    this.genitoriFilterComponent.provFilter.setValue('');
    this.genitoriFilterComponent.emailFilter.setValue('');
    this.genitoriFilterComponent.telefonoFilter.setValue('');
    this.genitoriFilterComponent.nomeCognomeAlunnoFilter.setValue('');
  }

  openDrawer() {
    this.drawerFiltriAvanzati.open();
    //console.log ("apriDrawer");
  }
}
