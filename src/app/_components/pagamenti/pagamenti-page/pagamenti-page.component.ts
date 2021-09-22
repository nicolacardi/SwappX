import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { PagamentiFilterComponent } from '../pagamenti-filter/pagamenti-filter.component';
import { PagamentiListComponent } from '../pagamenti-list/pagamenti-list.component';

@Component({
  selector: 'app-pagamenti-page',
  templateUrl: './pagamenti-page.component.html',
  styleUrls: ['../pagamenti.css']
})
export class PagamentiPageComponent implements OnInit {

  @ViewChild(PagamentiListComponent) pagamentiList!: PagamentiListComponent; 
  @ViewChild(PagamentiFilterComponent) pagamentiFilterComponent!: PagamentiFilterComponent; 

  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;

  constructor(private _navigationService:  NavigationService) { }

  ngOnInit(): void {
    this._navigationService.passPage("pagamentiPage");
  }

  addRecord() {
    this.pagamentiList.addRecord()
  }

  resetFiltri() {

    
    console.log("BELLA MERDA");
    //QUI!!!
    //AS: problema: il tipoPAgamento è un oggetto
    this.pagamentiFilterComponent.tipoPagamentoFilter.setValue('');
    this.pagamentiFilterComponent.causaleFilter.setValue('');

    console.log("AAA3");
  }

  openDrawer() {
    this.drawerFiltriAvanzati.open();
    //console.log ("apriDrawer");
  }
}
