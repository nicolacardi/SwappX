import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { DOC_PagellaVoto, DOC_TipoGiudizio } from 'src/app/_models/DOC_PagellaVoto';
import { LoadingService } from '../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { PagellaVotiService } from '../pagella-voti.service';
import { VotiObiettiviEditComponent } from '../voti-obiettivi-edit/voti-obiettivi-edit.component';

@Component({
  selector: 'app-pagella-voto-edit',
  templateUrl: './pagella-voto-edit.component.html',
  styleUrls: ['../pagelle.css']
})

export class PagellaVotoEditComponent implements OnInit  {
//#region ----- Variabili -------
  matDataSource = new           MatTableDataSource<DOC_PagellaVoto>();

  obsTipiGiudizio$!:            Observable<DOC_TipoGiudizio[]>;
  showPageTitle:                boolean = true;

  displayedColumns: string[] = [
    "materia", 
    // "voto1", 
    // "tipoGiudizio1ID", 
    // "obiettivi",
    "multiVoto1",
    "note1"
  ];
//#endregion  
//#region ----- ViewChild Input Output -------
  @Input('iscrizioneID') iscrizioneID!:          number;
//#endregion

  constructor( private svcPagellaVoti:               PagellaVotiService,
               private _loadingService:              LoadingService,
               private _snackBar:                    MatSnackBar,
               public _dialog:                       MatDialog  ) { 
  }

  ngOnChanges() {
    if (this.iscrizioneID != undefined) {
      this.loadData();
    }
   // console.log();
  }

  ngOnInit(): void {
  }

  loadData () {

    this.obsTipiGiudizio$= this.svcPagellaVoti.listTipiGiudizio();

    let obsPagella$: Observable<DOC_PagellaVoto[]>;

    obsPagella$= this.svcPagellaVoti.listByIscrizione(this.iscrizioneID);
    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagella$);

    loadPagella$.subscribe(val =>  {
        this.matDataSource.data = val;
        //console.log (val)
        //this.matDataSource.paginator = this.paginator;          
        //this.sortCustom();
        //this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
  }

  changeSelectGiudizio(formData: DOC_PagellaVoto, tipoGiudizioID: number, quad: number) {
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

  changeVoto(formData: DOC_PagellaVoto, voto: any, quad: number) {
    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    if (quad == 1) 
      formData.voto1 = votoN;
    else 
      formData.voto2 = votoN;

    //nel caso di post l'ID del giudizio va messo a 1
    if (formData.tipoGiudizio1ID == null) 
        formData.tipoGiudizio1ID = 1;
    if (formData.tipoGiudizio2ID == null) 
        formData.tipoGiudizio2ID = 1;
    let formData2 = Object.assign({}, formData);
    this.postput(formData2)
  }

  changeNote(formData: DOC_PagellaVoto, note: string, quad: number) {
    if (quad == 1)
      formData.note1 = note;
    else 
      formData.note2 = note;
    
    //nel caso di post l'ID del giudizio va messo a 1
    if (formData.tipoGiudizio1ID == null) 
        formData.tipoGiudizio1ID = 1;
    if (formData.tipoGiudizio2ID == null) 
        formData.tipoGiudizio2ID = 1;
    let formData2 = Object.assign({}, formData);
    this.postput(formData2)
  }
  
  postput (formInput: DOC_PagellaVoto) {
    delete formInput.iscrizione;
    delete formInput.materia;

    if (formInput.id == 0) {
      //post
      this.svcPagellaVoti.post(formInput).subscribe(
        res => {
        //  this._snackBar.openFromComponent(SnackbarComponent, {data: 'Voto Salvato post', panelClass: ['green-snackbar']})
        this.loadData();
        },
        err => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio post', panelClass: ['red-snackbar']})}
      )
    } else {
      //put
      this.svcPagellaVoti.put(formInput).subscribe(
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
        // "voto1", 
        // "tipoGiudizio1ID", 
        // "obiettivi",
        "multiVoto1",
        "note1"
      ];
    } else {
      this.displayedColumns = [
        "materia", 
        // "voto2", 
        // "tipoGiudizio2ID", 
        // "obiettivi",
        "multiVoto2",
        "note2"
      ];
    }
  }

  openObiettivi(element: DOC_PagellaVoto) {
    console.log ("open classeID 1", element.classeAnnoMateria.classeID);
    console.log ("open annoID 2", element.classeAnnoMateria.annoID);
    console.log ("open materiaID 3", element.materiaID);

    const dialogConfig : MatDialogConfig = {
    panelClass: 'add-DetailDialog',
    width: '400px',
    height: '300px',
    data: {
      classeID: element.classeAnnoMateria.classeID,
      annoID: element.classeAnnoMateria.annoID,
      materiaID: element.materiaID
      }
    }
    
    const dialogRef = this._dialog.open(VotiObiettiviEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => { 
        this.loadData(); 
      }
    );
  }
}
