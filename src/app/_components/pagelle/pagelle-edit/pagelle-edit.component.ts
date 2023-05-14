//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatButtonToggle, MatButtonToggleChange } from '@angular/material/button-toggle';
import { Observable }                           from 'rxjs';
import { map}                                   from 'rxjs/operators';
import { jsPDF }                                from 'jspdf';

//components
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { PagellaVotiService }                   from '../pagella-voti.service';
import { PagelleService }                       from '../pagelle.service';
import { FilesService }                         from '../files.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { JspdfService }                         from '../../utilities/jspdf/jspdf.service';
import { OpenXMLService }                       from '../../utilities/openXML/open-xml.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { Utility, FormatoData }                 from '../../utilities/utility.component';

//classes
import { DOC_Pagella }                          from 'src/app/_models/DOC_Pagella';
import { DOC_File }                             from 'src/app/_models/DOC_File';
import { DOC_PagellaVoto }                      from 'src/app/_models/DOC_PagellaVoto';
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';

//#endregion
@Component({
  selector: 'app-pagelle-edit',
  templateUrl: './pagelle-edit.component.html',
  styleUrls: ['../pagelle.css']
})

export class PagellaEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  public iscrizione!:                           CLS_Iscrizione;

  public objPagella!:                            DOC_Pagella;  
  lstPagellaVoti!:                               DOC_PagellaVoto[];

  dtIns!:                                        string;

  periodo!:                                      number;
  quadrimestre = 1;
  ckStampato!:                                   boolean;  
  formDataFile! :                                DOC_File;

//#endregion  

//#region ----- ViewChild Input Output ---------
  @Input('iscrizioneID') iscrizioneID!:          number;
  @Input('alunno') alunno!:                      ALU_Alunno;
  @Input('classeSezioneAnnoID') classeSezioneAnnoID!:          number;

  @ViewChild('toggleQuad') toggleQuad!:           MatButtonToggle;
  //@ViewChild(PagellaVotoEditComponent) viewPagellaVotoEdit!: PagellaVotoEditComponent; 

//#endregion  

//#region ----- Constructor --------------------

  constructor(
    private svcPagelle:                         PagelleService,
    private svcPagellaVoti:                     PagellaVotiService,
    private svcFiles:                           FilesService,
    private svcIscrizioni:                      IscrizioniService,

    private svcOpenXML:                         OpenXMLService,
    private _loadingService:                    LoadingService,
    private _snackBar:                          MatSnackBar ,
    private _jspdf:                             JspdfService
    ) { }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

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


    this.svcIscrizioni.get(this.iscrizioneID)
    .subscribe(res => {
      this.iscrizione = res;
      let annoID = this.iscrizione.classeSezioneAnno.anno.id;
      let classeID = this.iscrizione.classeSezioneAnno.classeSezione.classeID;
      console.log ("annoID, classeID", annoID, classeID);
      setTimeout(() => 
      
      this.svcPagellaVoti.listByAnnoClassePagella(annoID, classeID, this.objPagella.id!).subscribe(res=> this.lstPagellaVoti = res), 1000);

      

    });



    

  }
//#endregion

