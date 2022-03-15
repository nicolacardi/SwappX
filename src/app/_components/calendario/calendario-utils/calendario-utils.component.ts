import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MatDateRangeSelectionStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LezioniService } from '../lezioni.service';

//components


//services


//models



//#region Injectable per la selezione dell'intervallo nel matdatepicker
  //si può creare una directive a sè oppure inserire un injectable qui e poi fornirlo come provider+useclass  al component
  @Injectable()
  export class MyRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
    start: any;
    //https://stackoverflow.com/questions/64521480/angular-material-datepicker-limit-the-range-selection

    constructor(
      private _dateAdapter: DateAdapter<D>
    ) {}

    //selectionFinished governa cosa accade quando si clicca per ritornare il valore del range
    selectionFinished(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
      let { start, end } = currentRange;
      if (start == null || (start && end)) {
          start = activeDate;
          end = null;
      } else if (end == null) {
        let offset: number;
        offset = -(this._dateAdapter.getDayOfWeek(start) - 1 );
        start = this._dateAdapter.addCalendarDays(start, offset);
        end = this._dateAdapter.addCalendarDays(start, 5);
        return new DateRange(start, end);
      }
      return new DateRange<D>(start, end);
    }

    //createPreview governa la fase di interazione prima del click di chiusura
    createPreview(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
      return this._createFiveDayRange(activeDate, currentRange);
    }

    //funzione di supporto...potrebbe forse essere usata anche da selectionFinished
    private _createFiveDayRange(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
      let { start, end } = currentRange;

      if (start && !end) {
        let offset: number;
        offset = -(this._dateAdapter.getDayOfWeek(start) - 1 );
        start = this._dateAdapter.addCalendarDays(start, offset);
        end = this._dateAdapter.addCalendarDays(start, 5);
        return new DateRange(start, end);
      }
      return new DateRange<D>(null, null);
    }

  }
//#endregion



@Component({
  selector: 'app-calendario-utils',
  templateUrl: './calendario-utils.component.html',
  styleUrls: ['./calendario-utils.component.css'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MyRangeSelectionStrategy,
    },
  ],
})
export class CalendarioUtilsComponent implements OnInit {

//#region ----- Variabili -------

  form!:                     FormGroup;


//#endregion

  constructor(
    public _dialogRef: MatDialogRef<CalendarioUtilsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Date,
    private fb:                           FormBuilder, 
    private _dateAdapter:                 DateAdapter<Date>,
    private svcLezioni:                   LezioniService
  ) {
    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      picker1start:                  [null],
      picker1end:                    [null],
      picker2start:                  [null],
      picker2end:                    [null],
      ckTutteleClassi1:              [null],
      ckTutteleClassi2:              [null] 

    });
   }

  ngOnInit(): void {
  }


  copiaFinoA() {

  }

  copiaDa() {
    
    let ckTutteleClassi1 = this.form.controls.ckTutteleClassi1.value;

    let dtStart: Date;
    dtStart = this.form.controls.picker1start.value;
    //let dtStartYYYY_MM_DD = dtStart.toLocaleString('sv').replace(' ', 'T').substring(0,10);

    // let dtEnd: Date;
    // dtEnd = this.form.controls.picker1end.value;
    // let dtEndYYYY_MM_DD = dtEnd.toLocaleString('sv').replace(' ', 'T').substring(0,10);
    
    
    let dtCopyFrom: Date;
    let dtCopyTo: Date;
    let dtCopyFromYYYY_MM_DD: string;
    let dtCopyToYYYY_MM_DD: string;

    //let currDate: Date;

    let currDate :Date = this.data;
    let offset:number = -(this._dateAdapter.getDayOfWeek(currDate) - 1 );
    let currMonday:Date = this._dateAdapter.addCalendarDays(currDate, offset);
    for (let i = 0; i <= 5; i++) {
      dtCopyFrom = this._dateAdapter.addCalendarDays(dtStart, i);
      dtCopyFromYYYY_MM_DD = dtCopyFrom.toLocaleString('sv').replace(' ', 'T').substring(0,10)
      console.log ( "copia da", dtCopyFromYYYY_MM_DD );
      
 
      //console.log(currMonday);
      dtCopyTo = this._dateAdapter.addCalendarDays(currMonday, i);
      dtCopyToYYYY_MM_DD = dtCopyTo.toLocaleString('sv').replace(' ', 'T').substring(0,10)
      console.log ( "copia a", dtCopyToYYYY_MM_DD );
      if (ckTutteleClassi1 == true) {
        //ciclo for su tutte le classi: che sia il caso di selezionarle con delle checkbox in un form per dire "questa classe sì, questa no"?
      } else {
        this.svcLezioni.copyAllEventsFromDateToDate(dtCopyFrom, dtCopyTo);
      }
      

    }

  }

}
