import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { DOC_Pagella, DOC_TipoGiudizio } from 'src/app/_models/DOC_Pagella';
import { LoadingService } from '../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { PagelleService } from '../pagelle.service';

@Component({
  selector: 'app-pagella-edit',
  templateUrl: './pagella-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class PagellaEditComponent implements OnInit  {
//#region ----- Variabili -------
  matDataSource = new           MatTableDataSource<DOC_Pagella>();

  obsTipiGiudizio$!:            Observable<DOC_TipoGiudizio[]>;
  showPageTitle:                boolean = true;

  displayedColumns: string[] = [
    "materia", 
    "voto1", 
    "tipoGiudizio1ID", 
    "obiettivi",
    "note1"
  ];
//#endregion  
//#region ----- ViewChild Input Output -------
  @Input('idIscrizione') idIscrizione!:          number;
//#endregion


  constructor(
    private svcPagella:                   PagelleService,
    private _loadingService:              LoadingService,
    private _snackBar:                    MatSnackBar,
  ) { 
  }

  ngOnChanges() {
    if (this.idIscrizione != undefined) {
      this.loadData();
    }
   // console.log();
  }

  ngOnInit(): void {
  }

  loadData () {

    this.obsTipiGiudizio$= this.svcPagella.listTipiGiudizio();

    let obsPagella$: Observable<DOC_Pagella[]>;

    obsPagella$= this.svcPagella.listPagellaByIscrizione(this.idIscrizione);
    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagella$);

    loadPagella$.subscribe(val =>  {
        this.matDataSource.data = val;
        
        //this.matDataSource.paginator = this.paginator;          
        //this.sortCustom();
        //this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
    
  }



  changeSelectGiudizio(formData: DOC_Pagella, tipoGiudizioID: number, quad: number) {
    if (quad == 1) {
      formData.tipoGiudizio1ID = tipoGiudizioID;
      if (formData.tipoGiudizio2ID == null) 
          formData.tipoGiudizio2ID = 1;
    } else {
      formData.tipoGiudizio2ID = tipoGiudizioID;
      if (formData.tipoGiudizio1ID == null) 
          formData.tipoGiudizio1ID = 1;
    }
    let formData2 = Object.assign({}, formData);
    this.postput(formData2)
  }

  changeVoto(formData: DOC_Pagella, voto: any, quad: number) {
    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    if (quad == 1) {
      formData.voto1 = votoN;
    } else {
      formData.voto2 = votoN;
    }
    //nel caso di post l'ID del giudizio va messo a 1
    if (formData.tipoGiudizio1ID == null) 
        formData.tipoGiudizio1ID = 1;
    if (formData.tipoGiudizio2ID == null) 
        formData.tipoGiudizio2ID = 1;
    let formData2 = Object.assign({}, formData);
    this.postput(formData2)
  }

  changeNote(formData: DOC_Pagella, note: string, quad: number) {
    if (quad == 1) {
      formData.note1 = note;
    } else {
      formData.note2 = note;
    }
    //nel caso di post l'ID del giudizio va messo a 1
    if (formData.tipoGiudizio1ID == null) 
        formData.tipoGiudizio1ID = 1;
    if (formData.tipoGiudizio2ID == null) 
        formData.tipoGiudizio2ID = 1;
    let formData2 = Object.assign({}, formData);
    this.postput(formData2)
  }
  
  postput (formInput: DOC_Pagella) {
    delete formInput.iscrizione;
    delete formInput.materia;

    if (formInput.id == 0) {
      //post
      this.svcPagella.post(formInput).subscribe(
        res => {
        //  this._snackBar.openFromComponent(SnackbarComponent, {data: 'Voto Salvato post', panelClass: ['green-snackbar']})
        this.loadData();
        },
        err => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio post', panelClass: ['red-snackbar']})}
      )
    } else {
      //put
      this.svcPagella.put(formInput).subscribe(
        res => {
        //  this._snackBar.openFromComponent(SnackbarComponent, {data: 'Voto Salvato put', panelClass: ['green-snackbar']})
        //this.loadData();
        },
        err => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio put', panelClass: ['red-snackbar']})}
      )
    }
  }

  quadClick(e: MatButtonToggleChange) {
    console.log (e.value);
    if (e.value == 1) {
      this.displayedColumns = [
        "materia", 
        "voto1", 
        "tipoGiudizio1ID", 
        "obiettivi",
        "note1"
      ];
    } else {
      this.displayedColumns = [
        "materia", 
        "voto2", 
        "tipoGiudizio2ID", 
        "obiettivi",
        "note2"
      ];
    }

  }

  openObiettivi(element: DOC_Pagella) {

  }
}
