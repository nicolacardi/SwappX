import { Component, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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

    //ad ogni modifica del form vado a vedere SE il FilterPredicate è "l'altro".
    //Se lo è lo reimposto.
    // this.form.valueChanges
    // .subscribe (
    //   ()=> {
        
    //     if (this.alunniList.matDataSource.filterPredicate == this.alunniList.storedFilterPredicate)
    //     this.alunniList.matDataSource.filterPredicate = this.alunniList.createFilter();}
    // )

    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniList.filterValues.nome = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniList.filterValues.cognome = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.annoNascitaFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniList.filterValues.annoNascita = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        if (this.alunniList.matDataSource.filterPredicate == this.alunniList.storedFilterPredicate)
        {this.alunniList.matDataSource.filterPredicate = this.alunniList.createFilter()};

        this.alunniList.filterValues.indirizzo = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.comuneFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniList.filterValues.comune = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.provFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniList.filterValues.prov = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.emailFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniList.filterValues.email = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

    this.telefonoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniList.filterValues.telefono = val.toLowerCase();
        this.alunniList.matDataSource.filter = JSON.stringify(this.alunniList.filterValues);
      }
    )

  }

  resetMainFilter() {
    if (this.alunniList.matDataSource.filterPredicate == this.alunniList.storedFilterPredicate)
    {
    this.alunniList.matDataSource.filter = ''; 
    this.alunniList.filterInput.nativeElement.value = '';
    this.alunniList.matDataSource.filterPredicate = this.alunniList.createFilter()};  
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.indirizzoFilter.setValue('', {emitEvent:false});
    this.comuneFilter.setValue('', {emitEvent:false});
    this.provFilter.setValue('', {emitEvent:false});
    this.emailFilter.setValue('', {emitEvent:false});
    this.telefonoFilter.setValue('', {emitEvent:false});
    
  }

  

  
}
