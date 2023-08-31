//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit }             from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';
import { Observable }                           from 'rxjs';

//components
import { SociListComponent }                    from '../soci-list/soci-list.component';
import { TipiSocioService }                   from '../tipi-socio.service';

//services

//models
import { PER_TipoSocio }                      from 'src/app/_models/PER_Soci';

//#endregion
@Component({
  selector: 'app-soci-filter',
  templateUrl: './soci-filter.component.html',
  styleUrls: ['../soci.css']
})

export class SociFilterComponent implements OnInit {

//#region ----- Variabili ----------------------

  nomeFilter = new UntypedFormControl('');
  cognomeFilter = new UntypedFormControl('');
  tipoSocioFilter= new UntypedFormControl('');

  
  obsTipiSocio$!:            Observable<PER_TipoSocio[]>;

//#endregion

//#region ----- ViewChild Input Output ---------  
  @Input() sociListComponent!: SociListComponent;
//#endregion

  constructor( private svcTipiSocio: TipiSocioService ) {}

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {

    this.obsTipiSocio$ = this.svcTipiSocio.list();
    this.nomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('nome', val);})
    this.cognomeFilter.valueChanges.subscribe(val => {this.applyFilterDx('cognome', val);})
    this.tipoSocioFilter.valueChanges.subscribe(val => {this.applyFilterDx('tipoSocioID', val);})

  }

  applyFilterDx(field: keyof typeof this.sociListComponent.filterValues, val: string) {
    this.sociListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.sociListComponent.filterValues[field] = val;
    this.sociListComponent.matDataSource.filter = JSON.stringify(this.sociListComponent.filterValues);
    this.sociListComponent.getEmailAddresses();
  }

//#endregion

//#region ----- Reset vari ---------------------
  resetFilterSx() {
      //this.sociListComponent.matDataSource.filter = ''; 
      //this.sociListComponent.filterValue = '';
      //this.sociListComponent.filterValues.filtrosx = ''; 
      //this.sociListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.tipoSocioFilter.setValue('', {emitEvent:false});

  }

  resetAllInputsAndClearFilters() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('')
    this.tipoSocioFilter.setValue('')

  }
//#endregion

}

