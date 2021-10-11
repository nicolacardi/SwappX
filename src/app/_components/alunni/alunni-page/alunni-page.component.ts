import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

//components
import { AlunniFilterComponent } from '../alunni-filter/alunni-filter.component';
import { AlunniListComponent } from '../alunni-list/alunni-list.component';

//services
import { NavigationService } from '../../utilities/navigation/navigation.service';


@Component({
  selector: 'app-alunni-page',
  templateUrl: './alunni-page.component.html',
  styleUrls: ['./../alunni.css']
})

export class AlunniPageComponent implements OnInit {

//#region ----- ViewChild Input Output -------
  @ViewChild(AlunniListComponent) alunniList!: AlunniListComponent; 
  @ViewChild(AlunniFilterComponent) alunniFilterComponent!: AlunniFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion
  
  constructor(private _navigationService:  NavigationService) { }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
    this._navigationService.passPage("alunniPage");
  }
//#endregion
  
//#region ----- Add Edit Drop -------
  addRecord() {
    this.alunniList.addRecord()
  }
//#endregion
  
//#region ----- Reset vari -------
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
//#endregion

//#region ----- Altri metodi -------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }
//#endregion
}
