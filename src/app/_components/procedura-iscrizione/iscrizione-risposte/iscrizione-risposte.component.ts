//#region ----- IMPORTS ------------------------
import { Component, Input, OnInit }             from '@angular/core';
import { DomandeService }                      from '../../impostazioni/domande/domande.service';
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
import { _UT_Domanda }                          from 'src/app/_models/_UT_Domanda';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';

//#endregion
@Component({
  selector: 'app-iscrizione-risposte',
  templateUrl: './iscrizione-risposte.component.html',
  styleUrls: ['../procedura-iscrizione.css']
})
export class IscrizioneRisposteComponent implements OnInit  {

//#region ----- Variabili ----------------------
  iscrizione!:                                  CLS_Iscrizione;
  rettaConcordata!:                             number;
  obsDomande$!:                                Observable<_UT_Domanda[]>;
  formRisposte! :                               UntypedFormGroup;
  questions: any[] = []; // Assuming questions is an array of question objects

  matDataSource = new MatTableDataSource<_UT_Domanda>();
  
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
  
constructor(private svcDomande:                DomandeService,
            private fb:                         UntypedFormBuilder, 
            private svcRisorse:                 RisorseService,
            private svcIscrizioni:              IscrizioniService,
            private svcRette:                   RetteService,

            private _loadingService:            LoadingService,
            public _dialog:                     MatDialog,
            private _snackBar:                  MatSnackBar,
            ) {

    this.formRisposte = this.fb.group({})
            }
//#endregion

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
    this.svcIscrizioni.get(this.iscrizioneID).subscribe(iscrizione=> {this.iscrizione = iscrizione;})
    this.svcRette.sumConcordateByIscrizione(this.iscrizioneID).subscribe(rettaConcordata=> {this.rettaConcordata = rettaConcordata;})

    this.loadData();
  }

  loadData() {
    this.obsDomande$ = this.svcDomande.list()
    .pipe( 
      map(res=> res.filter((x) => x.contesto == this.contesto)), //carico domande x consensi o dati economici a seconda del valore in input
    )
    ;  
    const loadDomande$ =this._loadingService.showLoaderUntilCompleted(this.obsDomande$);

    loadDomande$.subscribe(
      questions =>   {

        this.matDataSource.data = questions;
        //devo aggiungere al form un controllo x ogni domanda (di due tipi diversi)
        //in modo che il pulsante di "Salva e continua" si disabiliti se uno non risponde a tutto
        //element.id è l'id della domanda cioè di _UT_Domande
        this.questions = questions;
          this.questions.forEach((element) => {
            if (element.tipo == 'Scelta Singola') {
              if (element.numOpzioni >1) this.formRisposte.addControl(element.id, this.fb.control('', Validators.required));
              if (element.numOpzioni ==1) this.formRisposte.addControl(element.id, this.fb.control('', Validators.requiredTrue));
            }
            if (element.tipo == 'Scelta Multipla') { //qui devo aggiungere N Controls......e non uno solo!
              this.formRisposte.addControl(element.id+"_1", this.fb.control(''));
              this.formRisposte.addControl(element.id+"_2", this.fb.control(''));
              this.formRisposte.addControl(element.id+"_3", this.fb.control(''));
              this.formRisposte.addControl(element.id+"_4", this.fb.control(''));
              this.formRisposte.addControl(element.id+"_5", this.fb.control(''));
              this.formRisposte.addControl(element.id+"_6", this.fb.control(''));
            }
            if (element.tipo == 'Risposta Libera') {
              this.formRisposte.addControl(element.id+"_RL", this.fb.control('', Validators.required));
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
