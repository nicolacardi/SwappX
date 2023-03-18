import { Component, OnInit }                    from '@angular/core';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';
import jsPDF from 'jspdf';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PagineService }                        from '../pagine.service';
import { JspdfService }                         from '../../utilities/jspdf/jspdf.service';

//models
import { TEM_Pagina }                           from 'src/app/_models/TEM_Pagina';
import { TEM_Template }                         from 'src/app/_models/TEM_Template';
import { FilesService }                         from '../../pagelle/files.service';
import { MatSnackBar }                          from '@angular/material/snack-bar';

import { rptBase }                              from 'src/app/_reports/rptBase';
import { BlocchiService }                       from '../blocchi.service';



@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['../templates.css']
})
export class TemplateComponent implements OnInit {

//#region ----- Variabili ----------------------
  public zoom:                                  number = 1;
  public templateID:                            number = 1;
  public numPagine:                             number = 1;
  public obsTemplate$!:                         Observable<TEM_Template>;
  public obsPagine$!:                           Observable<TEM_Pagina[]>;
  public magnete:                               boolean = true;
  public griglia:                               boolean = false;

//#endregion

  constructor(
    private svcPagine:                          PagineService,
    private svcFiles:                           FilesService,
    private svcBlocchi:                         BlocchiService,
    private _snackBar:                          MatSnackBar,

    private _loadingService :                   LoadingService,
    private _jspdf:                             JspdfService

  ) 
  { }

  ngOnInit(): void {
    this.loadData();

  }

  loadData() {
    const obsPagineTMP$ = this.svcPagine.listByTemplate(this.templateID)
    .pipe(
      tap(val=> this.numPagine = val.length)
    );
    this.obsPagine$ = this._loadingService.showLoaderUntilCompleted( obsPagineTMP$);
  }

  addPage() {
    let objPagina = {
      templateID: this.templateID,
      pagina: this.numPagine + 1
    };
    this.svcPagine.post(objPagina).subscribe(res=> this.loadData());
  }

  deletedPage(pageNum: number) {
    this.loadData();
  }

  incZoom(){
    if (this.zoom < 4) this.zoom++;
  }

  decZoom(){
    if (this.zoom > 1) this.zoom--;
  }

  toggleMagnete() {
    this.magnete = !this.magnete;
    if (this.magnete) this.griglia = false;

  }

  toggleGriglia() {
    this.griglia = !this.griglia;
    if (this.griglia) this.magnete = false;
  }



  createRptDoc() {

    this.svcBlocchi.listByTemplate(1)
    .subscribe( blocchi => {
      blocchi.forEach(blocco => {
        if (blocco.tipoBlocco!.descrizione=="Testo") {
          console.log(blocco)
          rptBase.push({
            "tipo": "TextHtml",
            "alias": "html2canvas",
            "value": "testotemp",
            "X": blocco.x,
            "Y": blocco.y,
            "W": blocco.w,
            "H": blocco.h
          });
          console.log (rptBase);
          this.savePdf();
        }
      })
    })
    
  }




  async savePdf() {


    //Chiamata al motore di stampa e salvataggio
    let rpt :jsPDF  = await this._jspdf.rptFromtemplate(rptBase);
    let retcode = this.svcFiles.saveFilePagella(rpt,222);

    if(retcode == true)
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Documento salvato in Database', panelClass: ['green-snackbar']});
    else
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']});
      
  }

  openPdf(){

    let docID = 222;

    this.svcFiles.getByDocAndTipo(docID,"Pagella").subscribe(
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
}
