//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

//components
import { IscrizioniListComponent } from '../iscrizioni-list/iscrizioni-list.component';

//#endregion
@Component({
  selector: 'app-iscrizioni-filter',
  templateUrl: './iscrizioni-filter.component.html',
  styleUrls: ['./../iscrizioni.css']
})
export class IscrizioniFilterComponent implements OnInit {

//#region ----- Variabili ----------------------
  nomeFilter =      new UntypedFormControl('');
  cognomeFilter =   new UntypedFormControl('');
  classeFilter =    new UntypedFormControl('');
  sezioneFilter =   new UntypedFormControl('');
  cfFilter =        new UntypedFormControl('');
  emailFilter =     new UntypedFormControl('');
  telefonoFilter =  new UntypedFormControl('');
  dtNascitaFilter = new UntypedFormControl('');
  indirizzoFilter = new UntypedFormControl('');
  comuneFilter =    new UntypedFormControl('');
  provFilter =      new UntypedFormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() iscrizioniListComponent!: IscrizioniListComponent;
//#endregion  
  constructor() { }

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit() {

    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.nome = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )
    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.cognome = val.toLowerCase();  
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.classeFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.classe = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.sezioneFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.sezione = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.cfFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.cf = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.emailFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.email = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.telefonoFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.telefono = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.dtNascitaFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.dtNascita = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.indirizzo = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.comuneFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.comune = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.provFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.iscrizioniListComponent.filterValues.prov = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

  }
//#endregion

//#region ----- Reset vari -------

  resetFilterSx() {
      //this.iscrizioniListComponent.matDataSource.filter = '';       
      //this.iscrizioniListComponent.filterValue = '';
      this.iscrizioniListComponent.filterValues.filtrosx = ''; 
      //this.iscrizioniListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.classeFilter.setValue('', {emitEvent:false});
    this.sezioneFilter.setValue('', {emitEvent:false});
    this.cfFilter.setValue('', {emitEvent:false});
    this.emailFilter.setValue('', {emitEvent:false});
    this.telefonoFilter.setValue('', {emitEvent:false});
    this.dtNascitaFilter.setValue('', {emitEvent:false});
    this.indirizzoFilter.setValue('', {emitEvent:false});
    this.comuneFilter.setValue('', {emitEvent:false});
    this.provFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('');
    this.classeFilter.setValue('');
    this.sezioneFilter.setValue('');
    this.cfFilter.setValue('');
    this.emailFilter.setValue('');
    this.telefonoFilter.setValue('');
    this.dtNascitaFilter.setValue('');
    this.indirizzoFilter.setValue('');
    this.comuneFilter.setValue('');
    this.provFilter.setValue('')
  }


//#endregion
}
