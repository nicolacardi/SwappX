import { Component, Input, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';

//components
import { NoteListComponent } from '../note-list/note-list.component';

@Component({
  selector: 'app-note-filter',
  templateUrl: './note-filter.component.html',
  styleUrls: ['../note.css']
})
export class NoteFilterComponent implements OnInit {

//#region ----- Variabili -------
dtNotaFilter = new FormControl('');
notaFilter = new FormControl('');
quadrimestreFilter = new FormControl('');
dtFirmaFilter = new FormControl('');
docenteFilter = new FormControl('');
alunnoFilter = new FormControl('');



//#endregion

//#region ----- ViewChild Input Output -------  
@Input() noteListComponent!: NoteListComponent;
//#endregion

constructor() {}

//#region ----- LifeCycle Hooks e simili-------

ngOnInit() {

  this.dtNotaFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.noteListComponent.filterValues.dtNota = val.toLowerCase();
      this.noteListComponent.matDataSource.filter = JSON.stringify(this.noteListComponent.filterValues);
    }
  )

  this.notaFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.noteListComponent.filterValues.nota = val.toLowerCase();
      this.noteListComponent.matDataSource.filter = JSON.stringify(this.noteListComponent.filterValues);
    }
  )

  this.quadrimestreFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.noteListComponent.filterValues.periodo = val.toLowerCase();
      this.noteListComponent.matDataSource.filter = JSON.stringify(this.noteListComponent.filterValues);
    }
  )
  this.dtFirmaFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.noteListComponent.filterValues.dtFirma = val.toLowerCase();
      this.noteListComponent.matDataSource.filter = JSON.stringify(this.noteListComponent.filterValues);
    }
  )
  this.docenteFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.noteListComponent.filterValues.docente = val.toLowerCase();
      this.noteListComponent.matDataSource.filter = JSON.stringify(this.noteListComponent.filterValues);
    }
  )
  this.alunnoFilter.valueChanges.subscribe(
    val => {
      //this.resetFilterSx();  
      this.noteListComponent.filterValues.alunno = val.toLowerCase();
      this.noteListComponent.matDataSource.filter = JSON.stringify(this.noteListComponent.filterValues);
    }
  )

}
//#endregion

//#region ----- Reset vari -------

//AS: pulizia filtro di sinistra, chiamata su edit filtro di destra
// PER IL MOMENTO NON UTILIZZATA
resetFilterSx() {
    // this.noteListComponent.matDataSource.filter = ''; 
    // this.noteListComponent.filterValue = '';
    // this.noteListComponent.filterValues.filtrosx = ''; 
    // this.noteListComponent.filterInput.nativeElement.value = '';
}

resetAllInputs() {
  this.dtNotaFilter.setValue('', {emitEvent:false});
  this.dtNotaFilter.setValue('', {emitEvent:false});
  this.notaFilter.setValue('', {emitEvent:false});
  this.quadrimestreFilter.setValue('', {emitEvent:false});
  this.dtFirmaFilter.setValue('', {emitEvent:false});
  this.docenteFilter.setValue('', {emitEvent:false});
  this.alunnoFilter.setValue('', {emitEvent:false});
}

resetAllInputsAndClearFilters() {
  this.dtNotaFilter.setValue('');
  this.notaFilter.setValue('');
  this.quadrimestreFilter.setValue('');
  this.dtFirmaFilter.setValue('');
  this.docenteFilter.setValue('');
  this.alunnoFilter.setValue('');


}

}
