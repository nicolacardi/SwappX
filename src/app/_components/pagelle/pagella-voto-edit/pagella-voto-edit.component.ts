//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatTableDataSource }                   from '@angular/material/table';
import { iif, Observable }                      from 'rxjs';
import { concatMap, map, tap }                  from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { VotiObiettiviEditComponent }           from '../voti-obiettivi-edit/voti-obiettivi-edit.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { PagellaVotiService }                   from '../pagella-voti.service';
import { PagelleService }                       from '../pagelle.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { FilesService }                         from '../files.service';

//classes
import { DOC_Pagella }                          from 'src/app/_models/DOC_Pagella';
import { DOC_PagellaVoto, DOC_TipoGiudizio }    from 'src/app/_models/DOC_PagellaVoto';
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { RPT_TagDocument }                      from 'src/app/_models/RPT_TagDocument';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';

//#endregion
@Component({
  selector: 'app-pagella-voto-edit',
  templateUrl: './pagella-voto-edit.component.html',
  styleUrls: ['../pagelle.css']
})

export class PagellaVotoEditComponent implements OnInit  {
  
//#region ----- Variabili ----------------------
  matDataSource = new                           MatTableDataSource<DOC_PagellaVoto>();
  obsTipiGiudizio$!:                            Observable<DOC_TipoGiudizio[]>;
  showPageTitle:                                boolean = true;
  lstPagellaVoti!:                              DOC_PagellaVoto[];
  iscrizione!:                                  CLS_Iscrizione;
  classeSezioneAnnoID!:                         number;
  pagella!:                                     DOC_Pagella;
  headerRows!:                                  string[];
  displayedColumns!:                            string[];
  chiusa = false;
  form! :                                       UntypedFormGroup;


  displayedColumnsQ1: string[] = [
    "materia", 
    "multiVoto",
    "note"
  ];

  displayedColumnsQ2: string[] = [
    "multiVoto",
    "note"
  ];
//#endregion  

//#region ----- ViewChild Input Output ---------
  @Input('iscrizioneID') iscrizioneID!:         number;
  @Input('periodo') periodo!:                   number;

  @Output('reloadParent') reloadParent = new EventEmitter(); //EMESSO quando si chiude la dialog obiettivo
//#endregion

//#region ----- Constructor --------------------

  constructor(private svcPagelle:               PagelleService,
              private svcFiles:                 FilesService,
              private svcPagellaVoti:           PagellaVotiService,
              private svcIscrizioni:            IscrizioniService,
              private _loadingService:          LoadingService,
              private fb:                       UntypedFormBuilder, 
              private _snackBar:                MatSnackBar,
              public _dialog:                   MatDialog ) {
                
    this.form = this.fb.group(
      {
        dtPagella:                                       [null],
      });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
    if (this.iscrizioneID != undefined && this.periodo != undefined) 
    {
      this.loadData();

      this.svcIscrizioni.get(this.iscrizioneID).subscribe(res => {
        this.iscrizione = res;
      });
      
      //mi servirà anche la classeSezioneAnnoID
      this.svcIscrizioni.get(this.iscrizioneID).subscribe(iscrizione => {this.classeSezioneAnnoID = iscrizione.classeSezioneAnnoID});

      this.svcPagelle.listByIscrizione(this.iscrizioneID).pipe (
      map(val=>val.filter(val=>(val.periodo == this.periodo)))).subscribe(
        val =>  {
          //console.log ("pagella-voto-edit - ngOnChanges - pagella", val);
          //console.log ("pagelle.edit - loadData - pagella:", this.pagella);
          if (val.length != 0)  {
            this.pagella = val[0];
            this.chiusa = this.pagella.statoID! >= 2? true : false;
            this.form.controls.dtPagella.setValue(val[0].dtPagella);
            //this.dtIns = val[0].dtIns!;
          }
          else {
            this.pagella = <DOC_Pagella>{};
            this.pagella.id = -1;
            this.pagella.iscrizioneID = this.iscrizioneID;
            this.pagella.periodo = this.periodo;
            this.pagella.statoID = 1;
            const d = new Date();
            d.setSeconds(0,0);
            let dateNow = d.toISOString().split('.')[0];
            this.pagella.dtIns = dateNow;

            this.form.controls.dtPagella.setValue("");
            //this.dtIns = '';
          }
        }
      );
    }
  }

