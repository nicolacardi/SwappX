//#region ----- IMPORTS ------------------------

import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { DateAdapter }                          from '@angular/material/core';
// import { DateRange, MatDateRangeSelectionStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { LezioniService }                       from '../lezioni.service';

//models
import { DialogDataLezioniUtils }               from 'src/app/_models/DialogData';
import { Observable } from 'rxjs';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { AnniScolasticiService } from '../../anni-scolastici/anni-scolastici.service';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { FormatoData, Utility } from '../../utilities/utility.component';

//#endregion

//#region Injectable per la selezione dell'intervallo nel matdatepicker
  //si può creare una directive a sè oppure inserire un injectable qui e poi fornirlo come provider+useclass  al component
  //https://stackoverflow.com/questions/64521480/angular-material-datepicker-limit-the-range-selection

  // @Injectable()
  // export class MyRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  //   start: any;
    
  //   constructor(
  //              private _dateAdapter:            DateAdapter<D>,
  //              ) {
  //   }
  //   //le funzioni qui sotto vengono usate da MatDateRangeSelectionStrategy. Servono per selezionare una settimana intera.

  //   //selectionFinished governa cosa accade quando si clicca, per ritornare il valore del range
  //   selectionFinished(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
  //     let offset: number;
  //     let { start, end } = currentRange;

  //     if (start == null || (start && end)) {
  //       start = activeDate;
  //       end = null;
  //     } 
  //     else if (end == null) {     
  //       offset = -(this._dateAdapter.getDayOfWeek(start) - 1 );
  //       start = this._dateAdapter.addCalendarDays(start, offset);
  //       end = this._dateAdapter.addCalendarDays(start, 5);
  //       return new DateRange(start, end);
  //     }
  //     return new DateRange<D>(start, end);
  //   }

  //   //createPreview governa la fase di interazione prima del click di chiusura
  //   createPreview(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
  //     return this._createFiveDayRange(activeDate, currentRange);
  //   }

  //   //funzione di supporto...potrebbe forse essere usata anche da selectionFinished
  //   private _createFiveDayRange(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
  //     let { start, end } = currentRange;

  //     if (start && !end) {
  //       let offset: number;
  //       offset = -(this._dateAdapter.getDayOfWeek(start) - 1 );
  //       start = this._dateAdapter.addCalendarDays(start, offset);
  //       end = this._dateAdapter.addCalendarDays(start, 5);
  //       return new DateRange(start, end);
  //     }
  //     return new DateRange<D>(null, null);
  //   }
  // }

//#endregion

@Component({
  selector: 'app-download-registro',
  templateUrl: './download-registro.component.html',
  styleUrls: ['../lezioni.css'],
  // providers: [
  //   {
  //     provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
  //     useClass: MyRangeSelectionStrategy,
  //   },
  // ],
})

export class DownloadRegistroComponent implements OnInit {

//#region ----- Variabili ----------------------

  form!:                     UntypedFormGroup;
  currMonday!:               Date;
  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>; 
  obsClassiSezioniAnni$!:                       Observable<CLS_ClasseSezioneAnno[]>; 

//#endregion

//#region ----- Constructor --------------------

  constructor( public _dialogRef: MatDialogRef<DownloadRegistroComponent>,
               private svcLezioni:              LezioniService,  
               private svcAnni:                 AnniScolasticiService,     
               private svcClassiSezioniAnni:    ClassiSezioniAnniService,        
               @Inject(MAT_DIALOG_DATA) public data: DialogDataLezioniUtils,
               private fb:                      UntypedFormBuilder, 
               private _dateAdapter:            DateAdapter<Date>,
               private _snackBar:               MatSnackBar  ) {

    _dialogRef.disableClose = true;

    const today = new Date();
    let formattedDate= this.formatDt(Utility.formatDate(today.toISOString(), FormatoData.dd_mm_yyyy));
    this.form = this.fb.group({
      // picker1start:                  [null, Validators.required],
      // picker1end:                    [null, Validators.required],
      // picker2start:                  [null, Validators.required],
      // picker2end:                    [null, Validators.required],
      start:                                    [formattedDate, Validators.required],
      end:                                      [formattedDate, Validators.required],
      selectAnnoScolastico:                     [1, Validators.required],
      selectClasseSezioneAnno:                  ['', Validators.required]
      
    });
   }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    // let currDate :Date = this.data.start;
    // let offset:number = -(this._dateAdapter.getDayOfWeek(currDate) - 1 );
    // this.currMonday = this._dateAdapter.addCalendarDays(currDate, offset);
    //this.currMonday = dtCopyToStart.toLocaleString('sv').replace(' ', 'T').substring(0,10);
    this.obsAnni$ = this.svcAnni.list();
    this.obsClassiSezioniAnni$ = this.svcClassiSezioniAnni.listByAnno(1);

    this.form.controls.selectAnnoScolastico.valueChanges.subscribe(val=> {
      this.obsClassiSezioniAnni$ = this.svcClassiSezioniAnni.listByAnno(val);
    }  
    );

  }

//#endregion

//#region ----- Vari metodi --------------------
  downloadRegistro() {
    let CSAID= this.form.controls.selectClasseSezioneAnno.value;
    let start = this.form.controls.start.value;
    let end = this.form.controls.end.value;
    console.log(CSAID, start, end);
    this.svcLezioni.listByCSAAndDate(CSAID, start, end).subscribe(val=> console.log(val))
  }


  changedDt(dt: string, control: string){
    if (dt == '' || dt== null || dt == undefined) return;
    let formattedDate = this.formatDt(dt);
    //impostazione della data finale
    this.form.controls[control].setValue(formattedDate, {emitEvent:false});
  }

  formatDt(dt: string): string{

    // console.log ("download-registro - formatDt - dt", dt);
    const parts = dt.split('/'); // Split the input string by '/'
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
  
    // creo la nuova data con i valori estratti (assumendo l'ordine day/month/year)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    // console.log ("download-registro - formatDt - date", date);
    // formatto la data al tipo richiesto dal controllo data ('yyyy-MM-dd')
    let formattedDate = date.toISOString().slice(0, 10);
  
    //piccolo step per evitare che 1/1/2008 diventi 31/12/2007
    formattedDate = Utility.formatDate(date, FormatoData.yyyy_mm_dd);

    //impostazione della data finale
    return formattedDate;
  }


//#endregion
}
