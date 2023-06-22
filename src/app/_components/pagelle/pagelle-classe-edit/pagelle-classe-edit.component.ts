//#region ----- IMPORTS ------------------------

import { Component, Input }          from '@angular/core';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable, concatMap, iif, tap }      from 'rxjs';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';


//components
import { VotiObiettiviEditComponent }           from '../voti-obiettivi-edit/voti-obiettivi-edit.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PagellaVotiService }                   from '../pagella-voti.service';
import { ObiettiviService }                     from '../../obiettivi/obiettivi.service';
import { ClassiSezioniAnniService }             from '../../classi/classi-sezioni-anni.service';

//models
import { DOC_PagellaVoto, DOC_TipoGiudizio }    from 'src/app/_models/DOC_PagellaVoto';
import { CLS_ClasseSezioneAnno }                from 'src/app/_models/CLS_ClasseSezioneAnno';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { PagelleService } from '../pagelle.service';
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';


//#endregion

@Component({
  selector: 'app-pagelle-classe-edit',
  templateUrl: './pagelle-classe-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class PagelleClasseEditComponent{

//#region ----- Variabili ----------------------

  @Input('classeSezioneAnnoID') classeSezioneAnnoID! : number;
  @Input('materiaID') materiaID! :              number;
  @Input('tipoVoto') tipoVoto! :                string;


  displayedColumns!: string[];
  displayedColumnsPerObiettivi: string[] = [
    "nome",
    "cognome", 
    "openOb1",
    "VotiOb1",
    "note1",
    "openOb2",
    "VotiOb2",
    "note2"
  ];
  displayedColumnsNumerici: string[] = [
    "nome",
    "cognome", 
    "VotiNum1",
    "idle",
    "note1",
    "VotiNum2",
    "idle",
    "note2"
  ];
  displayedColumnsGiudizi: string[] = [
    "nome",
    "cognome", 
    "VotiGiu1",
    "idle",
    "note1",
    "VotiGiu2",
    "idle",
    "note2"
  ];

  filterValue = '';   
  filterValues = {
    nome: '',
    cognome: '',
    filtrosx: ''
  };
  countObiettivi!:                              number;
  matDataSource =                               new MatTableDataSource<CLS_Iscrizione>();
  obsTipiGiudizio$!:                            Observable<DOC_TipoGiudizio[]>;

//#endregion

  constructor(

    private svcClassiSezioniAnni:               ClassiSezioniAnniService,
    private svcPagella:                         PagelleService,
    private svcPagellaVoti:                     PagellaVotiService,
    private svcObiettivi:                       ObiettiviService,
    private _loadingService:                    LoadingService,    
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,


  ) { }


  ngOnChanges() {
    //console.log("pagelle-classe-edit - ngOnChanges - this.materiaID:", this.materiaID, "this.classeSezioneAnnoID: ", this.classeSezioneAnnoID, "this.tipoVoto: ", this.tipoVoto);
    if (this.classeSezioneAnnoID && this.materiaID != 0 && this.tipoVoto != "") this.loadData();
  }

  loadData() {


        switch (this.tipoVoto) {
          case 'Per Obiettivi':
            this.displayedColumns = this.displayedColumnsPerObiettivi;
            break;
          case 'Numerici':
            this.displayedColumns = this.displayedColumnsNumerici;
            break;
          case 'Giudizi':
            this.displayedColumns = this.displayedColumnsGiudizi;
            break;
          default:
            //console.log("qualche problema!");
        }
      //}),


    this.obsTipiGiudizio$= this.svcPagellaVoti.listTipiGiudizio();

    let obsPagelleVoti$: Observable<CLS_Iscrizione[]>;

    obsPagelleVoti$= this.svcPagellaVoti.listByCSAMateria(this.classeSezioneAnnoID, this.materiaID);
      
    const loadPagelleVoti$ =this._loadingService.showLoaderUntilCompleted(obsPagelleVoti$);

    loadPagelleVoti$.subscribe(
        val =>   {
          this.matDataSource.data = val;
          console.log ("classeSezioneAnnoID: ", this.classeSezioneAnnoID, " - materiaID: ", this.materiaID);

          console.log ("pagelle-classe-edit - loadData - val: ", val);
          this.matDataSource.filterPredicate = this.filterPredicate();

        }
      );

    let classeSezioneAnno : CLS_ClasseSezioneAnno;

    this.svcClassiSezioniAnni.get(this.classeSezioneAnnoID).pipe(
      tap(val => classeSezioneAnno = val),
      concatMap(() => this.svcObiettivi.countByMateriaAndClasseAndAnno(this.materiaID, classeSezioneAnno.classeSezione.classeID, classeSezioneAnno.annoID))
    ).subscribe(val => {
      this.countObiettivi = val;
      // console.log("****************************************");
    });

  }
  openObiettiviTest(iscrizioneID: number, pagellaID: number, periodo: number, pagellaVotoID: number ) {
    console.log (iscrizioneID, pagellaID, periodo, pagellaVotoID);
  }

  openObiettivi(iscrizioneID: number, pagellaID: number, periodo: number, pagellaVotoID: number ) {

    //console.log ( "pagelle-classe-edit - openObiettivi - valori per aprire dialog", iscrizioneID, pagellaID, periodo, pagellaVotoID, this.materiaID, this.classeSezioneAnnoID);

    //return;

    const dialogConfig : MatDialogConfig = {
    panelClass: 'add-DetailDialog',
    width: '600px',
    height: '300px',
    data: {
        iscrizioneID:         iscrizioneID,
        pagellaID:            pagellaID,
        periodo:              periodo,
        pagellaVotoID:        pagellaVotoID, //può essere 0
        materiaID:            this.materiaID,
        classeSezioneAnnoID:  this.classeSezioneAnnoID
      }
    }
    
    const dialogRef = this._dialog.open(VotiObiettiviEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( 
      () => { 
        //this.reloadParent.emit();
        this.loadData(); 
      });
  }
  changeVoto(iscrizioneID: number, pagella: DOC_Pagella, pagellaVoto: DOC_PagellaVoto, voto: any, periodo: number) {

   

    //potrei costruire l'ggetto objPagella come in pagella-voto-edit e poi darlo in pasto alla save di pagella-voto-edit.
    //quella si occupa ad esempio di creare la pagella se già non c'è
    //oppure qui gestire il solo salvataggio del voto in questione, ma appunto, sviscerare tutti i casi come è stato fatto lì

    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0

    //vediamo intanto cosa arriva
    console.log ("pagelle-classe-edit ->", pagellaVoto);
    if (!pagella) console.log ("non c'è pagella!");
    if (pagella) console.log ("c'è pagella!");
    if (!pagellaVoto) console.log ("non c'è pagellaVoto!");
    if (pagellaVoto) console.log ("c'è pagellaVoto!");
    console.log ("voto da impostare", votoN);
    console.log ("*****************************************");


    let today = new Date;
    let objPagellaVoto : DOC_PagellaVoto = {
      pagellaID : pagella? pagella.id : 0,
      materiaID : this.materiaID,

      ckFrequenza: false,
      ckAmmesso: false,
      voto: votoN,
      dtVoto: today.toString(),//data di oggi
      tipoGiudizioID : 1,
      n_assenze : 0,
      periodo : periodo
    }

    pagellaVoto.voto = votoN;
    if (pagellaVoto.tipoGiudizioID == null) 
        pagellaVoto.tipoGiudizioID = 1;

    let pagellaVoto2 = Object.assign({}, pagellaVoto);
    
    this.save(iscrizioneID, pagellaVoto2, pagella, periodo);
    

    //if (this.objPagella.ckStampato) this.resetStampato();
  }


  
  save (iscrizioneID: number, pagellaVoto: DOC_PagellaVoto, pagella: DOC_Pagella, periodo: number) {
    
    //pulizia pagellaVoto da oggetti composti
    delete pagellaVoto.iscrizione;
    delete pagellaVoto.materia;
    delete pagellaVoto.tipoGiudizio;
    delete pagellaVoto._ObiettiviCompleti;

    let objPagella : DOC_Pagella = {
      id: pagella? pagella.id : -1,
      iscrizioneID: iscrizioneID,
      periodo: periodo
    }

    console.log ("pagelle-classe-edit - save objPagella: ", objPagella);
    console.log ("pagelle-classe-edit - save pagellaVoto: ", pagellaVoto);

    //nel caso la pagella ancora non sia stata creata, va inserita
    if (objPagella.id == -1) {
      console.log("Pagella.id = -1: Non C'è una Pagella --->post pagella e poi postpagellaVoto");

      this.svcPagella.post(objPagella)
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
      console.log("Pagella.id <> -1: C'è una Pagella --->post o put del PagellaVoto");
      console.log("PagellaVoto: ", pagellaVoto);

      if (pagellaVoto == null) { //rispetto a pagella-voto-edit qui è un po' diverso
        console.log("post pagellaVoto");
        this.svcPagellaVoti.post(pagellaVoto).subscribe(
          res => this.loadData(),
          err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio post', panelClass: ['red-snackbar']})
        )
      } else {
        console.log("put pagellaVoto");
        this.svcPagellaVoti.put(pagellaVoto).subscribe(
          res => {},
          err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio put', panelClass: ['red-snackbar']})
        )
      }
    }
  }


  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  
  filterPredicate(): (data: any, filter: string) => boolean {

    let filterFunction = function(data: any, filter: any): boolean {

      console.log ("xxx", data, filter);

      let searchTerms = JSON.parse(filter);

      let boolSx = String(data.alunno.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;
      
      return boolSx;
    }
    return filterFunction;
  }

}
