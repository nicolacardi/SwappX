//#region ----- IMPORTS ------------------------

import { Component, OnInit }                    from '@angular/core';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';
import jsPDF                                    from 'jspdf';
import { MatTableDataSource }                   from '@angular/material/table';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PagineService }                        from '../pagine.service';
import { JspdfService }                         from '../../utilities/jspdf/jspdf.service';
import { BlocchiService }                       from '../blocchi.service';
import { PaginatorService }                     from '../../utilities/paginator/paginator.service';
import { TemplatesService }                     from '../templates.service';

//models
import { TEM_Pagina }                           from 'src/app/_models/TEM_Pagina';
import { TEM_Template }                         from 'src/app/_models/TEM_Template';
import { FilesService }                         from '../../pagelle/files.service';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { A4V, A4H, A3V, A3H }                   from 'src/environments/environment';

import { rptBasePdfMake }                       from 'src/app/_reports/rptBase';
import { PdfmakeService }                       from '../../utilities/pdfmake/pdfmake.service';
//#endregion


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
  public A4A3:                                  string = 'A4V';
  public pageW!:                                number;
  public pageH!:                                number;
  public selectedRowIndex:                      number = 1;
  public template!:                             TEM_Template;
  public obsTemplates$!:                        Observable<TEM_Template[]>;
  public obsPagine$!:                           Observable<TEM_Pagina[]>;

  matDataSource =                               new MatTableDataSource<TEM_Template>();
  displayedColumnsTemplates:                    string[] =  ["descrizione"];
  public snapObjects:                           boolean = true;
  public magnete:                               boolean = true;
  public griglia:                               boolean = false;
  

  public objFields = {
      AlunniList_email: "andrea.svegliado@gmail.com",
      AlunniList_cap: "35136",
      AlunniList: [{
        nome: "Toni",
        cognome: "1",
        indirizzo: "Roma"
      },
      {
        nome: "Bepi",
        cognome: "2",
        indirizzo: "Padova"
      },
      {
        nome: "Bepi",
        cognome: "3",
        indirizzo: "Padova"
      },
      {
        nome: "Bepi",
        cognome: "4",
        indirizzo: "Padova"
      },
      {
        nome: "Bepi",
        cognome: "5",
        indirizzo: "Padova"
      },
      {
        nome: "Bepi",
        cognome: "6",
        indirizzo: "Padova"
      },
      {
        nome: "Bepi",
        cognome: "7",
        indirizzo: "Padova"
      },
      {
        nome: "Bepi",
        cognome: "8",
        indirizzo: "Padova"
      },
      {
        nome: "Bepi",
        cognome: "9",
        indirizzo: "Padova"
      },
      {
        nome: "Bepi",
        cognome: "10",
        indirizzo: "Padova"
      },
      {
        nome: "Bepi",
        cognome: "11",
        indirizzo: "Padova"
      },
      {
        nome: "Guido",
        cognome: "La Moto",
        indirizzo: "Vicenza"
      }]
    }
//#endregion

  constructor(
    private svcTemplates:                       TemplatesService,
    private svcPagine:                          PagineService,
    private svcFiles:                           FilesService,
    private svcBlocchi:                         BlocchiService,
    private _snackBar:                          MatSnackBar,

    private _loadingService :                   LoadingService,
    private _paginator:                         PaginatorService,
    private _jspdf:                             JspdfService,
    private svcPdfMake:                         PdfmakeService    
  ) 
  { }

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.obsTemplates$= this.svcTemplates.list();
    const loadTemplates$ =this._loadingService.showLoaderUntilCompleted(this.obsTemplates$);
    loadTemplates$.subscribe( val =>   {
      this.matDataSource.data = val;
    });
  
    this.svcTemplates.get(this.templateID).subscribe(
      res=> {
        this.template = res;
        this.A4A3 = res.formatoPagina;
      }
    )

    const obsPagineTMP$ = this.svcPagine.listByTemplate(this.templateID)
    .pipe(
      tap(val=> this.numPagine = val.length)
    );
    this.obsPagine$ = this._loadingService.showLoaderUntilCompleted( obsPagineTMP$);
  }
//#endregion

//#region ----- Altri metodi (Zoom, Add/deletePage, snap, formatoPagina) -------------------

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
    if (this.zoom < 3) this.zoom++;
  }

  decZoom(){
    if (this.zoom > 1) this.zoom--;
  }

  switchOrientation() {
    switch(this.A4A3) {
      case 'A4V': 
        this.A4A3 = "A4H"
      break;
      case 'A4H': 
        this.A4A3 = "A4V"
      break;
      case 'A3V': 
        this.A4A3 = "A3H"
      break;
      case 'A3H': 
        this.A4A3 = "A3V"
      break;
    }
    //salvo nel template corrente
    this.template.formatoPagina = this.A4A3;
    this.svcTemplates.put(this.template).subscribe();

  }

  switchA4A3() {
    switch(this.A4A3) {
      case 'A4V': 
        this.A4A3 = "A3V"
      break;
      case 'A4H': 
        this.A4A3 = "A3H"
      break;
      case 'A3V': 
        this.A4A3 = "A4V"
      break;
      case 'A3H': 
        this.A4A3 = "A4H"
      break;
    }
    this.template.formatoPagina = this.A4A3;
    this.svcTemplates.put(this.template).subscribe();

  }

  toggleSnapObjects() {
    this.snapObjects = !this.snapObjects;
  }

  toggleMagnete() {
    this.magnete = !this.magnete;
    if (this.magnete) this.griglia = false;
  }

  toggleGriglia() {
    this.griglia = !this.griglia;
    if (this.griglia) this.magnete = false;
  }
