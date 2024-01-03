import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable, firstValueFrom, tap }      from 'rxjs';
import { environment }                          from 'src/environments/environment';
import * as saveAs                              from 'file-saver';

//components
import { FormatoData, Utility } from '../utilities/utility.component';
//services
import { IscrizioneRisposteService } from '../procedura-iscrizione/iscrizione-risposte/iscrizione-risposte.service';

//models
import { DOC_File }                             from 'src/app/_models/DOC_File';
import { RPT_TagDocument } from 'src/app/_models/RPT_TagDocument';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { DOC_PagellaVoto } from 'src/app/_models/DOC_PagellaVoto';
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';


@Injectable({
  providedIn: 'root'
})

export class FilesService {

  constructor(private http: HttpClient,
              private svcIscrizioneRisposte: IscrizioneRisposteService) { }

  get(docID: number): Observable<DOC_File>{
    return this.http.get<DOC_File>(environment.apiBaseUrl+'DOC_Files/'+docID);   
    //http://213.215.231.4/swappX/api/DOC_File/285
  }
 
  getByDocAndTipo(docID: any, tipoDoc: string): Observable<DOC_File>{
    return this.http.get<DOC_File>(environment.apiBaseUrl+'DOC_Files/GetByDocAndTipo/'+docID+"/"+tipoDoc);   
    //http://213.215.231.4/swappX/api/DOC_Files/getByDocAndTipo/1/Pagella
  }
  
  put(formData: any): Observable <any>{
    //console.log ("sto per spedire in put:", formData);
    formData.tipoFile = "pdf";
    return this.http.put( environment.apiBaseUrl  + 'DOC_Files/' + formData.id , formData);    
  }

  post(formData: any): Observable <DOC_File>{
    delete formData.id;
    return this.http.post<DOC_File>( environment.apiBaseUrl  + 'DOC_Files' , formData);  
  }

  buildAndGetBase64(tagDocument: RPT_TagDocument, nomeFile: string): void {
    this.http.post(environment.apiBaseUrl+'DOC_Files/buildAndGetBase64',tagDocument, { responseType: 'text' })
    .subscribe((response:any) => {
      const byteCharacters = atob(response);                  // Decodifica la stringa base64 in un array di byte
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {       // Crea un array di valori numerici, un elemento dell'array per ogni carattere
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);          //a sua volta byteNumbers viene trascodificato in byteArray
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      saveAs(blob, nomeFile);
    });
  }

