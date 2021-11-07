import { Component, Input, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';

//components
import { AlunniListComponent } from '../alunni-list/alunni-list.component';

@Component({
  selector: 'app-alunni-filter',
  templateUrl: './alunni-filter.component.html',
  styleUrls: ['../alunni.css']
})

export class AlunniFilterComponent implements OnInit {

//#region ----- Variabili -------
  nomeFilter = new FormControl('');
  cognomeFilter = new FormControl('');
  annoNascitaFilter = new FormControl('');
  indirizzoFilter = new FormControl('');
  comuneFilter = new FormControl('');
  provFilter = new FormControl('');
  emailFilter = new FormControl('');
  telefonoFilter = new FormControl('');
  nomeCognomeGenitoreFilter = new FormControl('');
//#endregion
  
//#region ----- ViewChild Input Output -------  
  @Input() alunniListComponent!: AlunniListComponent;
//#endregion

  constructor() {}

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit() {
    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniListComponent.filterValues.nome = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniListComponent.filterValues.cognome = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.annoNascitaFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniListComponent.filterValues.annoNascita = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        if (this.alunniListComponent.matDataSource.filterPredicate == this.alunniListComponent.storedFilterPredicate)
        {this.alunniListComponent.matDataSource.filterPredicate = this.alunniListComponent.filterRightPanel()};

        this.alunniListComponent.filterValues.indirizzo = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.comuneFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniListComponent.filterValues.comune = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.provFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniListComponent.filterValues.prov = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.emailFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniListComponent.filterValues.email = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.telefonoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniListComponent.filterValues.telefono = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.nomeCognomeGenitoreFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.alunniListComponent.filterValues.nomeCognomeGenitore = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

  }
//#endregion

//#region ----- Reset vari -------
  resetMainFilter() {
    if (this.alunniListComponent.matDataSource.filterPredicate == this.alunniListComponent.storedFilterPredicate){
      this.alunniListComponent.matDataSource.filter = ''; 
      this.alunniListComponent.filterInput.nativeElement.value = '';
      this.alunniListComponent.matDataSource.filterPredicate = this.alunniListComponent.filterRightPanel()
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

    this.nomeCognomeGenitoreFilter.setValue('', {emitEvent:false});
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

    this.nomeCognomeGenitoreFilter.setValue('');
  }
//#endregion
}
