import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { iif, Observable } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { VotiObiettiviEditComponent } from '../voti-obiettivi-edit/voti-obiettivi-edit.component';

//services
import { PagellaVotiService } from '../pagella-voti.service';
import { PagelleService } from '../pagelle.service';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';
import { DOC_PagellaVoto, DOC_TipoGiudizio } from 'src/app/_models/DOC_PagellaVoto';

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
  @Input('objPagella') objPagella!:                     DOC_Pagella;
  @Input('classeSezioneAnnoID') classeSezioneAnnoID!:   number;

  @Output('reloadParent') reloadParent = new EventEmitter(); //EMESSO quando si clicca sul (+) di aggiunta alle classi frequentate

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
    if (this.objPagella != undefined) 
      this.loadData();
  }

  ngOnInit(): void {
  }

  loadData () {

    this.obsTipiGiudizio$= this.svcPagellaVoti.listTipiGiudizio();

    let obsPagella$: Observable<DOC_PagellaVoto[]>;
    obsPagella$ = this.svcClasseSezioneAnno.get(this.classeSezioneAnnoID).pipe (
        concatMap( val => this.svcPagellaVoti.listByAnnoClassePagella(val.annoID, val.classeSezione.classeID, this.objPagella.id!)
      ));

    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagella$);
    loadPagella$.subscribe(val => this.matDataSource.data = val );
  }

  changeSelectGiudizio(formData: DOC_PagellaVoto, tipoGiudizioID: number) {

    if (formData.tipoGiudizioID == null) 
        formData.tipoGiudizioID = 1;

    formData.pagellaID = this.objPagella.id;
    formData.tipoGiudizioID = tipoGiudizioID;
    let formData2 = Object.assign({}, formData);
    this.save(formData2)

    if (this.objPagella.ckStampato) this.resetStampato();
  }

  changeVoto(formData: DOC_PagellaVoto, voto: any) {

    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    formData.voto = votoN;
    formData.pagellaID = this.objPagella.id;
    //nel caso di post l'ID del giudizio va messo a 1
    if (formData.tipoGiudizioID == null) 
        formData.tipoGiudizioID = 1;

    let formData2 = Object.assign({}, formData);
    this.save(formData2)

    if (this.objPagella.ckStampato) this.resetStampato();
  }

  changeNote(formData: DOC_PagellaVoto, note: string) {

    

    formData.note = note;
    formData.pagellaID = this.objPagella.id;;
    if (formData.tipoGiudizioID == null) 
        formData.tipoGiudizioID = 1;

    let formData2 = Object.assign({}, formData);

    this.save(formData2)

    if (this.objPagella.ckStampato) this.resetStampato();
  }
  
  save (formInput: DOC_PagellaVoto) {

    //pulizia forminput da oggetti composti
    delete formInput.iscrizione;
    delete formInput.materia;
    delete formInput.tipoGiudizio;

    //nel caso la pagella ancora non sia stata creata, va inserita

    console.log("BELLA MERDA", formInput);

    if (this.objPagella.id == -1) {

      //console.log("INSERT - objPagella: ", this.objPagella);
    
      this.svcPagella.post(this.objPagella)
        .pipe (
          tap( x =>  {
            //console.log("x", x);
            formInput.pagellaID = x.id! 
          } ),
          concatMap( () =>   
            iif( () => formInput.id == 0 || formInput.id == undefined,
              this.svcPagellaVoti.post(formInput),
              this.svcPagellaVoti.put(formInput)
          )
        ))
        .subscribe(
          res => {},
          err => {}
        )
    }
    else {    //caso pagella già presente

      if (formInput.id == 0) {
        //post

        console.log("formInput", formInput);
        this.svcPagellaVoti.post(formInput).subscribe(
          res => { this.loadData();  },
          err => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio post', panelClass: ['red-snackbar']})}
        )
      } else {
        //put
        this.svcPagellaVoti.put(formInput).subscribe(
          res => {  },
          err => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio put', panelClass: ['red-snackbar']})}
        )
      }
    }
  }

  openObiettivi(element: DOC_PagellaVoto) {

    const dialogConfig : MatDialogConfig = {
    panelClass: 'add-DetailDialog',
    width: '600px',
    height: '300px',
    data: {
        iscrizioneID:         this.objPagella.iscrizioneID,
        pagellaID:            this.objPagella.id,
        periodo:              this.objPagella.periodo,
        pagellaVotoID:        element.id,
        materiaID:            element.materiaID,
        classeSezioneAnnoID:  this.classeSezioneAnnoID
      }
    }
    
    const dialogRef = this._dialog.open(VotiObiettiviEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => { 
        this.reloadParent.emit();
        this.loadData(); 
      });
  }

  resetStampato() {
    this.svcPagella.setStampato(this.objPagella.id!, false).subscribe();
  }
}