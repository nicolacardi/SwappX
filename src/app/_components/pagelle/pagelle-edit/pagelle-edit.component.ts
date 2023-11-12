//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatButtonToggle, MatButtonToggleChange } from '@angular/material/button-toggle';
import { Observable, firstValueFrom }                           from 'rxjs';
import { map, tap}                                   from 'rxjs/operators';
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
import { RPT_TagDocument } from 'src/app/_models/RPT_TagDocument';

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
//#endregion  

//#region ----- Constructor --------------------

  constructor(private svcPagelle:               PagelleService,
              private svcPagellaVoti:           PagellaVotiService,
              private svcFiles:                 FilesService,
              private svcIscrizioni:            IscrizioniService,
              private svcOpenXML:               OpenXMLService,
              private _loadingService:          LoadingService,
              private _snackBar:                MatSnackBar ,
              private _jspdf:                   JspdfService) {
  }

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
          //console.log ("pagelle.edit - loadData - objPagella:", this.objPagella);
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
            this.objPagella.statoID = 1;
            this.objPagella.dtIns = dateNow;
            this.ckStampato = false;
            this.dtIns = '';
          }
        }
    );

    if(this.iscrizioneID>0){   
      this.svcIscrizioni.get(this.iscrizioneID).subscribe(res => {
        this.iscrizione = res;
        let annoID = this.iscrizione.classeSezioneAnno.anno.id;
        let classeID = this.iscrizione.classeSezioneAnno.classeSezione.classeID;
        setTimeout(() =>  this.svcPagellaVoti.listByAnnoClassePagella(annoID, classeID, this.objPagella.id!).subscribe(res=> this.lstPagellaVoti = res), 1000);
      });
    }
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

  
  async savePdfPagellaBase64OLD() {

    if (this.objPagella.id == -1 ){
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Pagella inesistente - inserire almeno un voto', panelClass: ['red-snackbar']});
      return;
    }

    // costruiamo una promise per attendere il caricamento della lista voti
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

    //funziona anche così? se sì adottiamola che è + standard
    // if(this.objPagella.iscrizione != undefined){
    //   await firstValueFrom(this.svcPagellaVoti.listByAnnoClassePagella(this.objPagella.iscrizione?.classeSezioneAnno.annoID!,  this.objPagella.iscrizione?.classeSezioneAnno.classeSezione.classeID,this.objPagella.id! )
    //   .pipe(
    //       tap((res: DOC_PagellaVoto[]) => {
    //         this.lstPagellaVoti = res;
    //       }
    //     )
    //   ));
    // }

  
    //Chiamata al motore di stampa e salvataggio
    let rpt :jsPDF  = await this._jspdf.dynamicRptPagella(this.objPagella, this.lstPagellaVoti);
    let retcode = this.svcFiles.saveFileJspdfPagella(rpt,this.objPagella.id!);

    if(retcode == true)
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Pagella salvata in Database', panelClass: ['green-snackbar']});
    else
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']});
      
    this.svcPagelle.pubblica(this.objPagella.id!).subscribe();

  }
  
  savePdfPagellaBase64(){
    //c'è un piccolo problema: se la pagella è nuova l'id non c'è ancora
    //il salvataggio crea la pagella, ma servirebbe un reload per averlo ....perchè lo crea... ma angular non ce l'ha
    console.log("pagella-voto-edit - savePdfPagellaBase64 - this.objPagella:", this.objPagella);
    if (this.objPagella.id! <= 0 ){
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Pagella inesistente - inserire almeno un voto', panelClass: ['red-snackbar']});
      return;
    }
    if (this.objPagella.id == undefined ){
      //accade che se stiamo inserendo un valore in un voto per la prima volta e non c'è la pagella, alla pressione del button
      //si scatenerà l'evento save e creazione pagella...ma angular non ha l'id
      //va fatto un reload o va chiesto ll'utente di ripremere....perchè se stiamo editando il campo per la prima volta...
      // return;
    }
    
    let file : DOC_File = {
      tipoDoc : "Pagella",
      docID : this.objPagella.id!,
      TagDocument : this.openXMLPreparaOggetto(this.alunno, this.iscrizione, this.lstPagellaVoti, this.objPagella),
      estensione: "docX"
    };
    console.log("pagella-voto-edit - savePdfPagellaBase64 - file:", file);
    this.svcFiles.post(file).subscribe();
  }

  downloadPdfPagella() {
    //scarica la pagella salvata in precedenza in modalità base64
    let nomeFile: string;
    nomeFile = "PagellaElementari"  + '_' + this.iscrizione.classeSezioneAnno.anno.annoscolastico + "(" + this.quadrimestre +"quad)_" + this.alunno.persona.cognome + ' ' + this.alunno.persona.nome + '.docx';
    this.svcOpenXML.createAndDownloadFile(this.openXMLPreparaOggetto(this.alunno, this.iscrizione, this.lstPagellaVoti, this.objPagella), nomeFile );

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

    let tagDocument : RPT_TagDocument = {
      templateName: "PagellaElementari",
      tagFields:
      [
        { tagName: "AnnoScolastico",            tagValue: iscrizione.classeSezioneAnno.anno.annoscolastico},
        { tagName: "ComuneNascita",             tagValue: alunno.persona.comuneNascita},
        { tagName: "ProvNascita",               tagValue: alunno.persona.provNascita},
        { tagName: "CF",                        tagValue: alunno.persona.cf},
        { tagName: "DtNascita",                 tagValue: Utility.formatDate(alunno.persona.dtNascita, FormatoData.dd_mm_yyyy)},
        { tagName: "Alunno" ,                   tagValue: alunno.persona.nome+" "+alunno.persona.cognome},
        { tagName: "Classe" ,                   tagValue: iscrizione.classeSezioneAnno.classeSezione.classe!.descrizione2},
        { tagName: "Sezione" ,                  tagValue: iscrizione.classeSezioneAnno.classeSezione.sezione},
        { tagName: "DataDoc" ,                  tagValue: Utility.formatDate(objPagella.dtIns, FormatoData.dd_mm_yyyy)},

        { tagName: "ObItaliano1" ,              tagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.Ob},
        { tagName: "VotoObItaliano1" ,          tagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.VotoOb},
        { tagName: "ObItaliano2" ,              tagValue: estraiVoto(lstPagellaVoti, "Italiano", 2)?.Ob},
        { tagName: "VotoObItaliano2" ,          tagValue: estraiVoto(lstPagellaVoti, "Italiano", 2)?.VotoOb},
        { tagName: "ObItaliano3" ,              tagValue: estraiVoto(lstPagellaVoti, "Italiano", 3)?.Ob},
        { tagName: "VotoObItaliano3" ,          tagValue: estraiVoto(lstPagellaVoti, "Italiano", 3)?.VotoOb},
        { tagName: "CommentoItaliano" ,         tagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.Note},

        { tagName: "ObEdCivica1" ,              tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.Ob},
        { tagName: "VotoObEdCivica1" ,          tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.VotoOb},
        { tagName: "ObEdCivica2" ,              tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 2)?.Ob},
        { tagName: "VotoObEdCivica2" ,          tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 2)?.VotoOb},
        { tagName: "ObEdCivica3" ,              tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 3)?.Ob},
        { tagName: "VotoObEdCivica3" ,          tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 3)?.VotoOb},
        { tagName: "CommentoEdCivica" ,         tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.Note},

        { tagName: "ObStoria1" ,                tagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.Ob},
        { tagName: "VotoObStoria1" ,            tagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.VotoOb},
        { tagName: "ObStoria2" ,                tagValue: estraiVoto(lstPagellaVoti, "Storia", 2)?.Ob},
        { tagName: "VotoObStoria2" ,            tagValue: estraiVoto(lstPagellaVoti, "Storia", 2)?.VotoOb},
        { tagName: "ObStoria3" ,                tagValue: estraiVoto(lstPagellaVoti, "Storia", 3)?.Ob},
        { tagName: "VotoObStoria3" ,            tagValue: estraiVoto(lstPagellaVoti, "Storia", 3)?.VotoOb},
        { tagName: "CommentoStoria" ,           tagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.Note},

        { tagName: "ObGeografia1" ,             tagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.Ob},
        { tagName: "VotoObGeografia1" ,         tagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.VotoOb},
        { tagName: "ObGeografia2" ,             tagValue: estraiVoto(lstPagellaVoti, "Geografia", 2)?.Ob},
        { tagName: "VotoObGeografia2" ,         tagValue: estraiVoto(lstPagellaVoti, "Geografia", 2)?.VotoOb},
        { tagName: "ObGeografia3" ,             tagValue: estraiVoto(lstPagellaVoti, "Geografia", 3)?.Ob},
        { tagName: "VotoObGeografia3" ,         tagValue: estraiVoto(lstPagellaVoti, "Geografia", 3)?.VotoOb},
        { tagName: "CommentoGeografia" ,        tagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.Note},

        { tagName: "ObInglese1" ,               tagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.Ob},
        { tagName: "VotoObInglese1" ,           tagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.VotoOb},
        { tagName: "ObInglese2" ,               tagValue: estraiVoto(lstPagellaVoti, "Inglese", 2)?.Ob},
        { tagName: "VotoObInglese2" ,           tagValue: estraiVoto(lstPagellaVoti, "Inglese", 2)?.VotoOb},
        { tagName: "ObInglese3" ,               tagValue: estraiVoto(lstPagellaVoti, "Inglese", 3)?.Ob},
        { tagName: "VotoObInglese3" ,           tagValue: estraiVoto(lstPagellaVoti, "Inglese", 3)?.VotoOb},
        { tagName: "CommentoInglese" ,          tagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.Note},

        { tagName: "ObMusica1" ,                tagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.Ob},
        { tagName: "VotoObMusica1" ,            tagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.VotoOb},
        { tagName: "ObMusica2" ,                tagValue: estraiVoto(lstPagellaVoti, "Musica", 2)?.Ob},
        { tagName: "VotoObMusica2" ,            tagValue: estraiVoto(lstPagellaVoti, "Musica", 2)?.VotoOb},
        { tagName: "ObMusica3" ,                tagValue: estraiVoto(lstPagellaVoti, "Musica", 3)?.Ob},
        { tagName: "VotoObMusica3" ,            tagValue: estraiVoto(lstPagellaVoti, "Musica", 3)?.VotoOb},
        { tagName: "CommentoMusica" ,           tagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.Note},

        { tagName: "ObMatematica1" ,            tagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.Ob},
        { tagName: "VotoObMatematica1" ,        tagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.VotoOb},
        { tagName: "ObMatematica2" ,            tagValue: estraiVoto(lstPagellaVoti, "Matematica", 2)?.Ob},
        { tagName: "VotoObMatematica2" ,        tagValue: estraiVoto(lstPagellaVoti, "Matematica", 2)?.VotoOb},
        { tagName: "ObMatematica3" ,            tagValue: estraiVoto(lstPagellaVoti, "Matematica", 3)?.Ob},
        { tagName: "VotoObMatematica3" ,        tagValue: estraiVoto(lstPagellaVoti, "Matematica", 3)?.VotoOb},
        { tagName: "CommentoMatematica" ,       tagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.Note},

        { tagName: "ObScNaturali1" ,            tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.Ob},
        { tagName: "VotoObScNaturali1" ,        tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.VotoOb},
        { tagName: "ObScNaturali2" ,            tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 2)?.Ob},
        { tagName: "VotoObScNaturali2" ,        tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 2)?.VotoOb},
        { tagName: "ObScNaturali3" ,            tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 3)?.Ob},
        { tagName: "VotoObScNaturali3" ,        tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 3)?.VotoOb},
        { tagName: "CommentoScNaturali" ,       tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.Note},

        { tagName: "ObScMotorie1" ,             tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.Ob},
        { tagName: "VotoObScMotorie1" ,         tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.VotoOb},
        { tagName: "ObScMotorie2" ,             tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 2)?.Ob},
        { tagName: "VotoObScMotorie2" ,         tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 2)?.VotoOb},
        { tagName: "ObScMotorie3" ,             tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 3)?.Ob},
        { tagName: "VotoObScMotorie3" ,         tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 3)?.VotoOb},
        { tagName: "CommentoScMotorie" ,        tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.Note},

        { tagName: "ObLavManuale1" ,            tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.Ob},
        { tagName: "VotoObLavManuale1" ,        tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.VotoOb},
        { tagName: "ObLavManuale2" ,            tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 2)?.Ob},
        { tagName: "VotoObLavManuale2" ,        tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 2)?.VotoOb},
        { tagName: "CommentoLavManuale" ,       tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.Note},

        { tagName: "ObEuritmia1" ,              tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.Ob},
        { tagName: "VotoObEuritmia1" ,          tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.VotoOb},
        { tagName: "ObEuritmia2" ,              tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 2)?.Ob},
        { tagName: "VotoObEuritmia2" ,          tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 2)?.VotoOb},
        { tagName: "ObEuritmia3" ,              tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 3)?.Ob},
        { tagName: "VotoObEuritmia3" ,          tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 3)?.VotoOb},
        { tagName: "CommentoEuritmia" ,         tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.Note},

        { tagName: "ObArteImmagine1" ,          tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.Ob},
        { tagName: "VotoObArteImmagine1" ,      tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.VotoOb},
        { tagName: "ObArteImmagine2" ,          tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 2)?.Ob},
        { tagName: "VotoObArteImmagine2" ,      tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 2)?.VotoOb},
        { tagName: "CommentoArteImmagine" ,     tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.Note},

      ],
      //tagTables: [] //non ci sono tables dinamiche
    }
    //console.log ("tagDocument", tagDocument);
    return tagDocument;
  }
  
  // openPdfPagella(){
  //   //questa andrà in pensione

  //   if(this.objPagella == null || this.objPagella.id! <0) {
  //     this._snackBar.openFromComponent(SnackbarComponent, {data: 'Pagella non ancora generata', panelClass: ['red-snackbar']})
  //     return;
  //   }

  //   this.svcFiles.getByDocAndTipo(this.objPagella.id,"Pagella").subscribe({
  //       next: res => {
  //         //si crea un elemento fittizio che scarica il file di tipo base64 che gli viene assegnato
  //         const source = `data:application/pdf;base64,${res.fileBase64}`;
  //         const link = document.createElement("a");

  //         link.href = source;
  //         link.download = `${"test"}.pdf`
  //         link.click();
  //       },
  //       error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore di caricamento', panelClass: ['red-snackbar']})
  //   });
  // }

//#endregion
}
