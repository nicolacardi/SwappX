import { Component, Input, OnInit} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

//components
import { AlunniListComponent } from '../alunni-list/alunni-list.component';

@Component({
  selector: 'app-alunni-filter',
  templateUrl: './alunni-filter.component.html',
  styleUrls: ['../alunni.css']
})

export class AlunniFilterComponent implements OnInit {

//#region ----- Variabili -------
  nomeFilter = new UntypedFormControl('');
  cognomeFilter = new UntypedFormControl('');
  dtNascitaFilter = new UntypedFormControl('');
  indirizzoFilter = new UntypedFormControl('');
  comuneFilter = new UntypedFormControl('');
  provFilter = new UntypedFormControl('');
  emailFilter = new UntypedFormControl('');
  telefonoFilter = new UntypedFormControl('');
  nomeCognomeGenitoreFilter = new UntypedFormControl('');
//#endregion
  
//#region ----- ViewChild Input Output -------  
  @Input() alunniListComponent!: AlunniListComponent;
//#endregion

  constructor() {}

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    this.nomeFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();  
        this.alunniListComponent.filterValues.nome = val.toLowerCase();
        console.log(this.alunniListComponent.filterValues)
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.cognomeFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();
        this.alunniListComponent.filterValues.cognome = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.dtNascitaFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();
        this.alunniListComponent.filterValues.dtNascita = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.indirizzoFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();
        this.alunniListComponent.filterValues.indirizzo = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.comuneFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();
        this.alunniListComponent.filterValues.comune = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.provFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();
        this.alunniListComponent.filterValues.prov = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.emailFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();
        this.alunniListComponent.filterValues.email = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.telefonoFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();
        this.alunniListComponent.filterValues.telefono = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

    this.nomeCognomeGenitoreFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();
        this.alunniListComponent.filterValues.nomeCognomeGenitore = val.toLowerCase();
        this.alunniListComponent.matDataSource.filter = JSON.stringify(this.alunniListComponent.filterValues);
      }
    )

  }
//#endregion

//#region ----- Reset vari -------

  //AS: pulizia filtro di sinistra, chiamata su edit filtro di destra
  // PER IL MOMENTO NON UTILIZZATA
  resetFilterSx() {
      // this.alunniListComponent.matDataSource.filter = ''; 
      // this.alunniListComponent.filterValue = '';
      // this.alunniListComponent.filterValues.filtrosx = ''; 
      // this.alunniListComponent.filterInput.nativeElement.value = '';
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
    this.nomeCognomeGenitoreFilter.setValue('', {emitEvent:false});
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
    this.nomeCognomeGenitoreFilter.setValue('');
  }

  //#endregion
}