  openXMLPreparaPagella (template: string, iscrizione: CLS_Iscrizione, lstPagellaVoti: DOC_PagellaVoto[], objPagella: DOC_Pagella) {
    console.log("files.service - openXMLPreparaPagella - lstPagellaVoti", lstPagellaVoti);
    function estraiVoto(lstPagellaVoti: DOC_PagellaVoto[], materia: string, index: number) {
      for (const PagellaVoto of lstPagellaVoti) {

        if (PagellaVoto.materia!.descrizione === materia) {

            return {
              materia,
              Note: PagellaVoto.note? PagellaVoto.note: "-",
              Ob: PagellaVoto._ObiettiviCompleti? PagellaVoto._ObiettiviCompleti![index-1].descrizione: "-",
              VotoOb: (PagellaVoto._ObiettiviCompleti && PagellaVoto._ObiettiviCompleti![index-1].livelloObiettivo)? PagellaVoto._ObiettiviCompleti![index-1].livelloObiettivo!.descrizione: "-",
              voto: PagellaVoto.voto + '',
              giudizio: PagellaVoto.tipoGiudizio?.descrizione + ''

            };

        }
      }
      return null;
    }
    let tagDocument : RPT_TagDocument = {
      templateName: template,
      tagFields:
      [
        { tagName: "RilevazioneProgressi",      tagValue: objPagella.giudizioQuad},

        { tagName: "AnnoScolastico",            tagValue: iscrizione.classeSezioneAnno.anno.annoscolastico},
        { tagName: "ComuneNascita",             tagValue: iscrizione.alunno.persona.comuneNascita},
        { tagName: "ProvNascita",               tagValue: iscrizione.alunno.persona.provNascita},
        { tagName: "CF",                        tagValue: iscrizione.alunno.persona.cf},
        { tagName: "DtNascita",                 tagValue: Utility.formatDate(iscrizione.alunno.persona.dtNascita, FormatoData.dd_mm_yyyy)},
        { tagName: "Alunno" ,                   tagValue: iscrizione.alunno.persona.nome+" "+iscrizione.alunno.persona.cognome},
        { tagName: "Classe" ,                   tagValue: iscrizione.classeSezioneAnno.classeSezione.classe!.descrizione2},
        { tagName: "Sezione" ,                  tagValue: iscrizione.classeSezioneAnno.classeSezione.sezione},
        { tagName: "DataDoc" ,                  tagValue: Utility.formatDate(objPagella.dtIns, FormatoData.dd_mm_yyyy)},

        //per voti Obiettivo
        { tagName: "ObItaliano1" ,              tagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.Ob},
        { tagName: "VotoObItaliano1" ,          tagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.VotoOb},
        { tagName: "ObItaliano2" ,              tagValue: estraiVoto(lstPagellaVoti, "Italiano", 2)?.Ob},
        { tagName: "VotoObItaliano2" ,          tagValue: estraiVoto(lstPagellaVoti, "Italiano", 2)?.VotoOb},
        { tagName: "ObItaliano3" ,              tagValue: estraiVoto(lstPagellaVoti, "Italiano", 3)?.Ob},
        { tagName: "VotoObItaliano3" ,          tagValue: estraiVoto(lstPagellaVoti, "Italiano", 3)?.VotoOb},
        { tagName: "CommentoItaliano" ,         tagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.Note},
        //per voti numerici
        { tagName: "VotoItaliano" ,             tagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuItaliano" ,              tagValue: estraiVoto(lstPagellaVoti, "Italiano", 1)?.giudizio},

        { tagName: "ObEdCivica1" ,              tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.Ob},
        { tagName: "VotoObEdCivica1" ,          tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.VotoOb},
        { tagName: "ObEdCivica2" ,              tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 2)?.Ob},
        { tagName: "VotoObEdCivica2" ,          tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 2)?.VotoOb},
        { tagName: "ObEdCivica3" ,              tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 3)?.Ob},
        { tagName: "VotoObEdCivica3" ,          tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 3)?.VotoOb},
        { tagName: "CommentoEdCivica" ,         tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.Note},
        //per voti numerici
        { tagName: "VotoEdCivica" ,             tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuEdCivica" ,              tagValue: estraiVoto(lstPagellaVoti, "Educazione Civica", 1)?.giudizio},

        { tagName: "ObStoria1" ,                tagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.Ob},
        { tagName: "VotoObStoria1" ,            tagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.VotoOb},
        { tagName: "ObStoria2" ,                tagValue: estraiVoto(lstPagellaVoti, "Storia", 2)?.Ob},
        { tagName: "VotoObStoria2" ,            tagValue: estraiVoto(lstPagellaVoti, "Storia", 2)?.VotoOb},
        { tagName: "ObStoria3" ,                tagValue: estraiVoto(lstPagellaVoti, "Storia", 3)?.Ob},
        { tagName: "VotoObStoria3" ,            tagValue: estraiVoto(lstPagellaVoti, "Storia", 3)?.VotoOb},
        { tagName: "CommentoStoria" ,           tagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.Note},
        //per voti numerici
        { tagName: "VotoStoria" ,               tagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuStoria" ,                tagValue: estraiVoto(lstPagellaVoti, "Storia", 1)?.giudizio},
        
        { tagName: "ObGeografia1" ,             tagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.Ob},
        { tagName: "VotoObGeografia1" ,         tagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.VotoOb},
        { tagName: "ObGeografia2" ,             tagValue: estraiVoto(lstPagellaVoti, "Geografia", 2)?.Ob},
        { tagName: "VotoObGeografia2" ,         tagValue: estraiVoto(lstPagellaVoti, "Geografia", 2)?.VotoOb},
        { tagName: "ObGeografia3" ,             tagValue: estraiVoto(lstPagellaVoti, "Geografia", 3)?.Ob},
        { tagName: "VotoObGeografia3" ,         tagValue: estraiVoto(lstPagellaVoti, "Geografia", 3)?.VotoOb},
        { tagName: "CommentoGeografia" ,        tagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.Note},
        //per voti numerici
        { tagName: "VotoGeografia" ,            tagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuGeografia" ,             tagValue: estraiVoto(lstPagellaVoti, "Geografia", 1)?.giudizio},

        { tagName: "ObInglese1" ,               tagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.Ob},
        { tagName: "VotoObInglese1" ,           tagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.VotoOb},
        { tagName: "ObInglese2" ,               tagValue: estraiVoto(lstPagellaVoti, "Inglese", 2)?.Ob},
        { tagName: "VotoObInglese2" ,           tagValue: estraiVoto(lstPagellaVoti, "Inglese", 2)?.VotoOb},
        { tagName: "ObInglese3" ,               tagValue: estraiVoto(lstPagellaVoti, "Inglese", 3)?.Ob},
        { tagName: "VotoObInglese3" ,           tagValue: estraiVoto(lstPagellaVoti, "Inglese", 3)?.VotoOb},
        { tagName: "CommentoInglese" ,          tagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.Note},
        //per voti numerici
        { tagName: "VotoInglese" ,              tagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuInglese" ,               tagValue: estraiVoto(lstPagellaVoti, "Inglese", 1)?.giudizio},

        { tagName: "ObMusica1" ,                tagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.Ob},
        { tagName: "VotoObMusica1" ,            tagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.VotoOb},
        { tagName: "ObMusica2" ,                tagValue: estraiVoto(lstPagellaVoti, "Musica", 2)?.Ob},
        { tagName: "VotoObMusica2" ,            tagValue: estraiVoto(lstPagellaVoti, "Musica", 2)?.VotoOb},
        { tagName: "ObMusica3" ,                tagValue: estraiVoto(lstPagellaVoti, "Musica", 3)?.Ob},
        { tagName: "VotoObMusica3" ,            tagValue: estraiVoto(lstPagellaVoti, "Musica", 3)?.VotoOb},
        { tagName: "CommentoMusica" ,           tagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.Note},
        //per voti numerici
        { tagName: "VotoMusica" ,               tagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuMusica" ,                tagValue: estraiVoto(lstPagellaVoti, "Musica", 1)?.giudizio},

        { tagName: "ObMatematica1" ,            tagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.Ob},
        { tagName: "VotoObMatematica1" ,        tagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.VotoOb},
        { tagName: "ObMatematica2" ,            tagValue: estraiVoto(lstPagellaVoti, "Matematica", 2)?.Ob},
        { tagName: "VotoObMatematica2" ,        tagValue: estraiVoto(lstPagellaVoti, "Matematica", 2)?.VotoOb},
        { tagName: "ObMatematica3" ,            tagValue: estraiVoto(lstPagellaVoti, "Matematica", 3)?.Ob},
        { tagName: "VotoObMatematica3" ,        tagValue: estraiVoto(lstPagellaVoti, "Matematica", 3)?.VotoOb},
        { tagName: "CommentoMatematica" ,       tagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.Note},
        //per voti numerici
        { tagName: "VotoMatematica" ,           tagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuMatematica" ,            tagValue: estraiVoto(lstPagellaVoti, "Matematica", 1)?.giudizio},

        { tagName: "ObScNaturali1" ,            tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.Ob},
        { tagName: "VotoObScNaturali1" ,        tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.VotoOb},
        { tagName: "ObScNaturali2" ,            tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 2)?.Ob},
        { tagName: "VotoObScNaturali2" ,        tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 2)?.VotoOb},
        { tagName: "ObScNaturali3" ,            tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 3)?.Ob},
        { tagName: "VotoObScNaturali3" ,        tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 3)?.VotoOb},
        { tagName: "CommentoScNaturali" ,       tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.Note},
        //per voti numerici
        { tagName: "VotoScNaturali" ,           tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuScNaturali" ,            tagValue: estraiVoto(lstPagellaVoti, "Scienze Naturali", 1)?.giudizio},

        { tagName: "ObScMotorie1" ,             tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.Ob},
        { tagName: "VotoObScMotorie1" ,         tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.VotoOb},
        { tagName: "ObScMotorie2" ,             tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 2)?.Ob},
        { tagName: "VotoObScMotorie2" ,         tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 2)?.VotoOb},
        { tagName: "ObScMotorie3" ,             tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 3)?.Ob},
        { tagName: "VotoObScMotorie3" ,         tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 3)?.VotoOb},
        { tagName: "CommentoScMotorie" ,        tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.Note},
        //per voti numerici
        { tagName: "VotoScMotorie" ,            tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuScMotorie" ,             tagValue: estraiVoto(lstPagellaVoti, "Scienze Motorie", 1)?.giudizio},

        { tagName: "ObLavManuale1" ,            tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.Ob},
        { tagName: "VotoObLavManuale1" ,        tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.VotoOb},
        { tagName: "ObLavManuale2" ,            tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 2)?.Ob},
        { tagName: "VotoObLavManuale2" ,        tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 2)?.VotoOb},
        { tagName: "CommentoLavManuale" ,       tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.Note},
        //per voti numerici
        { tagName: "VotoLavManuale" ,           tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuLavManuale" ,            tagValue: estraiVoto(lstPagellaVoti, "Lavoro Manuale", 1)?.giudizio},

        { tagName: "ObEuritmia1" ,              tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.Ob},
        { tagName: "VotoObEuritmia1" ,          tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.VotoOb},
        { tagName: "ObEuritmia2" ,              tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 2)?.Ob},
        { tagName: "VotoObEuritmia2" ,          tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 2)?.VotoOb},
        { tagName: "ObEuritmia3" ,              tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 3)?.Ob},
        { tagName: "VotoObEuritmia3" ,          tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 3)?.VotoOb},
        { tagName: "CommentoEuritmia" ,         tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.Note},
        //per voti numerici
        { tagName: "VotoEuritmia" ,             tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuEuritmia" ,              tagValue: estraiVoto(lstPagellaVoti, "Euritmia", 1)?.giudizio},

        { tagName: "ObArteImmagine1" ,          tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.Ob},
        { tagName: "VotoObArteImmagine1" ,      tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.VotoOb},
        { tagName: "ObArteImmagine2" ,          tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 2)?.Ob},
        { tagName: "VotoObArteImmagine2" ,      tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 2)?.VotoOb},
        { tagName: "CommentoArteImmagine" ,     tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.Note},
        //per voti numerici
        { tagName: "VotoArteImmagine" ,         tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.voto},
        //per voti giudizi
        { tagName: "GiuArteImmagine" ,          tagValue: estraiVoto(lstPagellaVoti, "Arte e Immagine", 1)?.giudizio},
      ],
      //tagTables: [] //non ci sono tables dinamiche
    }

    return tagDocument;
  }

  async openXMLPreparaDocumento (iscrizione: CLS_Iscrizione, contesto: string) {
  
    let tagDocument : RPT_TagDocument = {
      templateName: contesto,
      tagFields:
      [
        { tagName: "AnnoScolastico",            tagValue: iscrizione.classeSezioneAnno.anno.annoscolastico},
        { tagName: "Anno1",                     tagValue: iscrizione.classeSezioneAnno.anno.anno1.toString()},
        { tagName: "Anno2",                     tagValue: iscrizione.classeSezioneAnno.anno.anno2.toString()},

        { tagName: "ilFigliolaFiglia",          tagValue: iscrizione.alunno.persona.genere == "M"? "il figlio": "la figlia"},

        { tagName: "NomeAlunno",                tagValue: iscrizione.alunno.persona.nome},
        { tagName: "CognomeAlunno",             tagValue: iscrizione.alunno.persona.cognome},
        { tagName: "ComuneNascitaAlunno",       tagValue: iscrizione.alunno.persona.comuneNascita},
        { tagName: "ProvNascitaAlunno",         tagValue: iscrizione.alunno.persona.provNascita},
        { tagName: "dtNascitaAlunno",           tagValue: Utility.formatDate(iscrizione.alunno.persona.dtNascita, FormatoData.dd_mm_yyyy)},
        { tagName: "PaeseNascitaAlunno",        tagValue: iscrizione.alunno.persona.nazioneNascita},
        { tagName: "CFAlunno",                  tagValue: iscrizione.alunno.persona.cf},
        { tagName: "IndirizzoAlunno",           tagValue: iscrizione.alunno.persona.indirizzo},
        { tagName: "CAPAlunno",                 tagValue: iscrizione.alunno.persona.cap},
        { tagName: "ComuneAlunno",              tagValue: iscrizione.alunno.persona.comune},
        { tagName: "ProvAlunno",                tagValue: iscrizione.alunno.persona.prov},
        { tagName: "TelAlunno",                 tagValue: iscrizione.alunno.persona.telefono},
        { tagName: "EmailAlunno",               tagValue: iscrizione.alunno.persona.email},
        { tagName: "ckDisabile",                tagValue: iscrizione.alunno.ckDisabile? "[SI]": "[NO]"},
        { tagName: "ckDSA",                     tagValue: iscrizione.alunno.ckDSA? "[SI]": "[NO]"},

        { tagName: "DescrizioneClasse",         tagValue: iscrizione.classeSezioneAnno.classeSezione.classe?.descrizione2},
      ],
       tagTables: []

      
    }


    //nel modo che segue inserisco tanti tag quante le risposte a ciascuna domanda con il titolo autUscite1, autUscite2, oppure autFoto1, autFoto2 ecc.
    //aspetto che avvenga prima di procedere
    await firstValueFrom(this.svcIscrizioneRisposte.listByIscrizione(iscrizione.id)
    .pipe(
      tap(
      questions=>
        {
          for (let i = 0; i < questions.length; i++) {
            // console.log ("processo la domanda:", questions[i].domanda!.domanda);
            // console.log ("processo la domanda con titolo", questions[i].domanda!.titolo);
            let numOpzioni = questions[i].domanda?.numOpzioni || 0;
            if (questions[i].domanda!.tipo=="Scelta Singola") {
              let scelta = ""
              if (questions[i].risposta1) scelta = questions[i].domanda?.testo1!
              if (questions[i].risposta2) scelta = questions[i].domanda?.testo2!
              if (questions[i].risposta3) scelta = questions[i].domanda?.testo3!
              if (questions[i].risposta4) scelta = questions[i].domanda?.testo4!
              if (questions[i].risposta5) scelta = questions[i].domanda?.testo5!
              if (questions[i].risposta6) scelta = questions[i].domanda?.testo6!
              if (questions[i].risposta7) scelta = questions[i].domanda?.testo7!
              if (questions[i].risposta8) scelta = questions[i].domanda?.testo8!
              if (questions[i].risposta9) scelta = questions[i].domanda?.testo9!

              tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo, tagValue: scelta})
            }

            if (questions[i].domanda!.tipo=="Risposta Libera") {
               tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo, tagValue: questions[i].rispostaLibera})
            }


            if (questions[i].domanda!.titolo != null && questions[i].domanda!.titolo != '') {
              if (numOpzioni > 0) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_1", tagValue: questions[i].risposta1? "[X]": "[ ]"})
              if (numOpzioni > 1) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_2", tagValue: questions[i].risposta2? "[X]": "[ ]"})
              if (numOpzioni > 2) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_3", tagValue: questions[i].risposta3? "[X]": "[ ]"})
              if (numOpzioni > 3) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_4", tagValue: questions[i].risposta4? "[X]": "[ ]"})
              if (numOpzioni > 4) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_5", tagValue: questions[i].risposta5? "[X]": "[ ]"})
              if (numOpzioni > 5) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_6", tagValue: questions[i].risposta6? "[X]": "[ ]"})
              if (numOpzioni > 6) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_7", tagValue: questions[i].risposta7? "[X]": "[ ]"})
              if (numOpzioni > 7) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_8", tagValue: questions[i].risposta8? "[X]": "[ ]"})
              if (numOpzioni > 8) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_9", tagValue: questions[i].risposta9? "[X]": "[ ]"})  
            }
          }
        }
      )
    ));

    return tagDocument;
  }
  









  // saveBlobPagella(blobPDF :Blob, objPagellaID: number):boolean{
  //   //routine IDENTICA alla savejspdfPagella solo che qui arriva direttamente il Blob
  //   const result = new ReplaySubject<string>(1);
  //   const reader = new FileReader();
  //   reader.readAsBinaryString(blobPDF);
  //   reader.onload = (x) => result.next(btoa(x.target!.result!.toString()));
    
  //   let formDataFile!:                                DOC_File;
  //   formDataFile = {
  //     tipoDoc:         "Pagella",
  //     docID:           objPagellaID,
  //     tipoFile:       "pdf"
  //   };
    
  //   result.pipe (
  //     tap(val=> formDataFile.fileBase64 = val),
      
  //     //ora cerca se esiste già un record nei file...
  //     concatMap(() => this.getByDocAndTipo(objPagellaID, "pagella")),

  //     //a seconda del risultato fa una post o una put
  //     switchMap(res => {
  //       if (res == null) {
  //         //console.log ("non ha trovato=> esegue una post")
  //         return this.post(formDataFile)
  //       } else {
  //         //console.log ("ha trovato=> valorizza l'id e esegue una put")
  //         formDataFile.id = res.id
  //         return this.put(formDataFile)
  //       }
  //     }),
  //   ).subscribe({
  //     next: res => { return true} ,
  //     error: err=> { return false}
  //   });
  //   return true;
  // }


  // saveFileJspdfPagella(rpt :jsPDF, objPagellaID: number):boolean{
   
  //   //Preparazione Blob con il contenuto base64 del pdf e salvataggio su DB
  //   let blobPDF = new Blob([rpt.output('blob')],{type: 'application/pdf'});
    
  //   const result = new ReplaySubject<string>(1);
  //   const reader = new FileReader();
  //   reader.readAsBinaryString(blobPDF);
  //   reader.onload = (x) => result.next(btoa(x.target!.result!.toString()));
    
  //   let formDataFile!:                                DOC_File;
  //   formDataFile = {
  //     tipoDoc:         "Pagella",
  //     docID:           objPagellaID,
  //     tipoFile:       "pdf"
  //   };
    
  //   result.pipe (
  //     tap(val=> formDataFile.fileBase64 = val),
      
  //     //ora cerca se esiste già un record nei file...
  //     concatMap(() => this.getByDocAndTipo(objPagellaID, "pagella")),

  //     //a seconda del risultato fa una post o una put
  //     switchMap(res => {
  //       if (res == null) {
  //         //console.log ("non ha trovato=> esegue una post")
  //         return this.post(formDataFile)
  //       } else {
  //         //console.log ("ha trovato=> valorizza l'id e esegue una put")
  //         formDataFile.id = res.id
  //         return this.put(formDataFile)
  //       }
  //     }),
  //   ).subscribe({
  //     next: res => { return true} ,
  //     error: err=> { return false}
  //   });
  //   return true;
  // }
}
 