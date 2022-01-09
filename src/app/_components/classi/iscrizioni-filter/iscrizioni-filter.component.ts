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
  classeFilter = new FormControl('');
  sezioneFilter = new FormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() iscrizioniListComponent!: IscrizioniListComponent;
//#endregion  
  constructor() { }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit() {

    this.classeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        //this.iscrizioniListComponent.filterValues.classe = val.toLowerCase(); DA ABILITARE
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )

    this.sezioneFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        //this.iscrizioniListComponent.filterValues.sezione = val.toLowerCase(); DA ABILITARE
        this.iscrizioniListComponent.matDataSource.filter = JSON.stringify(this.iscrizioniListComponent.filterValues);
      }
    )


  }
//#endregion

//#region ----- Reset vari -------
  resetMainFilter() {
    if (this.iscrizioniListComponent.matDataSource.filter != ''){
    // if (this.iscrizioniListComponent.matDataSource.filterPredicate == this.iscrizioniListComponent.storedFilterPredicate){
      this.iscrizioniListComponent.matDataSource.filter = ''; 
      this.iscrizioniListComponent.filterInput.nativeElement.value = '';
      this.iscrizioniListComponent.matDataSource.filterPredicate = this.iscrizioniListComponent.filterRightPanel()
    };  
  }

  resetAllInputs() {
    this.classeFilter.setValue('', {emitEvent:false});
    this.sezioneFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.classeFilter.setValue('');
    this.sezioneFilter.setValue('')
  }


//#endregion
}
