import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FiltriService } from '../../utilities/filtri/filtri.service';
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

  constructor(private _filtriService:   FiltriService) { }

  ngOnInit(): void {
    this._filtriService.passPage("alunniList");
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
  }

}
