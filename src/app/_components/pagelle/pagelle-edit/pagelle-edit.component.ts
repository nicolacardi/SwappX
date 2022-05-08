import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggle, MatButtonToggleChange } from '@angular/material/button-toggle';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { jsPDF } from 'jspdf';

//services
import { PagelleService } from '../pagelle.service';
import { FilesService } from '../files-service';
import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';
import { JspdfService } from '../../utilities/jspdf/jspdf.service';
import { PagellaVotoEditComponent } from '../pagella-voto-edit/pagella-voto-edit.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

@Component({
  selector: 'app-pagelle-edit',
  templateUrl: './pagelle-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class PagellaEditComponent implements OnInit {

//#region ----- Variabili -------
  public objPagella!:                            DOC_Pagella;  
  dtIns!:                                        string;

  periodo!:                                      number;
  toggleQuadVal!:                                number;
  
  ckStampato!:                                   boolean;  
    
//#endregion  

//#region ----- ViewChild Input Output -------
  @Input('iscrizioneID') iscrizioneID!:          number;
  @Input('classeSezioneAnnoID') classeSezioneAnnoID!:          number;
  @ViewChild('toggleQuad') toggleQuad!:           MatButtonToggle;
  @ViewChild(PagellaVotoEditComponent) viewPagellaVotoEdit!: PagellaVotoEditComponent; 
//#endregion  

  constructor(private svcPagelle:               PagelleService,
              private svcFiles:                 FilesService,
              private _loadingService:          LoadingService,
              private _snackBar:                MatSnackBar ,
              private _jspdf:                   JspdfService ) {
  }

  ngOnChanges() {
    if (this.iscrizioneID != undefined) 
      this.loadData(1);
  }

  ngOnInit(): void {
  }

  loadData(toggleQuad: number) {

    this.periodo = toggleQuad;
    let obsPagelle$: Observable<DOC_Pagella[]>;
    obsPagelle$= this.svcPagelle.listByIscrizione(this.iscrizioneID);
    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagelle$);

    loadPagella$.pipe (
      map(val=>val.filter(val=>(val.periodo == toggleQuad)))
    ).subscribe(val =>  {

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
          this.objPagella.periodo = this.periodo;
          this.objPagella.dtIns = dateNow;
          this.ckStampato = false;
          this.dtIns = '';
        }
      }
    );
  }

  quadClick(e: MatButtonToggleChange) {
    this.loadData(e.value);
    this.periodo = e.value;
  }

  aggiornaData () {

    let formData = <DOC_Pagella>{
      //id: this.pagellaID,
      id: this.objPagella.id!,
      iscrizioneID: this.iscrizioneID
    }
  }

  openPdfPagella(){

    //api get 
    //api/DOC_Files/GetByDocAndTipo/id/Pagella

    console.log("this.objPagella: ", this.objPagella);

    if(this.objPagella == null || this.objPagella.id! <0) {
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Pagella non ancora generata', panelClass: ['red-snackbar']})
      return;
    }
    
    this.svcFiles.getByDocAndTipo(this.objPagella.id,"Pagella").subscribe(
        res => {
console.log("base64: ", res.fileBase64);

        },
        err => {}
      );
     


  }

  savePdfPagella() {

    //elenco i campi da tenere
    let fieldsToKeep = ['materia'];
    //elenco i nomi delle colonne
    let columnsNames = [['materia']];
    
    let rpt :jsPDF  = this._jspdf.creaPdf(
      this.viewPagellaVotoEdit.matDataSource.data, 
      columnsNames,
      fieldsToKeep,
      "Report Pagelle");

      //Preparazione Blob con il contenuto base64 del pdf
      let blobPDF = new Blob([rpt.output('blob')],{type: 'application/pdf'});
      
      const result = new ReplaySubject<string>(1);
      const reader = new FileReader();
      reader.readAsBinaryString(blobPDF);
      reader.onload = (x) => result.next(btoa(x.target!.result!.toString()));
      
      result.subscribe(base64 => {
        let risultato = base64;
        //console.log ("BLOB:" , risultato);
      });
      
      //TODO .... chiamare WS
      
      this.svcPagelle.setStampato(this.objPagella.id!, true).subscribe();
    }
}
