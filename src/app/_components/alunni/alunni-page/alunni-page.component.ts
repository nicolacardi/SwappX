import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { AlunniFilterComponent } from '../alunni-filter/alunni-filter.component';
import { AlunniListComponent } from '../alunni-list/alunni-list.component';

@Component({
  selector: 'app-alunni-page',
  templateUrl: './alunni-page.component.html',
  styleUrls: ['./../alunni.css']
})
export class AlunniPageComponent implements OnInit {

  @ViewChild(AlunniListComponent) alunniList!: AlunniListComponent; 
  @ViewChild(AlunniFilterComponent) alunniFilterComponent!: AlunniFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;

  constructor(private _navigationService:  NavigationService) { }

  ngOnInit(): void {
    this._navigationService.passPage("alunniPage");
  }

  addRecord() {
    this.alunniList.addRecord()
  }

  resetFiltri() {
    this.alunniFilterComponent.nomeFilter.setValue('');
    this.alunniFilterComponent.cognomeFilter.setValue('');
    this.alunniFilterComponent.indirizzoFilter.setValue('');
    this.alunniFilterComponent.annoNascitaFilter.setValue('');
    this.alunniFilterComponent.comuneFilter.setValue('');
    this.alunniFilterComponent.provFilter.setValue('');
    this.alunniFilterComponent.emailFilter.setValue('');
    this.alunniFilterComponent.telefonoFilter.setValue('');
    this.alunniFilterComponent.nomeCognomeGenitoreFilter.setValue('');
  }

  openDrawer() {
    this.drawerFiltriAvanzati.open();
    //console.log ("apriDrawer");
  }
}