  ngOnInit(): void {
    if (this.periodo == 1) { 
      this.headerRows = ['header-row-blank', 'header-row-Quad'];
      this.displayedColumns = this.displayedColumnsQ1
    } else {
      this.headerRows = ['header-row-Quad'];
       this.displayedColumns = this.displayedColumnsQ2
    }
  }

  loadData () {
    this.obsTipiGiudizio$= this.svcPagellaVoti.listTipiGiudizio();

    let obsPagellaVoti$: Observable<DOC_PagellaVoto[]>;
    obsPagellaVoti$ = this.svcPagellaVoti.listByIscrizionePeriodo(this.iscrizioneID, this.periodo);

    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagellaVoti$);
    loadPagella$.subscribe(val => { 
      // console.log("pagella-voto-edit - loadData - val");
      // console.log(val);
      this.lstPagellaVoti = val;
      this.matDataSource.data = val ;

    });
  }

//#endregion


//#region ----- Operazioni CRUD ----------------


  savePagella() {
    //nel caso la pagella ancora non sia stata creata, va inserita
    if (this.pagella.id == -1) {
      // console.log("pagella voto-edit - savePagella - Pagella.id = -1: Non C'è una Pagella --->post pagella e poi postpagellaVoto");
      // console.log("pagella voto-edit - savePagella - this.pagella:", this.pagella);
      this.svcPagelle.post(this.pagella).subscribe() 
    }
    else {    //caso pagella già presente
      this.svcPagelle.put(this.pagella).subscribe() 
    }
  }

  savePagellaVoto (pagellaVoto: DOC_PagellaVoto) {
    //la save viene scatenata ogni volta che cambia un voto o commento/nota (vedi sotto, cerca this.save...)
    //pulizia forminput da oggetti composti
    delete pagellaVoto.iscrizione;
    delete pagellaVoto.materia;
    delete pagellaVoto.tipoGiudizio;
    delete pagellaVoto._ObiettiviCompleti;

    //nel caso la pagella ancora non sia stata creata, va inserita
    if (this.pagella.id == -1) {
      // console.log("pagella voto-edit - savePagellaVoto - Pagella.id = -1: Non C'è una Pagella --->post pagella e poi postpagellaVoto");
      // console.log("pagella voto-edit - savePagellaVoto - this.pagella:", this.pagella);
      this.svcPagelle.post(this.pagella)
        .pipe (
          tap( x =>  {
            pagellaVoto.pagellaID = x.id! 
          } ),
          concatMap( () =>   
            iif( () => pagellaVoto.id == 0 || pagellaVoto.id == undefined,
              this.svcPagellaVoti.post(pagellaVoto),
              this.svcPagellaVoti.put(pagellaVoto)
          )
        )
      ).subscribe() 
    }
    else {    //caso pagella già presente
      if (pagellaVoto.id == 0) {
        this.svcPagellaVoti.post(pagellaVoto).subscribe({
          next: res => this.loadData() ,
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio post', panelClass: ['red-snackbar']})
        })
      } 
      else {
        this.svcPagellaVoti.put(pagellaVoto).subscribe({
          next: res => { },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio put', panelClass: ['red-snackbar']})
        })
      }
    }
  }

//#endregion

