import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

//components
import { ClassiSezioniAnniListComponent } from '../classi-sezioni-anni-list/classi-sezioni-anni-list.component';

@Component({
  selector: 'app-classi-sezioni-anni-filter',
  templateUrl: './classi-sezioni-anni-filter.component.html',
  styleUrls: ['./../classi.css']
})
export class ClassiSezioniAnniFilterComponent implements OnInit {

//#region ----- Variabili -------
  classeFilter = new FormControl('');
  sezioneFilter = new FormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() classiSezioniAnniListComponent!: ClassiSezioniAnniListComponent;
//#endregion  
  constructor() { }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit() {

    this.classeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.classiSezioniAnniListComponent.filterValues.classe = val.toLowerCase();
        this.classiSezioniAnniListComponent.matDataSource.filter = JSON.stringify(this.classiSezioniAnniListComponent.filterValues);
      }
    )

    this.sezioneFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.classiSezioniAnniListComponent.filterValues.sezione = val.toLowerCase();
        this.classiSezioniAnniListComponent.matDataSource.filter = JSON.stringify(this.classiSezioniAnniListComponent.filterValues);
      }
    )


  }
//#endregion

//#region ----- Reset vari -------
  resetMainFilter() {
      //this.classiSezioniAnniListComponent.matDataSource.filter = ''; 
      //this.classiSezioniAnniListComponent.filterValue = ''; DA AGGIUNGERE PER EVITARE CHE LA CUSTOMPIPE highlight funzioni male ma prima va creata this.filtervalue nel component come negli altri
      //this.classiSezioniAnniListComponent.filterInput.nativeElement.value = '';
      //this.classiSezioniAnniListComponent.matDataSource.filterPredicate = this.classiSezioniAnniListComponent.filterRightPanel()
      console.log(this.classiSezioniAnniListComponent.filterValues);
  }

  resetAllInputs() {
    this.classeFilter.setValue('', {emitEvent:false});
    this.sezioneFilter.setValue('', {emitEvent:false});

    console.log(this.classiSezioniAnniListComponent.filterValues);

  }

  resetAllInputsAndClearFilters() {
    this.classeFilter.setValue('');
    this.sezioneFilter.setValue('')

    console.log(this.classiSezioniAnniListComponent.filterValues);

  }


//#endregion
}
