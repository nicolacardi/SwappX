import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { PER_TipoPersona } from 'src/app/_models/PER_Persone';

//components
import { PersoneListComponent } from '../persone-list/persone-list.component';
import { TipiPersonaService } from '../tipi-persona.service';

@Component({
  selector: 'app-persone-filter',
  templateUrl: './persone-filter.component.html',
  styleUrls: ['../persone.css']
})
export class PersoneFilterComponent implements OnInit {

//#region ----- Variabili -------
  obsTipiPersona$!:            Observable<PER_TipoPersona[]>;

  nomeFilter = new FormControl('');
  cognomeFilter = new FormControl('');
  tipoPersonaFilter= new FormControl('');
  annoNascitaFilter = new FormControl('');
  indirizzoFilter = new FormControl('');
  comuneFilter = new FormControl('');
  provFilter = new FormControl('');
  emailFilter = new FormControl('');
  telefonoFilter = new FormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() personeListComponent!: PersoneListComponent;
//#endregion
  constructor(
    private svcTipiPersona:             TipiPersonaService,

  ) { }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {

    this.obsTipiPersona$ = this.svcTipiPersona.list();



    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.personeListComponent.filterValues.nome = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.personeListComponent.filterValues.cognome = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.tipoPersonaFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.personeListComponent.filterValues.tipoPersona = val;
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.annoNascitaFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.personeListComponent.filterValues.annoNascita = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.personeListComponent.filterValues.indirizzo = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.comuneFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.personeListComponent.filterValues.comune = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.provFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.personeListComponent.filterValues.prov = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.emailFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.personeListComponent.filterValues.email = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.telefonoFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.personeListComponent.filterValues.telefono = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )
  }
//#endregion

//#region ----- Reset vari -------
  resetFilterSx() {
      //this.personeListComponent.matDataSource.filter = ''; 
      //this.personeListComponent.filterValue = '';
      //this.personeListComponent.filterValues.filtrosx = ''; 
      //this.personeListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.tipoPersonaFilter.setValue('', {emitEvent:false});
    this.indirizzoFilter.setValue('', {emitEvent:false});
    this.annoNascitaFilter.setValue('', {emitEvent:false});
    this.comuneFilter.setValue('', {emitEvent:false});
    this.provFilter.setValue('', {emitEvent:false});
    this.emailFilter.setValue('', {emitEvent:false});
    this.telefonoFilter.setValue('', {emitEvent:false});

  }

  resetAllInputsAndClearFilters() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('')
    this.tipoPersonaFilter.setValue('')
    this.indirizzoFilter.setValue('');
    this.annoNascitaFilter.setValue('');
    this.comuneFilter.setValue('');
    this.provFilter.setValue('');
    this.emailFilter.setValue('');
    this.telefonoFilter.setValue('');
  }
//#endregion

}