//#endregion

//#region ----- Stampa -------------------------

  // createRptDoc() {
  //   //faccio una "deep copy" (object assign farebbe una shallow copy) di rptBase in rptFile e qui lavoro
  //   let rptFile = JSON.parse(JSON.stringify(rptBasePdfMake)); 
    
  //   this.svcBlocchi.listByTemplate(1)
  //   .subscribe( blocchi => {
  //     let currPaginaID = 0;
  //     for (let i = 0; i<blocchi.length; i++) {
  //       //verifico se devo saltare pagina. Salvo il caso in cui questo sia il primo blocco della serie
  //       if (i == 0) currPaginaID = blocchi[i].paginaID;
  //       else {
  //         if (blocchi[i].paginaID != currPaginaID ) {
  //           //aggiungo un blocco di salto pagina
  //           let saltoPagina = {
  //            tipoBlocco : {
  //             descrizione :  "Page"
  //            }
  //           }
  //           rptFile = this._paginator.paginatorBuild(rptFile, saltoPagina, null);
  //         }
  //       }
  //       rptFile = this._paginator.paginatorBuild(rptFile, blocchi[i], this.objFields);
  //       currPaginaID = blocchi[i].paginaID;
  //     }
  //     // console.log ("rptFile", rptFile);
  //     this.savePdf(rptFile);
  //   })
  // }

  async savePdf(rptFile: any) {

    //Chiamata al motore di stampa e salvataggio
    // TUTTO COMMENTATO PERCHE' NON USIAMO PIU' TUTTO CIO'
    // let rpt :jsPDF  = await this._jspdf.rptFromtemplate(rptFile);
    // let retcode = this.svcFiles.saveFileJspdfPagella(rpt,222);  //Codice temporaneo 222 che viene scaricato con OpenPdf

    // if(retcode == true)
    //   this._snackBar.openFromComponent(SnackbarComponent, {data: 'Documento salvato in Database', panelClass: ['green-snackbar']});
    // else
    //   this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']});
      
  }


  
  openPdf(){

    let docID = 222;

    this.svcFiles.getByDocAndTipo(docID,"Pagella").subscribe({
      next: res => {
        //si crea un elemento fittizio che scarica il file di tipo base64 che gli viene assegnato
        const source = `data:application/pdf;base64,${res.fileBase64}`;
        const link = document.createElement("a");

        link.href = source;
        link.download = `${"test"}.pdf`
        link.click();
      },
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore di caricamento', panelClass: ['red-snackbar']})
    });
  }
//#endregion

  rowclicked(templateID: number) {

    this.selectedRowIndex = templateID;

    // console.log (templateID);
    this.templateID = templateID;
    this.loadData();  //Serve?
  }



  createPdfMakeDoc() {
    //faccio una "deep copy" (object assign farebbe una shallow copy) di rptBasePdfMake in rptFile e qui ci lavoro
    let rptFile = JSON.parse(JSON.stringify(rptBasePdfMake)); 

    //SheetDefault

    if (this.template.formatoPagina.substring(2,3) == "V")    rptFile[0].pageOrientation="portrait";
    if (this.template.formatoPagina.substring(2,3) == "H")    rptFile[0].pageOrientation="landscape";


    switch(this.A4A3) {
      case 'A4V': 
        rptFile[0].width = A4V.width;
        rptFile[0].height = A4V.height;
      break;
      case 'A4H': 
        rptFile[0].width = A4H.width;
        rptFile[0].height = A4H.height;
      break;
      case 'A3V': 
        rptFile[0].width = A3V.width;
        rptFile[0].height = A3V.height;
      break;
      case 'A3H': 
        rptFile[0].width = A3H.width;
        rptFile[0].height = A3H.height;
      break;
    }

    //Fine SheetDefault

    this.svcBlocchi.listByTemplateZA(this.templateID)     //estraggo tutti i blocchi del template corrente in ordine inverso
    .subscribe( blocchi => {
      let currPaginaID = 0;
      for (let i = 0; i<blocchi.length; i++) {
        //verifico se devo saltare pagina. Salvo il caso in cui questo sia il primo blocco della serie
        // if (i == 0) currPaginaID = blocchi[i].paginaID;  //questo lo sistemo DOPO
        // else {
        //   if (blocchi[i].paginaID != currPaginaID ) {
        //     //aggiungo un blocco di salto pagina
        //     let saltoPagina = {
        //      tipoBlocco : {
        //       descrizione :  "Page"
        //      }
        //     }
        //     rptFile = this._paginator.paginatorBuild(rptFile, saltoPagina, null);
        //   }
        // }
        rptFile = this._paginator.paginatorBuild(rptFile, blocchi[i], this.objFields);
        currPaginaID = blocchi[i].paginaID;
      }
      //console.log ("template.component - createPdfMakeDoc rptFile", rptFile);
      this.svcPdfMake.generatePDF(rptFile);
    })
  }


}
