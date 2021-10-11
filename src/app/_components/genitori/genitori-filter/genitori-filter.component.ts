import { Component, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GenitoriListComponent } from '../genitori-list/genitori-list.component';

@Component({
  selector: 'app-genitori-filter',
  templateUrl: './genitori-filter.component.html',
  styleUrls: ['../genitori.css']
})

export class GenitoriFilterComponent implements OnInit {

  @Input() genitoriListComponent!: GenitoriListComponent;
  
  nomeFilter = new FormControl('');
  cognomeFilter = new FormControl('');
  annoNascitaFilter = new FormControl('');
  indirizzoFilter = new FormControl('');
  comuneFilter = new FormControl('');
  provFilter = new FormControl('');
  emailFilter = new FormControl('');
  telefonoFilter = new FormControl('');
  
  nomeCognomeAlunnoFilter = new FormControl('');

  constructor() {}

  ngOnInit() {

    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.genitoriListComponent.filterValues.nome = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.genitoriListComponent.filterValues.cognome = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.annoNascitaFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.genitoriListComponent.filterValues.annoNascita = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        if (this.genitoriListComponent.matDataSource.filterPredicate == this.genitoriListComponent.storedFilterPredicate)
        {this.genitoriListComponent.matDataSource.filterPredicate = this.genitoriListComponent.filterRightPanel()};

        this.genitoriListComponent.filterValues.indirizzo = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.comuneFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.genitoriListComponent.filterValues.comune = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.provFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.genitoriListComponent.filterValues.prov = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.emailFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.genitoriListComponent.filterValues.email = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.telefonoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.genitoriListComponent.filterValues.telefono = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.nomeCognomeAlunnoFilter.valueChanges
    .subscribe(
      val => {
        this.resetMainFilter();
        this.genitoriListComponent.filterValues.nomeCognomeAlunno = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )
  }

  resetMainFilter() {
    if (this.genitoriListComponent.matDataSource.filterPredicate == this.genitoriListComponent.storedFilterPredicate)
    {
    this.genitoriListComponent.matDataSource.filter = ''; 
    this.genitoriListComponent.filterInput.nativeElement.value = '';
    this.genitoriListComponent.matDataSource.filterPredicate = this.genitoriListComponent.filterRightPanel()};  
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

    this.nomeCognomeAlunnoFilter.setValue('', {emitEvent:false});
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

    this.nomeCognomeAlunnoFilter.setValue('');
  }
}
