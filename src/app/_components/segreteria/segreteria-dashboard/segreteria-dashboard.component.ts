//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog }                            from '@angular/material/dialog';
import { ActivatedRoute }                       from '@angular/router';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { firstValueFrom, map, tap }             from 'rxjs';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { IscrizioniClasseListComponent }        from '../../iscrizioni/iscrizioni-classe-list/iscrizioni-classe-list.component';

//services
import { NavigationService }                    from '../../utilities/navigation/navigation.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { ClassiSezioniAnniService }             from '../../classi/classi-sezioni-anni.service';
import { FilesService }                         from '../../pagelle/files.service';
import { PagellaVotiService }                   from '../../pagelle/pagella-voti.service';
import { PagelleService }                       from '../../pagelle/pagelle.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { CLS_ClasseSezioneAnno }                from 'src/app/_models/CLS_ClasseSezioneAnno';
import { DOC_Pagella }                          from 'src/app/_models/DOC_Pagella';
import { DOC_File }                             from 'src/app/_models/DOC_File';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { DOC_PagellaVoto }                      from 'src/app/_models/DOC_PagellaVoto';
import { RPT_TagDocument }                      from 'src/app/_models/RPT_TagDocument';



//#endregion

@Component({
  selector: 'app-segreteria-dashboard',
  templateUrl: './segreteria-dashboard.component.html',
  styleUrls: ['../segreteria.css']
})

export class SegreteriaDashboardComponent implements OnInit {

//#region ----- Variabili ----------------------

  public classeSezioneAnnoID!:                  number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public classeSezioneAnno!:                    CLS_ClasseSezioneAnno;

  public annoID!:                               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public docenteID!:                            number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public alunno!:                               ALU_Alunno;   //valore ricevuto (emitted) dal child IscrizioniClasseList

  public classeSezioneAnnoIDrouted!:            string;   //valore ricevuto (routed) dal routing
  public annoIDrouted!:                         string;   //valore ricevuto (routed) dal routing

  public objPagella!:                           DOC_Pagella;
//#endregion

//#region ----- ViewChild Input Output -------

//@ViewChild(AlunniListComponent) alunniListComponent!: AlunniListComponent; 
  @ViewChild(IscrizioniClasseListComponent) viewListIscrizioni!: IscrizioniClasseListComponent; 
//#endregion

  constructor(
              private svcPagelle:               PagelleService,
              private svcPagellaVoti:           PagellaVotiService,
              private svcFiles:                 FilesService,
              private svcClassiSezioniAnni:     ClassiSezioniAnniService,
              private _navigationService:       NavigationService,
              public _dialog:                   MatDialog,
              private actRoute:                 ActivatedRoute,      
              private _snackBar:                MatSnackBar ) {
    
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    //annoID e classeSezioneAnnoID sono due queryParams che arrivano a coordinatore-dashboard ad es. quando si naviga da ClassiSezioniAnniSummary con right click
    //ora vanno passati al Child ClassiSezioniAnniList perchè quello deve settarsi su questo anno e su questa classe
    //l'annoID ClassiSezioniAnniList lo prende dalla select che a sua volta lo prende dal local storage (anno di default)
    //bisogna fare in modo che annoID in arrivo da home component "vinca" rispetto all'annoID impostato per default
    this.actRoute.queryParams.subscribe(
      params => {
        this.annoIDrouted = params['annoID'];     
        this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
    });

    this._navigationService.passPage("coordinatoreDashboard");  //A cosa serve??
  }
//#endregion

//#region ----- ricezione emit -------
  annoIdEmitted(annoID: number) {
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
    //le classi ha bisogno di conoscere anche l'annoID per fare le proprie verifiche
    this.annoID = annoID;
  }

  classeSezioneAnnoIDEmitted(classeSezioneAnnoID: number) {
    this.classeSezioneAnnoID = classeSezioneAnnoID;
    if(this.classeSezioneAnnoID >0){
      //per poter mostrare il docente e la classe...
      this.svcClassiSezioniAnni.get(this.classeSezioneAnnoID).subscribe(
        csa => this.classeSezioneAnno = csa 
      );
    } 
  }

  alunnoEmitted(alunno: ALU_Alunno) {
    this.alunno = alunno;
  }

