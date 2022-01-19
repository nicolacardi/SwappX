import { Component, Input, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';

//components
import { GenitoriListComponent } from '../genitori-list/genitori-list.component';

@Component({
  selector: 'app-genitori-filter',
  templateUrl: './genitori-filter.component.html',
  styleUrls: ['../genitori.css']
})

export class GenitoriFilterComponent implements OnInit {

 //#region ----- Variabili -------
  nomeFilter = new FormControl('');
  cognomeFilter = new FormControl('');
  dtNascitaFilter = new FormControl('');
  indirizzoFilter = new FormControl('');
  comuneFilter = new FormControl('');
  provFilter = new FormControl('');
  emailFilter = new FormControl('');
  telefonoFilter = new FormControl('');
  nomeCognomeAlunnoFilter = new FormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
  @Input() genitoriListComponent!: GenitoriListComponent;
//#endregion

  constructor() {}

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    this.nomeFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.genitoriListComponent.filterValues.nome = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.cognomeFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.genitoriListComponent.filterValues.cognome = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.dtNascitaFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.genitoriListComponent.filterValues.dtNascita = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.genitoriListComponent.filterValues.indirizzo = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.comuneFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.genitoriListComponent.filterValues.comune = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.provFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.genitoriListComponent.filterValues.prov = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.emailFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.genitoriListComponent.filterValues.email = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.telefonoFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.genitoriListComponent.filterValues.telefono = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )

    this.nomeCognomeAlunnoFilter.valueChanges
    .subscribe(
      val => {
        //this.resetFilterSx();
        this.genitoriListComponent.filterValues.nomeCognomeAlunno = val.toLowerCase();
        this.genitoriListComponent.matDataSource.filter = JSON.stringify(this.genitoriListComponent.filterValues);
      }
    )
  }
//#endregion

//#region ----- Reset vari -------
  resetFilterSx() {
    //this.genitoriListComponent.matDataSource.filter = ''; 
    //this.genitoriListComponent.filterValue = ''; DA AGGIUNGERE PER EVITARE CHE LA CUSTOMPIPE highlight funzioni male ma prima va creata this.filtervalue nel component come negli altri
    //this.genitoriListComponent.filterValues.filtrosx = ''; 
    //this.genitoriListComponent.filterInput.nativeElement.value = '';
    //console.log(this.genitoriListComponent.filterValues);
  }

  resetAllInputs() {
    this.nomeFilter.setValue('', {emitEvent:false});
    this.cognomeFilter.setValue('', {emitEvent:false});
    this.indirizzoFilter.setValue('', {emitEvent:false});
    this.dtNascitaFilter.setValue('', {emitEvent:false});
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
    this.dtNascitaFilter.setValue('');
    this.comuneFilter.setValue('');
    this.provFilter.setValue('');
    this.emailFilter.setValue('');
    this.telefonoFilter.setValue('');
    this.nomeCognomeAlunnoFilter.setValue('');
  }
//#endregion
}