//#region ----- Altri metodi -------------------

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


  openXML() {
    this.svcOpenXML.downloadFile(this.openXMLPreparaOggetto(this.alunno, this.iscrizione, this.lstPagellaVoti, this.objPagella));
  }
  


  openXMLPreparaOggetto (alunno: ALU_Alunno, iscrizione: CLS_Iscrizione, lstPagellaVoti: DOC_PagellaVoto[], objPagella: DOC_Pagella) {


    function estraiVoto(obj: DOC_PagellaVoto[], materia: string, index: number) {

      for (const PagellaVoto of obj) {
        if (PagellaVoto.materia!.descrizione === materia) {

            return {
              materia,
              Note: PagellaVoto.note? PagellaVoto.note: "-",
              Ob: PagellaVoto._ObiettiviCompleti![index-1].descrizione,
              VotoOb: PagellaVoto._ObiettiviCompleti![index-1].livelloObiettivo? PagellaVoto._ObiettiviCompleti![index-1].livelloObiettivo!.descrizione: "-"
            };
          
        }
      }
      return null;
    }

    console.log("this.alunno", alunno);
    let tagDocument = {
      TemplateName: "PagellaElementari",
      TagFields:
      [
        { TagName: "AnnoScolastico",            TagValue: iscrizione.classeSezioneAnno.anno.annoscolastico},
        { TagName: "ComuneNascita",             TagValue: alunno.persona.comuneNascita},
        { TagName: "ProvNascita",               TagValue: alunno.persona.provNascita},
        { TagName: "CF",                        TagValue: alunno.persona.cf},
        { TagName: "DtNascita",                 TagValue: Utility.formatDate(alunno.persona.dtNascita, FormatoData.dd_mm_yyyy)},
        { TagName: "Alunno" ,                   TagValue: alunno.persona.nome+" "+alunno.persona.cognome},
        { TagName: "Classe" ,                   TagValue: iscrizione.classeSezioneAnno.classeSezione.classe.descrizione2},
        { TagName: "Sezione" ,                  TagValue: iscrizione.classeSezioneAnno.classeSezione.sezione},
        { TagName: "DataDoc" ,                  TagValue: Utility.formatDate(objPagella.dtIns, FormatoData.dd_mm_yyyy)},


        { TagName: "ObItaliano1" ,              TagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.Ob},
        { TagName: "VotoObItaliano1" ,          TagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.VotoOb},
        { TagName: "ObItaliano2" ,              TagValue: estraiVoto(lstPagellaVoti, "Italiano", 2)?.Ob},
        { TagName: "VotoObItaliano2" ,          TagValue: estraiVoto(lstPagellaVoti, "Italiano", 2)?.VotoOb},
        { TagName: "ObItaliano3" ,              TagValue: estraiVoto(lstPagellaVoti, "Italiano", 3)?.Ob},
        { TagName: "VotoObItaliano3" ,          TagValue: estraiVoto(lstPagellaVoti, "Italiano", 3)?.VotoOb},
        { TagName: "CommentoItaliano" ,         TagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.Note},

        { TagName: "ObEdCivica1" ,              TagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.Ob},
        { TagName: "VotoObEdCivica1" ,          TagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.VotoOb},
        { TagName: "ObEdCivica2" ,              TagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 2)?.Ob},
        { TagName: "VotoObEdCivica2" ,          TagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 2)?.VotoOb},
        { TagName: "ObEdCivica3" ,              TagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 3)?.Ob},
        { TagName: "VotoObEdCivica3" ,          TagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 3)?.VotoOb},
        { TagName: "CommentoEdCivica" ,         TagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.Note},

        { TagName: "ObStoria1" ,                TagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.Ob},
        { TagName: "VotoObStoria1" ,            TagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.VotoOb},
        { TagName: "ObStoria2" ,                TagValue: estraiVoto(lstPagellaVoti, "Storia", 2)?.Ob},
        { TagName: "VotoObStoria2" ,            TagValue: estraiVoto(lstPagellaVoti, "Storia", 2)?.VotoOb},
        { TagName: "ObStoria3" ,                TagValue: estraiVoto(lstPagellaVoti, "Storia", 3)?.Ob},
        { TagName: "VotoObStoria3" ,            TagValue: estraiVoto(lstPagellaVoti, "Storia", 3)?.VotoOb},
        { TagName: "CommentoStoria" ,           TagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.Note},

        { TagName: "ObGeografia1" ,             TagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.Ob},
        { TagName: "VotoObGeografia1" ,         TagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.VotoOb},
        { TagName: "ObGeografia2" ,             TagValue: estraiVoto(lstPagellaVoti, "Geografia", 2)?.Ob},
        { TagName: "VotoObGeografia2" ,         TagValue: estraiVoto(lstPagellaVoti, "Geografia", 2)?.VotoOb},
        { TagName: "ObGeografia3" ,             TagValue: estraiVoto(lstPagellaVoti, "Geografia", 3)?.Ob},
        { TagName: "VotoObGeografia3" ,         TagValue: estraiVoto(lstPagellaVoti, "Geografia", 3)?.VotoOb},
        { TagName: "CommentoGeografia" ,        TagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.Note},

        { TagName: "ObInglese1" ,               TagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.Ob},
        { TagName: "VotoObInglese1" ,           TagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.VotoOb},
        { TagName: "ObInglese2" ,               TagValue: estraiVoto(lstPagellaVoti, "Inglese", 2)?.Ob},
        { TagName: "VotoObInglese2" ,           TagValue: estraiVoto(lstPagellaVoti, "Inglese", 2)?.VotoOb},
        { TagName: "ObInglese3" ,               TagValue: estraiVoto(lstPagellaVoti, "Inglese", 3)?.Ob},
        { TagName: "VotoObInglese3" ,           TagValue: estraiVoto(lstPagellaVoti, "Inglese", 3)?.VotoOb},
        { TagName: "CommentoInglese" ,          TagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.Note},

        { TagName: "ObMusica1" ,                TagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.Ob},
        { TagName: "VotoObMusica1" ,            TagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.VotoOb},
        { TagName: "ObMusica2" ,                TagValue: estraiVoto(lstPagellaVoti, "Musica", 2)?.Ob},
        { TagName: "VotoObMusica2" ,            TagValue: estraiVoto(lstPagellaVoti, "Musica", 2)?.VotoOb},
        { TagName: "ObMusica3" ,                TagValue: estraiVoto(lstPagellaVoti, "Musica", 3)?.Ob},
        { TagName: "VotoObMusica3" ,            TagValue: estraiVoto(lstPagellaVoti, "Musica", 3)?.VotoOb},
        { TagName: "CommentoMusica" ,           TagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.Note},

        { TagName: "ObMatematica1" ,            TagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.Ob},
        { TagName: "VotoObMatematica1" ,        TagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.VotoOb},
        { TagName: "ObMatematica2" ,            TagValue: estraiVoto(lstPagellaVoti, "Matematica", 2)?.Ob},
        { TagName: "VotoObMatematica2" ,        TagValue: estraiVoto(lstPagellaVoti, "Matematica", 2)?.VotoOb},
        { TagName: "ObMatematica3" ,            TagValue: estraiVoto(lstPagellaVoti, "Matematica", 3)?.Ob},
        { TagName: "VotoObMatematica3" ,        TagValue: estraiVoto(lstPagellaVoti, "Matematica", 3)?.VotoOb},
        { TagName: "CommentoMatematica" ,       TagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.Note},

        { TagName: "ObScNaturali1" ,            TagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.Ob},
        { TagName: "VotoObScNaturali1" ,        TagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.VotoOb},
        { TagName: "ObScNaturali2" ,            TagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 2)?.Ob},
        { TagName: "VotoObScNaturali2" ,        TagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 2)?.VotoOb},
        { TagName: "ObScNaturali3" ,            TagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 3)?.Ob},
        { TagName: "VotoObScNaturali3" ,        TagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 3)?.VotoOb},
        { TagName: "CommentoScNaturali" ,       TagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.Note},

        { TagName: "ObScMotorie1" ,             TagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.Ob},
        { TagName: "VotoObScMotorie1" ,         TagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.VotoOb},
        { TagName: "ObScMotorie2" ,             TagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 2)?.Ob},
        { TagName: "VotoObScMotorie2" ,         TagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 2)?.VotoOb},
        { TagName: "ObScMotorie3" ,             TagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 3)?.Ob},
        { TagName: "VotoObScMotorie3" ,         TagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 3)?.VotoOb},
        { TagName: "CommentoScMotorie" ,        TagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.Note},

        { TagName: "ObLavManuale1" ,            TagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.Ob},
        { TagName: "VotoObLavManuale1" ,        TagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.VotoOb},
        { TagName: "ObLavManuale2" ,            TagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 2)?.Ob},
        { TagName: "VotoObLavManuale2" ,        TagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 2)?.VotoOb},
        { TagName: "CommentoLavManuale" ,       TagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.Note},

        { TagName: "ObEuritmia1" ,              TagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.Ob},
        { TagName: "VotoObEuritmia1" ,          TagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.VotoOb},
        { TagName: "ObEuritmia2" ,              TagValue: estraiVoto(lstPagellaVoti, "Euritmia", 2)?.Ob},
        { TagName: "VotoObEuritmia2" ,          TagValue: estraiVoto(lstPagellaVoti, "Euritmia", 2)?.VotoOb},
        { TagName: "ObEuritmia3" ,              TagValue: estraiVoto(lstPagellaVoti, "Euritmia", 3)?.Ob},
        { TagName: "VotoObEuritmia3" ,          TagValue: estraiVoto(lstPagellaVoti, "Euritmia", 3)?.VotoOb},
        { TagName: "CommentoEuritmia" ,         TagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.Note},

        { TagName: "ObArteImmagine1" ,          TagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.Ob},
        { TagName: "VotoObArteImmagine1" ,      TagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.VotoOb},
        { TagName: "ObArteImmagine2" ,          TagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 2)?.Ob},
        { TagName: "VotoObArteImmagine2" ,      TagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 2)?.VotoOb},
        { TagName: "CommentoArteImmagine" ,     TagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.Note},

      ],
      TagTables:
      [] //non ci sono tables dinamiche
    }
    console.log ("tagDocument", tagDocument);
    return tagDocument;
  }
  
  openPdfPagella(){
    //questa andrà in pensione

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
//#endregion
}
