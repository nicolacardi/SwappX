//#region ----- IMPORTS ------------------------
import { Component, Input, OnInit }             from '@angular/core';
import { ConsensiService }                      from '../../impostazioni/consensi/consensi.service';
import { MatDialog }                            from '@angular/material/dialog';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { Observable, map, tap }                           from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatTableDataSource }                   from '@angular/material/table';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';


//services
import { RisorseService }                       from '../../impostazioni/risorse/risorse.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { RetteService }                         from '../../pagamenti/rette.service';

//models
import { _UT_Consenso }                         from 'src/app/_models/_UT_Consenso';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';

//#endregion
@Component({
  selector: 'app-iscrizione-consensi',
  templateUrl: './iscrizione-consensi.component.html',
  styleUrls: ['../procedura-iscrizione.css']
})
export class IscrizioneConsensiComponent implements OnInit  {

//#region ----- Variabili ----------------------
  iscrizione!:                                  CLS_Iscrizione;
  rettaConcordata!:                             number;
  obsConsensi$!:                                Observable<_UT_Consenso[]>;
  formConsensi! :                               UntypedFormGroup;
  questions: any[] = []; // Assuming questions is an array of question objects

  matDataSource = new MatTableDataSource<_UT_Consenso>();
  
  displayedColumns: string[] = [
    "domanda",
    "opzioni",
    "allegato"
  ];

  
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() iscrizioneID!:                       number;
  @Input() contesto!:                           string;
//#endregion

//#region ----- Constructor --------------------
  
constructor(private svcConsensi:                ConsensiService,
            private fb:                         UntypedFormBuilder, 
            private svcRisorse:                 RisorseService,
            private svcIscrizioni:              IscrizioniService,
            private svcRette:                   RetteService,

            private _loadingService:            LoadingService,
            public _dialog:                     MatDialog,
            private _snackBar:                  MatSnackBar,
            ) {

    this.formConsensi = this.fb.group({})
            }
//#endregion

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
    this.svcIscrizioni.get(this.iscrizioneID).subscribe(iscrizione=> {this.iscrizione = iscrizione;})
    this.svcRette.sumConcordateByIscrizione(this.iscrizioneID).subscribe(rettaConcordata=> {this.rettaConcordata = rettaConcordata;})

    this.loadData();
  }

  loadData() {
    this.obsConsensi$ = this.svcConsensi.list()
    .pipe( 
      map(res=> res.filter((x) => x.contesto == this.contesto)), //carico domande x consensi o dati economici a seconda del valore in input
    )
    ;  
    const loadConsensi$ =this._loadingService.showLoaderUntilCompleted(this.obsConsensi$);

    loadConsensi$.subscribe(
      questions =>   {

        this.matDataSource.data = questions;
        //devo aggiungere al form un controllo x ogni domanda (di due tipi diversi)
        //in modo che il pulsante di "Salva e continua" si disabiliti se uno non risponde a tutto
        //element.id è l'id della domanda cioè di _UT_Consensi
        this.questions = questions;
          this.questions.forEach((element) => {
            if (element.tipo == 'Scelta Singola') {
              if (element.numOpzioni >1) this.formConsensi.addControl(element.id, this.fb.control('', Validators.required));
              if (element.numOpzioni ==1) this.formConsensi.addControl(element.id, this.fb.control('', Validators.requiredTrue));
            }
            if (element.tipo == 'Scelta Multipla') { //qui devo aggiungere N Controls......e non uno solo! Ma devo proprio? forse non devo proprio
            }
          })
      });

    
  }
//#endregion
//#region ----- Altri metodi -------------------

  download(risorsaID:number){
    if (risorsaID == null) return;
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Richiesta download inviata...', panelClass: ['green-snackbar']});
    this.svcRisorse.get(risorsaID).subscribe(
      res=> {
        const pdfData = res.base64.split(',')[1]; // estrae la stringa base64 dalla virgola in avanti
        const source = `data:application/pdf;base64,${pdfData}`;
        const link = document.createElement("a");
        link.href = source;
        link.download = `${res.nomeFile}.pdf`
        link.click();
      }
    )
  }


  //TODO Inserire Save per poter richiamare da procedura iscrizione

  
//#endregion


}
