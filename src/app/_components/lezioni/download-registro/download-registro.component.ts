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
import { DialogDataDownloadRegistro, DialogDataLezioniUtils }               from 'src/app/_models/DialogData';
import { Observable } from 'rxjs';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { AnniScolasticiService } from '../../anni-scolastici/anni-scolastici.service';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { FormatoData, Utility } from '../../utilities/utility.component';
import { RPT_TagDocument } from 'src/app/_models/RPT_TagDocument';
import { FilesService } from '../../pagelle/files.service';
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';

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
               private svcFiles:                FilesService,

               private svcClassiSezioniAnni:    ClassiSezioniAnniService,        
               @Inject(MAT_DIALOG_DATA) public data: DialogDataDownloadRegistro,
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

    if (this.data) {
      this.form.controls.selectAnnoScolastico.setValue(this.data.annoID);
      this.obsClassiSezioniAnni$ = this.svcClassiSezioniAnni.listByAnno(this.data.annoID);
      this.form.controls.selectClasseSezioneAnno.setValue(this.data.classeSezioneAnnoID);
    }
    

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

    this.svcLezioni.listByCSAAndDate(CSAID, start, end).subscribe(listalezioni=> 
      {
        console.log (listalezioni);
        this.svcFiles.buildAndGetBase64PadreDoc(this.openXMLPreparaRegistro(listalezioni), "Registro_di_Classe.docX");
      }
      )

  }

  openXMLPreparaRegistro (listalezioni: CAL_Lezione[]){

//    arrayOfObjects.sort((a, b) => (a.propertyToSortBy < b.propertyToSortBy ? -1 : 1));

    listalezioni.sort( (a, b) => (a.dtCalendario < b.dtCalendario? -1 : 1));

    const templateName = "RegistroClasseGiorno";
    type GroupedData = { [dateKey: string]: { date: Date; lezioni: CAL_Lezione[] } };

    // Raggruppa i dati per data: usa l'operatore reduce che fa n iterazioni, una per ogni elemento di listalezioni
    const groupedData: GroupedData = listalezioni.reduce((acc, lezione) => {
      const dateKey = lezione.dtCalendario;
      if (!acc[dateKey]) { //in pratica se non c'è già la data nell'accumulatore la aggiunge con un array vuoto di lezioni
        acc[dateKey] = { date: new Date(dateKey), lezioni: [] };
      }
      acc[dateKey].lezioni.push(lezione); //aggiunge la lezione corrente all'array lezioni della data corrente
      return acc;
    }, {} as GroupedData); //{} significa che il valore iniziale dell'accumulatore è un oggetto vuoto

    //console.log ("groupedData", groupedData); //a questo punto listalezioni è stato trasformato in un oggetto
    //nel quale ci sono n elementi, uno per data. Dentro ogni elemento c'è la data e le lezioni di quella data.

      const coverTagDocument: RPT_TagDocument = {
        templateName: "CoverRegistroDiClasse",
        tagFields: [
          { tagName: "ClasseSezione", tagValue: listalezioni[0].classeSezioneAnno.classeSezione.classe?.descrizione2 + ' ' +  listalezioni[0].classeSezioneAnno.classeSezione.sezione},
          { tagName: "AnnoScolastico", tagValue: listalezioni[0].classeSezioneAnno.anno.annoscolastico},
          { tagName: "DataDoc", tagValue: Utility.formatDate(new Date().toISOString(), FormatoData.dd_mm_yyyy)}
        ]
      };

    //Attenzione! groupedData è un OGGETTO
    //qui invece viene più comodo avere un ARRAY, per cui si crea orderedData che è l'array che ne deriva
    const orderedData = Object.entries(groupedData).map(([dateKey, { date, lezioni }]) => ({ dateKey, date, lezioni }));

    let sameWeek = true; //false->aggiunge un pagebreak all'inizio, true->non lo aggiunge
    let date1: Date;
    let date2: Date;
    const tagDocuments: RPT_TagDocument[] = orderedData.map(({ date, lezioni }, index) => {
      if (index > 0) 
      {
        date1= orderedData[index-1].date;
        date2= orderedData[index].date;
        sameWeek = this.isSameWeek(date1, date2);
      }
      console.log ("check", date1, date2, sameWeek);
        return {
          templateName: templateName,
          tagFields: [
            { tagName: "pageBreak", tagValue: sameWeek ? "false" : "true" }, //se ci troviamo in una nuova settimana saltiamo pagina
          ],
          tagTables: [
            {
              tagTableTitle: "TabellaGiornoOrario",
              tagTableRows: lezioni.map(lezione => ({
                tagFields: [
                  { tagName: "Data", tagValue: date.toLocaleDateString() },
                  { tagName: "Dalle", tagValue: lezione.h_Ini.slice(0, -3) },
                  { tagName: "Alle", tagValue: lezione.h_End.slice(0, -3) },
                  { tagName: "Docente", tagValue: `${lezione.docente.persona.nome} ${lezione.docente.persona.cognome}` },
                  { tagName: "Materia", tagValue: lezione.title },
                  { tagName: "ArgomentoECompiti", tagValue: `${lezione.argomento} - ${lezione.compiti}` },
                ]
              })),
            }
          ]
        };
      });

      const newTagDocuments = [coverTagDocument, ...tagDocuments];    
      console.log("newTagDocuments", newTagDocuments);
    return newTagDocuments;
  }

  isSameWeek(date1: Date, date2: Date): boolean {
    const year1 = date1.getFullYear();
    const week1 = this.getWeekNumber(date1);
    const year2 = date2.getFullYear();
    const week2 = this.getWeekNumber(date2);
    return year1 === year2 && week1 === week2;
  }
  
  // Funzione per ottenere il numero della settimana per una data
  getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7);
    return weekNumber;
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
