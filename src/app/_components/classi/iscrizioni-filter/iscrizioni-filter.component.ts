import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

//components
import { IscrizioniListComponent } from '../iscrizioni-list/iscrizioni-list.component';

@Component({
  selector: 'app-iscrizioni-filter',
  templateUrl: './iscrizioni-filter.component.html',
  styleUrls: ['./../classi.css']
})
export class IscrizioniFilterComponent implements OnInit {

//#region ----- Variabili -------
  nomeFilter = new FormControl('');
  cognomeFilter = new FormControl('');
  classeFilter = new FormControl('');
  sezioneFilter = new FormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() iscrizioniListComponent!: IscrizioniListComponent;
//#endregion  
  constructor() { }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit() {

    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.iscrizioniListComponent.filterValues.nome = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )
    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.iscrizioniListComponent.filterValues.cognome = val.toLowerCase();  
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.classeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.iscrizioniListComponent.filterValues.classe = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.sezioneFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.iscrizioniListComponent.filterValues.sezione = val.toLowerCase(); 
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )


  }
//#endregion

//#region ----- Reset vari -------
  resetMainFilter() {
    //se il filterpredicate è uguale a quello stored (quindi "se sono in modalità filtro Main")
    //allora resetta il filtro e come filterPredicate usa filterRightPanel.
    if (this.iscrizioniListComponent.matDataSource.filterPredicate == this.iscrizioniListComponent.storedFilterPredicate){
      this.iscrizioniListComponent.matDataSource.filter = ''; 
      this.iscrizioniListComponent.filterValue = ''; 
      this.iscrizioniListComponent.filterInput.nativeElement.value = '';
      this.iscrizioniListComponent.matDataSource.filterPredicate = this.iscrizioniListComponent.filterRightPanel()
    };  
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.classeFilter.setValue('', {emitEvent:false});
    this.sezioneFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.nomeFilter.setValue('');
    this.cognomeFilter.setValue('');
    this.classeFilter.setValue('');
    this.sezioneFilter.setValue('')
  }


//#endregion
}
