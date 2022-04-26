import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { PagellaVotoObiettiviService } from '../pagella-voto-obiettivi.service';
import { PagelleService } from '../pagelle.service';


//classes
import { DialogDataVotiObiettivi } from 'src/app/_models/DialogData';
import { DOC_PagellaVotoObiettivo } from 'src/app/_models/DOC_PagellaVotoObiettivo';
import { DOC_TipoLivelloObiettivo } from 'src/app/_models/DOC_TipoLivelloObiettivo';
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';
import { concatMap, tap } from 'rxjs/operators';
import { DOC_PagellaVoto } from 'src/app/_models/DOC_PagellaVoto';
import { PagellaVotiService } from '../pagella-voti.service';


@Component({
  selector: 'app-voti-obiettivi-edit',
  templateUrl: './voti-obiettivi-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class VotiObiettiviEditComponent implements OnInit {
//#region ----- Variabili -------

  matDataSource = new                   MatTableDataSource<DOC_PagellaVotoObiettivo>();
  obsTipiLivelloObiettivo$!:            Observable<DOC_TipoLivelloObiettivo[]>;

  displayedColumns: string[] = [
    "descrizione", 
    "livello"
  ];

//#endregion  
//#region ----- ViewChild Input Output -------

//#endregion

  constructor(    
    public _dialogRef: MatDialogRef         <VotiObiettiviEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data:   DialogDataVotiObiettivi,
    private svcPagella:                     PagelleService,
    private svcPagellaVoti:                 PagellaVotiService,
    private svcPagellaVotoObiettivi:        PagellaVotoObiettiviService,

    private _loadingService:                LoadingService,
    private _snackBar:                      MatSnackBar,


    ) { }


  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.obsTipiLivelloObiettivo$= this.svcPagellaVotoObiettivi.listTipiLivelliObiettivo();

    let obsPagellaVotoObiettivi$: Observable<DOC_PagellaVotoObiettivo[]>;

    //obsObiettivi$= this.svcObiettivi.listByMateriaAndClasseAndAnno(this.data.materiaID, this.data.classeSezioneAnnoID);
    obsPagellaVotoObiettivi$= this.svcPagellaVotoObiettivi.ListByPagellaMateriaClasseSezioneAnno(this.data.pagellaVotoID, this.data.materiaID, this.data.classeSezioneAnnoID);

    let loadObiettivi$ =this._loadingService.showLoaderUntilCompleted(obsPagellaVotoObiettivi$);

    loadObiettivi$.subscribe(val =>  {
        this.matDataSource.data = val;
        console.log ("val", val);
        //this.matDataSource.paginator = this.paginator;          
        //this.sortCustom();
        //this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
  }

  changeSelectObiettivo(element: DOC_PagellaVotoObiettivo, valLivello: number) {
    console.log ("element", element);
    console.log ("val", valLivello);
    if (element.id !=0) {

      let formDataPagella: DOC_PagellaVotoObiettivo = {
        id:           element.id,
        pagellaVotoID:element.pagellaVotoID,
        obiettivoID:  element.obiettivoID,
        livello:      valLivello,
      };
      
      this.svcPagellaVotoObiettivi.put(formDataPagella)
        .subscribe(
          res => {},
          err => {this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio post', panelClass: ['red-snackbar']})}
        );
    } else {
      //manca l'id obiettivo, bisogna fare una post dell'obiettivo
      //prima però bisogna verificare se c'è l'IDPagella, se non c'è va creato
      //e bisogna verificare se c'è l'IDPagella Voto, se non c'è va creato
      
      
      const d = new Date();
      d.setSeconds(0,0);
      let dateNow = d.toISOString().split('.')[0];

              //preparo i tre oggetti per la Pagella, PagellaVoto e PagellaVotoObiettivo, con quello che so finora
              let formDataPagella: DOC_Pagella = {
                iscrizioneID:           this.data.iscrizioneID,
                periodo:                this.data.periodo,
                dtIns:                  dateNow
                //....
              };
              
              let formDataPagellaVoto: DOC_PagellaVoto = {
                materiaID:           this.data.materiaID,
                ckAmmesso:           false,
                ckFrequenza:         false,
                dtVoto:              dateNow,
                tipoGiudizioID:      1,
                n_assenze:           0,
                dtIns:               dateNow
                //....
              };
              
              let formDataPagellaVotoObiettivo: DOC_PagellaVotoObiettivo = {
                obiettivoID:         element.obiettivoID,
                livello:             valLivello,
                dtIns:               dateNow
                //....
              };

    console.log ("*********************************************************************");


      if (this.data.pagellaID ==-1) {
        console.log ("non c'è pagellaID, e non c'è quindi, nemmeno, PagellaVotoID e nemmeno PagellaVotoObiettivoID");
        console.log ("vado a inserire in pagella:", formDataPagella);

        this.svcPagella.post(formDataPagella)
        .pipe (
          tap( x =>  {
            console.log ("pagellaID appena creato:", x.id);
            formDataPagellaVoto.pagellaID = x.id;
            this.data.pagellaID = x.id!;

            console.log ("vado a inserire in pagellaVoto:", formDataPagellaVoto);

          } ),
          concatMap( () => 
            this.svcPagellaVoti.post(formDataPagellaVoto)
          ),
          tap( x =>  {
            console.log ("pagellaVotoID appena creato:", x.id);
            formDataPagellaVotoObiettivo.pagellaVotoID = x.id;
            this.data.pagellaVotoID = x.id;
            console.log ("vado a inserire in pagellaVotoObiettivo:", formDataPagellaVotoObiettivo);

          } ),
          concatMap( () =>
            this.svcPagellaVotoObiettivi.post(formDataPagellaVotoObiettivo)
          )
        )
        .subscribe(
          res => {
            console.log ("pagellaVotoObiettivoID appena creato:", res.id);
            //this.loadData();
          },
          err => {}
        )
      } else {
        formDataPagellaVoto.pagellaID = this.data.pagellaID;

        if (this.data.pagellaVotoID == 0 ){
          console.log ("c'è pagellaID, ma non c'è pagellaVotoID nè quindi PagellaVotoObiettivoID");
          console.log ("vado a inserire in pagellaVoto:", formDataPagellaVoto);

          this.svcPagellaVoti.post(formDataPagellaVoto)
          .pipe (
            tap( x =>  {
              console.log ("pagellaVotoID appena creato:", x.id);
              formDataPagellaVotoObiettivo.pagellaVotoID = x.id 
              this.data.pagellaVotoID = x.id;
              console.log ("vado a inserire in pagellaVotoObiettivo:", formDataPagellaVotoObiettivo);

            } ),
            concatMap( () =>
              this.svcPagellaVotoObiettivi.post(formDataPagellaVotoObiettivo)
            )
          )
          .subscribe(
            res => {
              //this.loadData();
              console.log ("pagellaVotoObiettivoID appena creato:", res.id);
            },
            err => {}
          )
        } else {
          console.log ("c'è pagellaID, e c'è pagellaVotoID, non c'è PagellaVotoObiettivoID");
          console.log ("vado a inserire in pagellaVotoObiettivo:", formDataPagellaVotoObiettivo);

          formDataPagellaVotoObiettivo.pagellaVotoID = this.data.pagellaVotoID;

          this.svcPagellaVotoObiettivi.post(formDataPagellaVotoObiettivo)
          .subscribe(
            res => {
              console.log ("pagellaVotoObiettivoID appena creato:", res.id);
            },
            err => {}
          )
        }
      }
    }
  }
}
