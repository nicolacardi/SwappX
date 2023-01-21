import { Component, Input, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';

//components
import { VerbaliListComponent } from '../verbali-list/verbali-list.component';

@Component({
  selector: 'app-verbali-filter',
  templateUrl: './verbali-filter.component.html',
  styleUrls: ['../verbali.css']
})
export class VerbaliFilterComponent implements OnInit {


//#region ----- Variabili -------
nomeFilter = new FormControl('');
cognomeFilter = new FormControl('');
tipoFilter = new FormControl('');
dtVerbaleFilter = new FormControl('');
classeFilter = new FormControl('');
titoloFilter = new FormControl('');


//#endregion

//#region ----- ViewChild Input Output -------  
@Input() verbaliListComponent!: VerbaliListComponent;
//#endregion

constructor() {}

//#region ----- LifeCycle Hooks e simili-------

ngOnInit() {



  this.nomeFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.verbaliListComponent.filterValues.nome = val.toLowerCase();
      this.verbaliListComponent.matDataSource.filter = JSON.stringify(this.verbaliListComponent.filterValues);
    }
  )

  this.cognomeFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.verbaliListComponent.filterValues.cognome = val.toLowerCase();
      this.verbaliListComponent.matDataSource.filter = JSON.stringify(this.verbaliListComponent.filterValues);
    }
  )
  this.tipoFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.verbaliListComponent.filterValues.tipo = val.toLowerCase();
      this.verbaliListComponent.matDataSource.filter = JSON.stringify(this.verbaliListComponent.filterValues);
    }
  )

  this.dtVerbaleFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.verbaliListComponent.filterValues.dtVerbale = val.toLowerCase();
      this.verbaliListComponent.matDataSource.filter = JSON.stringify(this.verbaliListComponent.filterValues);
    }
  )

  this.classeFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.verbaliListComponent.filterValues.classe = val.toLowerCase();
      this.verbaliListComponent.matDataSource.filter = JSON.stringify(this.verbaliListComponent.filterValues);
    }
  )
  this.titoloFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.verbaliListComponent.filterValues.titolo = val.toLowerCase();
      this.verbaliListComponent.matDataSource.filter = JSON.stringify(this.verbaliListComponent.filterValues);
    }
  )

}
//#endregion

//#region ----- Reset vari -------

//AS: pulizia filtro di sinistra, chiamata su edit filtro di destra
// PER IL MOMENTO NON UTILIZZATA
resetFilterSx() {
    // this.verbaliListComponent.matDataSource.filter = ''; 
    // this.verbaliListComponent.filterValue = '';
    // this.verbaliListComponent.filterValues.filtrosx = ''; 
    // this.verbaliListComponent.filterInput.nativeElement.value = '';
}

resetAllInputs() {

  this.nomeFilter.setValue('', {emitEvent:false});
  this.cognomeFilter.setValue('', {emitEvent:false});
  this.tipoFilter.setValue('', {emitEvent:false});
  this.dtVerbaleFilter.setValue('', {emitEvent:false});
  this.classeFilter.setValue('', {emitEvent:false});
  this.titoloFilter.setValue('', {emitEvent:false});
}

resetAllInputsAndClearFilters() {
  
  this.nomeFilter.setValue('');
  this.cognomeFilter.setValue('');
  this.tipoFilter.setValue('');
  this.dtVerbaleFilter.setValue('');
  this.classeFilter.setValue('');
  this.titoloFilter.setValue('');

}

}
