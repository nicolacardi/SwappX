//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit}              from '@angular/core';
import { UntypedFormControl }                   from '@angular/forms';

//components
import { ImpostazioneParametriListComponent }   from '../impostazione-parametri-list/impostazione-parametri-list.component';

//#endregion
@Component({
  selector: 'app-impostazione-parametri-filter',
  templateUrl: './impostazione-parametri-filter.component.html',
  styleUrls: ['../impostazione-parametri.css']
})

export class ImpostazioneParametriFilterComponent implements OnInit {

//#region ----- Variabili ----------------------

  formClean= true;

  parNameFilter = new UntypedFormControl('');
  parValueFilter = new UntypedFormControl('');
  parDescrFilter = new UntypedFormControl('');

//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() impostazioneparametriListComponent!: ImpostazioneParametriListComponent;
//#endregion

  constructor() {}

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    this.parNameFilter.valueChanges.subscribe(val => {this.applyFilterDx('parName', val);})
    this.parValueFilter.valueChanges.subscribe(val => {this.applyFilterDx('parValue', val);})
    this.parDescrFilter.valueChanges.subscribe(val => {this.applyFilterDx('parDescr', val);})

  }

  applyFilterDx(field: keyof typeof this.impostazioneparametriListComponent.filterValues, val: string) {
    //this.resetFilterSx();
    this.impostazioneparametriListComponent.filterValues[field] = isNaN(+val)? val.toLowerCase(): val;
    this.impostazioneparametriListComponent.matDataSource.filter = JSON.stringify(this.impostazioneparametriListComponent.filterValues);
    this.formClean = this.isFormClean();
  }

  isFormClean(): boolean {
    return (
      this.parNameFilter.value === '' &&
      this.parValueFilter.value === '' &&
      this.parDescrFilter.value === '' 

    );
  }
//#endregion


//#region ----- Reset vari -------
  resetFilterSx() {
    //this.impostazioneParametriListComponent.matDataSource.filter = ''; 
    //this.impostazioneParametriListComponent.filterValue = ''; DA AGGIUNGERE PER EVITARE CHE LA CUSTOMPIPE highlight funzioni male ma prima va creata this.filtervalue nel component come negli altri
    //this.impostazioneParametriListComponent.filterValues.filtrosx = ''; 
    //this.impostazioneParametriListComponent.filterInput.nativeElement.value = '';
  }

  resetAllInputs() {
    this.parNameFilter.setValue('', {emitEvent:false});
    this.parValueFilter.setValue('', {emitEvent:false});
    this.parDescrFilter.setValue('', {emitEvent:false});


  }

  resetAllInputsAndClearFilters() {
    this.parNameFilter.setValue('');
    this.parValueFilter.setValue('');
    this.parDescrFilter.setValue('');

  }
//#endregion
}
