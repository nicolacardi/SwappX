import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggle, MatButtonToggleChange } from '@angular/material/button-toggle';
import { iif, Observable, ReplaySubject } from 'rxjs';
import { concatMap, map, switchMap, tap } from 'rxjs/operators';
import { jsPDF } from 'jspdf';

//components
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { PagellaVotiService } from '../pagella-voti.service';
import { PagelleService } from '../pagelle.service';
import { FilesService } from '../files.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { JspdfService } from '../../utilities/jspdf/jspdf.service';

//classes
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';
import { DOC_File } from 'src/app/_models/DOC_File';
import { DOC_PagellaVoto } from 'src/app/_models/DOC_PagellaVoto';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

@Component({
  selector: 'app-pagelle-edit',
  templateUrl: './pagelle-edit.component.html',
  styleUrls: ['../pagelle.css']
})

export class PagellaEditComponent implements OnInit {

//#region ----- Variabili -------
  public objPagella!:                            DOC_Pagella;  
  lstPagellaVoti!:                               DOC_PagellaVoto[];

  dtIns!:                                        string;

  periodo!:                                      number;
  quadrimestre = 1;
  ckStampato!:                                   boolean;  
  formDataFile! :                                DOC_File;

//#endregion  

//#region ----- ViewChild Input Output -------
  @Input('iscrizioneID') iscrizioneID!:          number;
  @Input('alunno') alunno!:                      ALU_Alunno;
  @Input('classeSezioneAnnoID') classeSezioneAnnoID!:          number;

  @ViewChild('toggleQuad') toggleQuad!:           MatButtonToggle;
  //@ViewChild(PagellaVotoEditComponent) viewPagellaVotoEdit!: PagellaVotoEditComponent; 

//#endregion  

  constructor(
    private svcPagelle:               PagelleService,
    private svcPagellaVoti:           PagellaVotiService,
    private svcFiles:                 FilesService,
    private _loadingService:          LoadingService,
    private _snackBar:                MatSnackBar ,
    private _jspdf:                   JspdfService
    ) { }

  ngOnChanges() {
    if (this.iscrizioneID != undefined) 
      this.loadData();
  }

  ngOnInit(): void {
  }

  loadData() {
    //this.periodo = this.toggleQuad;
    let obsPagelle$: Observable<DOC_Pagella[]>;
    obsPagelle$= this.svcPagelle.listByIscrizione(this.iscrizioneID);
    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagelle$);

    loadPagella$.pipe (
      map(val=>val.filter(val=>(val.periodo == this.quadrimestre)))).subscribe(
        val =>  {
          if (val.length != 0)  {
            this.objPagella = val[0];
            this.dtIns = val[0].dtIns!;
          }
          else {
            const d = new Date();
            d.setSeconds(0,0);
            let dateNow = d.toISOString().split('.')[0];
            
            this.objPagella = <DOC_Pagella>{};
            this.objPagella.id = -1;
            this.objPagella.iscrizioneID = this.iscrizioneID;
            //this.objPagella.periodo = this.periodo;
            this.objPagella.periodo = this.quadrimestre;
            this.objPagella.dtIns = dateNow;
            this.ckStampato = false;
            this.dtIns = '';
          }
        }
    );
  }

  quadClick(e: MatButtonToggleChange) {
    this.quadrimestre = e.value;
    this.loadData();
  }

  aggiornaData () {

    let formData = <DOC_Pagella>{
      id: this.objPagella.id!,
      iscrizioneID: this.iscrizioneID
    }
  }

  openPdfPagella(){

    if(this.objPagella == null || this.objPagella.id! <0) {
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Pagella non ancora generata', panelClass: ['red-snackbar']})
      return;
    }

    this.svcFiles.getByDocAndTipo(this.objPagella.id,"Pagella").subscribe(
        res => {
          //si crea un elemento fittizio che scarica il file di tipo base64 che gli viene assegnato
          const source = `data:application/pdf;base64,${res.fileBase64}`;
          const link = document.createElement("a");

          link.href = source;
          link.download = `${"test"}.pdf`
          link.click();
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore di caricamento', panelClass: ['red-snackbar']})
      );
  }

  async savePdfPagella() {

    if (this.objPagella.id == -1 ){
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Pagella inesistente - inserire almeno un voto', panelClass: ['red-snackbar']});
      return;
    }

    //costruiamo una promise per attendere il caricamento della lista voti
    const reloadLstPagellaVoti = () => new Promise((resolve, reject) => {
      if(this.objPagella.iscrizione != undefined){
        this.svcPagellaVoti.listByAnnoClassePagella(this.objPagella.iscrizione?.classeSezioneAnno.annoID!,  this.objPagella.iscrizione?.classeSezioneAnno.classeSezione.classeID,this.objPagella.id! )
          .subscribe(
            (res: DOC_PagellaVoto[]) => {
              this.lstPagellaVoti = res;
              resolve ("Lista voti caricata");
            }
          );
      }
    });
    await reloadLstPagellaVoti();

    //Chiamata al motore di stampa e salvataggio
    let rpt :jsPDF  = await this._jspdf.dynamicRptPagella(this.objPagella, this.lstPagellaVoti);
    let retcode = this.svcFiles.saveFilePagella(rpt,this.objPagella.id!);

    if(retcode == true)
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Pagella salvata in Database', panelClass: ['green-snackbar']});
    else
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']});
      
    this.svcPagelle.setStampato(this.objPagella.id!, true).subscribe();

 /* 29/10/2022 - sostituito da svcFiles.saveFilePagella
    //Preparazione Blob con il contenuto base64 del pdf e salvataggio su DB
    let blobPDF = new Blob([rpt.output('blob')],{type: 'application/pdf'});
    
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(blobPDF);
    reader.onload = (x) => result.next(btoa(x.target!.result!.toString()));
    
    this.formDataFile = {
      tipoDoc:         "Pagella",
      docID:           this.objPagella.id!,
      estensione:       "pdf"
    };

    result.pipe (
      tap(val=> this.formDataFile.fileBase64 = val),
      
      //ora cerca se esiste già un record nei file...
      concatMap(() => this.svcFiles.getByDocAndTipo(this.objPagella.id, "pagella")),

      //a seconda del risultato fa una post o una put
      switchMap(res => {
        if (res == null) {
          //console.log ("non ha trovato=> esegue una post")
          return this.svcFiles.post(this.formDataFile)
        } else {
          //console.log ("ha trovato=> valorizza l'id e esegue una put")
          this.formDataFile.id = res.id
          return this.svcFiles.put(this.formDataFile)
        }
      }),
    ).subscribe(
      res => ( this._snackBar.openFromComponent(SnackbarComponent, {data: 'Pagella salvata in Database', panelClass: ['green-snackbar']})),
      err =>  {}
    );
    this.svcPagelle.setStampato(this.objPagella.id!, true).subscribe();
    */
  }
}