  pubblicaEmitted(periodo: number) {
    let finalMsg = "";
    console.log(this.viewListIscrizioni.getChecked());
    //ottiene dalla lista delle iscrizioni l'elenco delle iscrizioni che sono state selezionate
    let annoID!: number;
    let classeID!: number;
    let lstPagellaVoti!: DOC_PagellaVoto[];
    let alunno!: ALU_Alunno;

    this.viewListIscrizioni.getChecked().forEach(async iscrizione => {     
      //estrae ora la lista delle pagelle per questa singola iscrizione (NB: ce ne può essere una per periodo, quindi possono essercene 0,1,2)
      let pagella!: DOC_Pagella;
      await firstValueFrom(this.svcPagelle.listByIscrizione(iscrizione.id)
        .pipe(
          map(pag=>pag.filter(pag=>(pag.periodo == periodo))),
          tap(pag=> pagella = pag[0])
        ));
      //se non viene trovata alcuna pagella significa che non è mai stata nemmeno creata, quindi che non ha nemmeno un voto, stoppo tutto
      if (pagella == undefined) 
      {
        finalMsg += "Pagella dell'alunno: "+iscrizione.alunno.persona.nome+" "+ iscrizione.alunno.persona.cognome+ " : LA PAGELLA NON ESISTE, NON E' MAI STATO INSERITO ALCUN VOTO"
        console.log("Report: ", finalMsg);

        return;
      }
      //una pagella è stata trovata. Ne estraggo i voti. Poichè si tratta di una pagella COMPLETA (con anche le materie prive di voti)
      //la GET avviene passando oltre al pagella.ID anche l'annoID e la classeID, che recupero dall'oggetto Iscrizione
      annoID = iscrizione!.classeSezioneAnno.annoID;
      classeID = iscrizione!.classeSezioneAnno.classeSezione.classeID;
      console.log("pagella-voto-edit - savePdfPagellaBase64 - parametri per listbyAnnoClassePagella:", annoID, classeID, pagella.id!)
      await firstValueFrom(this.svcPagellaVoti.listByAnnoClassePagella(annoID, classeID, pagella.id!).pipe(tap(res=> lstPagellaVoti = res)));
      console.log("pagella-voto-edit - savePdfPagellaBase64 - this.svcPagellaVoti.listByAnnoClassePagella conclusa");
      console.log ("RISULTATO: lstPagellaVoti", lstPagellaVoti);

      //ora ho i voti in lstPagellaVoti, servono per preparare il TagDocument insieme ad altre info: alunno, iscrizione e oggetto pagella
      alunno = iscrizione!.alunno;
      let file : DOC_File = {
        tipoDoc : "Pagella",
        docID : pagella.id!,
        TagDocument : this.openXMLPreparaOggetto(alunno, iscrizione, lstPagellaVoti, pagella),
        tipoFile: "docX"
      };
      //Verifico se per caso non c'è già in DOC_files... in teoria non dovrebbe servire, in quanto se c'è già dovrebbe essere in statoID = 3
      let filePagellaEsistente = false;
      await firstValueFrom(this.svcFiles.getByDocAndTipo(pagella.id!, "Pagella").pipe(tap(res => {if (res) filePagellaEsistente= true})));
      if (filePagellaEsistente) 
      {
        finalMsg += "Pagella dell'alunno: "+alunno.persona.nome+" "+ alunno.persona.cognome+ " : IL FILE DELLA PAGELLA ESISTE GIA' in DOC_FILES"
        console.log("Report: ", finalMsg);
        return;
      }
      console.log("pagella-voto-edit - savePdfPagellaBase64 - oggetto di tipo DOC_File per svcFiles.post:", file);
      await firstValueFrom(this.svcFiles.post(file));
      console.log("pagella-voto-edit - savePdfPagellaBase64 - this.svcFiles.post conclusa");

      //una volta salvato il file vado a cambiare lo stato della pagella
      console.log("pagella-voto-edit - savePdfPagellaBase64 - parte this.svcPagelle.pubblica");
      await firstValueFrom(this.svcPagelle.pubblica(pagella.id!));
      console.log("pagella-voto-edit - savePdfPagellaBase64 - this.svcPagelle.pubblica conclusa");

      //a questo punto tolgo la selezione
      this.viewListIscrizioni.selection.toggle(iscrizione);
          // //crea l'array di icone di fine procedura - SERVIREBBE PER MOSTRARE I FLAG COLORATI DI VERDE, ma FACCIAMO un semplice loadData
          // let arrEndedIcons = this.viewListIscrizioni.endedIcons.toArray();
          // //imposta l'icona che ha id = "endedIcon_idDellaClasse" a visibility= visible
          // (arrEndedIcons.find(x=>x.nativeElement.id=="endedIcon_"+iscrizione.id)?.nativeElement as HTMLElement).style.visibility = "visible";
          // (arrEndedIcons.find(x=>x.nativeElement.id=="endedIcon_"+iscrizione.id)?.nativeElement as HTMLElement).style.opacity = "1";
      this.viewListIscrizioni.loadData();
    }); 
  }
//#endregion

//#region ----- costruzione file -----
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
//#endregion
}