//#region ----- Altri metodi -------------------

  changeSelectGiudizio(pagellaVoto: DOC_PagellaVoto, tipoGiudizioID: number) {

    pagellaVoto.pagellaID = this.pagella.id;

    if (pagellaVoto.tipoGiudizioID == null) 
    pagellaVoto.tipoGiudizioID = 1;
    pagellaVoto.tipoGiudizioID = tipoGiudizioID;

    let pagellaVoto2 = Object.assign({}, pagellaVoto);
    this.savePagellaVoto(pagellaVoto2)
  }

  changeVoto(pagellaVoto: DOC_PagellaVoto, voto: any) {

    pagellaVoto.pagellaID = this.pagella.id;

    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    pagellaVoto.voto = votoN;

    if (pagellaVoto.tipoGiudizioID == null) 
      pagellaVoto.tipoGiudizioID = 1;

    let pagellaVoto2 = Object.assign({}, pagellaVoto);
    this.savePagellaVoto(pagellaVoto2)
  }

  changeNote(pagellaVoto: DOC_PagellaVoto, note: string) {
    
    pagellaVoto.pagellaID = this.pagella.id;;

    pagellaVoto.note = note;

    if (pagellaVoto.tipoGiudizioID == null) 
    pagellaVoto.tipoGiudizioID = 1;

    let pagellaVoto2 = Object.assign({}, pagellaVoto);
    this.savePagellaVoto(pagellaVoto2)
  }

  changeData(event: any) {
    this.pagella.dtPagella = Utility.formatDate(event.target.value, FormatoData.yyyy_mm_dd);
    this.savePagella();
  }

  openObiettivi(element: DOC_PagellaVoto) {

    const dialogConfig : MatDialogConfig = {
    panelClass: 'add-DetailDialog',
    width: '600px',
    height: '300px',
    data: {
        iscrizioneID:         this.iscrizioneID,
        pagellaID:            this.pagella.id,
        periodo:              this.periodo,
        pagellaVotoID:        element.id,
        materiaID:            element.materiaID,
        classeSezioneAnnoID:  this.classeSezioneAnnoID,
        chiusa:               this.chiusa
      }
    }
    
    const dialogRef = this._dialog.open(VotiObiettiviEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( 
      () => { 
        this.reloadParent.emit();
        this.loadData(); 
      });
  }
  
  chiudiDocumento() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "CHIUSURA DELLA PAGELLA", sottoTitolo: "Questa operazione è IRREVERSIBILE.<br>Non sarà più possibile modificare i voti.<br>Si conferma?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {

      if(result) {
        this.svcPagelle.completa(this.pagella.id!).subscribe();
        this.chiusa = true;
      }

    });
  }

  apriDocumento() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "APERTURA DELLA PAGELLA", sottoTitolo: "Operazione consentita solo agli IT Administrator...Qui serve una password."}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcPagelle.riapri(this.pagella.id!).subscribe();
        this.chiusa = false;
      }
    });
  }


//***********  DA QUI E' TUTTO PER IL DOWNLOAD PREVIEW VA MESSA IN UNA UTILITY **********************/

  downloadPreviewPagella() {
    let nomeFile: string;
    nomeFile = "PREVIEW_Pagella"  + '_' + this.iscrizione.classeSezioneAnno.anno.annoscolastico + "(" + this.periodo +"quad)_" + this.iscrizione.alunno.persona.cognome + ' ' + this.iscrizione.alunno.persona.nome + '.docx';    
    this.svcFiles.buildAndGetBase64(this.openXMLPreparaOggetto(this.iscrizione.alunno, this.iscrizione, this.lstPagellaVoti, this.pagella), nomeFile );
  }
  
  openXMLPreparaOggetto (alunno: ALU_Alunno, iscrizione: CLS_Iscrizione, lstPagellaVoti: DOC_PagellaVoto[], objPagella: DOC_Pagella) {

    function estraiVoto(objPagellaVoto: DOC_PagellaVoto[], materia: string, index: number) {
      for (const PagellaVoto of objPagellaVoto) {

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