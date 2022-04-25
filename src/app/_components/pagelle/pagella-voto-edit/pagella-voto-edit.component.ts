import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';

import { DOC_PagellaVoto, DOC_TipoGiudizio } from 'src/app/_models/DOC_PagellaVoto';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { PagellaVotiService } from '../pagella-voti.service';
import { PagelleService } from '../pagelle.service';
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
    "multiVoto",
    "note"
  ];
//#endregion  
//#region ----- ViewChild Input Output -------
  @Input('pagellaID') pagellaID!:                       number;
  @Input('iscrizioneID') iscrizioneID!:                 number;
  @Input('periodo') periodo!:                           number;
  @Input('classeSezioneAnnoID') classeSezioneAnnoID!:   number;
//#endregion

  constructor( 
    private svcPagella:                   PagelleService,
    private svcPagellaVoti:               PagellaVotiService,
    private svcClasseSezioneAnno:         ClassiSezioniAnniService,
    private _loadingService:              LoadingService,
    private _snackBar:                    MatSnackBar,
    public _dialog:                       MatDialog  ) { 
  }

  ngOnChanges() {
    if (this.pagellaID != undefined) {
      this.loadData();
    }
  }

  ngOnInit(): void {
  }

  loadData () {

    this.obsTipiGiudizio$= this.svcPagellaVoti.listTipiGiudizio();

    let obsPagella$: Observable<DOC_PagellaVoto[]>;


    obsPagella$ = this.svcClasseSezioneAnno.get(this.classeSezioneAnnoID)
      .pipe (
        concatMap( val => this.svcPagellaVoti.listByAnnoClassePagella(val.annoID, val.classeSezione.classeID, this.pagellaID)
      )
      );

    //obsPagella$= this.svcPagellaVoti.listByAnnoClassePagella(2, 16, this.pagellaID);
    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagella$);

    loadPagella$.subscribe(val =>  {
        this.matDataSource.data = val;
        console.log ("matdatasurce val", val);
      }
    );
  }

  changeSelectGiudizio(formData: DOC_PagellaVoto, tipoGiudizioID: number, quad: number) {

    if (formData.tipoGiudizioID == null) 
        formData.tipoGiudizioID = 1;

    formData.pagellaID = this.pagellaID;
    let formData2 = Object.assign({}, formData);
    this.postput(formData2)
  }

  changeVoto(formData: DOC_PagellaVoto, voto: any, quad: number) {

    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    formData.voto = votoN;
    formData.pagellaID = this.pagellaID;
    //nel caso di post l'ID del giudizio va messo a 1
    if (formData.tipoGiudizioID == null) 
        formData.tipoGiudizioID = 1;

    let formData2 = Object.assign({}, formData);
    this.postput(formData2)
  }

  changeNote(formData: DOC_PagellaVoto, note: string, quad: number) {

    formData.note = note;
    formData.pagellaID = this.pagellaID;
    if (formData.tipoGiudizioID == null) 
        formData.tipoGiudizioID = 1;

    let formData2 = Object.assign({}, formData);
    this.postput(formData2)
  }
  
  postput (formInput: DOC_PagellaVoto) {

    //nel caso la pagella ancora non sia stata creata, va inserita
    if (this.pagellaID == -1) {
      let formDataPagella: DOC_Pagella = {
        iscrizioneID:           this.iscrizioneID,
        periodo:                this.periodo
      };
      this.svcPagella.post(formDataPagella)
    }

    delete formInput.iscrizione;
    delete formInput.materia;
    delete formInput.tipoGiudizio;
    
    




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



  openObiettivi(element: DOC_PagellaVoto) {
    //console.log ("open classeID 1", element.classeAnnoMateria!.classeID);
    //console.log ("open annoID 2", element.classeAnnoMateria!.annoID);
    console.log ("open materiaID 3", element.materiaID);

    const dialogConfig : MatDialogConfig = {
    panelClass: 'add-DetailDialog',
    width: '400px',
    height: '300px',
    data: {
      //classeID: element.classeAnnoMateria!.classeID,
      //annoID: element.classeAnnoMateria!.annoID,
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
