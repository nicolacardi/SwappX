import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

//components
import { PersoneListComponent } from '../persone-list/persone-list.component';

@Component({
  selector: 'app-persone-filter',
  templateUrl: './persone-filter.component.html',
  styleUrls: ['../persone.css']
})
export class PersoneFilterComponent implements OnInit {

//#region ----- Variabili -------
  nomeFilter = new FormControl('');
  cognomeFilter = new FormControl('');
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
  constructor() { }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.personeListComponent.filterValues.nome = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.personeListComponent.filterValues.cognome = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.annoNascitaFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.personeListComponent.filterValues.annoNascita = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        if (this.personeListComponent.matDataSource.filterPredicate == this.personeListComponent.storedFilterPredicate)
        {this.personeListComponent.matDataSource.filterPredicate = this.personeListComponent.filterRightPanel()};

        this.personeListComponent.filterValues.indirizzo = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.comuneFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.personeListComponent.filterValues.comune = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.provFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.personeListComponent.filterValues.prov = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.emailFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.personeListComponent.filterValues.email = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )

    this.telefonoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.personeListComponent.filterValues.telefono = val.toLowerCase();
        this.personeListComponent.matDataSource.filter = JSON.stringify(this.personeListComponent.filterValues);
      }
    )
  }
//#endregion

//#region ----- Reset vari -------
  resetMainFilter() {
    if (this.personeListComponent.matDataSource.filterPredicate == this.personeListComponent.storedFilterPredicate){
      this.personeListComponent.matDataSource.filter = ''; 
      //this.personeListComponent.filterValue = ''; DA AGGIUNGERE PER EVITARE CHE LA CUSTOMPIPE highlight funzioni male ma prima va creata this.filtervalue nel component come negli altri

      this.personeListComponent.filterInput.nativeElement.value = '';
      this.personeListComponent.matDataSource.filterPredicate = this.personeListComponent.filterRightPanel()
    };  
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
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
    this.indirizzoFilter.setValue('');
    this.annoNascitaFilter.setValue('');
    this.comuneFilter.setValue('');
    this.provFilter.setValue('');
    this.emailFilter.setValue('');
    this.telefonoFilter.setValue('');

  }
//#endregion

}
