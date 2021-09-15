import { Component, Input, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { AlunniListComponent } from '../alunni-list/alunni-list.component';

@Component({
  selector: 'app-alunni-filter',
  templateUrl: './alunni-filter.component.html',
  styleUrls: ['../alunni.css']
})

export class AlunniFilterComponent implements OnInit {

  @Input() alunniList!: AlunniListComponent;

  
  nomeFilter = new FormControl('');
  cognomeFilter = new FormControl('');
  annoNascitaFilter = new FormControl('');
  indirizzoFilter = new FormControl('');
  comuneFilter = new FormControl('');
  provFilter = new FormControl('');
  emailFilter = new FormControl('');
  telefonoFilter = new FormControl('');

  constructor() {}

  ngOnInit() {
    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        this.alunniList.filterValues.nome = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        this.alunniList.filterValues.cognome = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.annoNascitaFilter.valueChanges
    .subscribe(
      val => {
        this.alunniList.filterValues.annoNascita = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges
    .subscribe(
      val => {
        this.alunniList.filterValues.indirizzo = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.comuneFilter.valueChanges
    .subscribe(
      val => {
        this.alunniList.filterValues.comune = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.provFilter.valueChanges
    .subscribe(
      val => {
        this.alunniList.filterValues.prov = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.emailFilter.valueChanges
    .subscribe(
      val => {
        this.alunniList.filterValues.email = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.telefonoFilter.valueChanges
    .subscribe(
      val => {
        this.alunniList.filterValues.telefono = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

  }

  resetAllInputs() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('');
    this.indirizzoFilter.setValue('');
    this.comuneFilter.setValue('');
    this.provFilter.setValue('');
    this.emailFilter.setValue('');
    this.telefonoFilter.setValue('');
    
  }

  

  
}
