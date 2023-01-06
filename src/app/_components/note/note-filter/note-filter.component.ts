import { Component, Input, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';

//components
import { NoteListComponent } from '../note-list/note-list.component';

@Component({
  selector: 'app-note-filter',
  templateUrl: './note-filter.component.html',
  styleUrls: ['../note.component.css']
})
export class NoteFilterComponent implements OnInit {

//#region ----- Variabili -------
dtNotaFilter = new FormControl('');

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
      console.log(this.noteListComponent.filterValues)
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

}

resetAllInputsAndClearFilters() {
  this.dtNotaFilter.setValue('');

}

}
