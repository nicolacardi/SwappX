import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';

//components
import { PersoneListComponent } from '../persone-list/persone-list.component';
import { TipiPersonaService } from '../tipi-persona.service';

//services

//models
import { PER_TipoPersona } from 'src/app/_models/PER_Persone';

@Component({
  selector: 'app-persone-filter',
  templateUrl: './persone-filter.component.html',
  styleUrls: ['../persone.css']
})

export class PersoneFilterComponent implements OnInit {

//#region ----- Variabili ----------------------

  nomeFilter = new UntypedFormControl('');
  cognomeFilter = new UntypedFormControl('');
  tipoPersonaFilter= new UntypedFormControl('');
  annoNascitaFilter = new UntypedFormControl('');
  indirizzoFilter = new UntypedFormControl('');
  comuneFilter = new UntypedFormControl('');
  provFilter = new UntypedFormControl('');
  emailFilter = new UntypedFormControl('');
  telefonoFilter = new UntypedFormControl('');
  
  obsTipiPersona$!:            Observable<PER_TipoPersona[]>;

//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() personeListComponent!: PersoneListComponent;
//#endregion
  constructor( private svcTipiPersona: TipiPersonaService ) {

   }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {

    this.obsTipiPersona$ = this.svcTipiPersona.list();

    this.nomeFilter.valueChanges.subscribe( val => {
        this.personeListComponent.filterValues.nome = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.cognomeFilter.valueChanges.subscribe( val => {
        this.personeListComponent.filterValues.cognome = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.tipoPersonaFilter.valueChanges.subscribe( val => {
        this.personeListComponent.filterValues.tipoPersonaID = val;
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.annoNascitaFilter.valueChanges.subscribe( val => {
        this.personeListComponent.filterValues.annoNascita = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges.subscribe(  val => {
        this.personeListComponent.filterValues.indirizzo = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.comuneFilter.valueChanges.subscribe( val => {
        this.personeListComponent.filterValues.comune = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.provFilter.valueChanges.subscribe( val => {
        this.personeListComponent.filterValues.prov = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.emailFilter.valueChanges.subscribe( val => {
        this.personeListComponent.filterValues.email = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.telefonoFilter.valueChanges.subscribe( val => {
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
