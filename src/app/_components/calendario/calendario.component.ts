import { ApplicationRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/angular';
import { FullCalendarComponent } from '@fullcalendar/angular';//-->serve per il ViewChild
import itLocale from '@fullcalendar/core/locales/it';
import { LezioniService } from './lezioni.service';
import { Observable } from 'rxjs';
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { LoadingService } from '../utilities/loading/loading.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { LezioneComponent } from './lezione/lezione.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../utilities/snackbar/snackbar.component';
import { concatMap, tap } from 'rxjs/operators';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import { CalendarioUtilsComponent } from './calendario-utils/calendario-utils.component';



@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

//#region ----- Variabili -------



  toggleDocentiMaterie = "materie";
  Events: any[] = [];

  calendarOptions: CalendarOptions = {

    //PROPRIETA' BASE
    initialView:  'timeGridWeek',
    slotMinTime:  '08:00:00',
    slotMaxTime:  '16:00:00',
    height:       500,
    allDaySlot:   false,                      //nasconde la riga degli eventi che durano il giorno intero
    locale:       'it',
    locales:      [itLocale],
    forceEventDuration : true,                //serve per attivare la defaultTimedEventDuration
    defaultTimedEventDuration : "01:00:00",   //indica che di default un evento dura un'ora
    expandRows: true,                         //estende in altezza le righe per adattare alla height il calendario
    hiddenDays: [ 0 ],                        //nasconde la domenica
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek mostraDocenti,settings'
    },  

    customButtons: {
      mostraDocenti: {
        text: 'Docenti',
        click: this.mostraDocenti.bind(this)
      },
      settings: {
        icon: 'settings-icon',
        click: this.openCalendarioUtils.bind(this)
      }

    },  

    //dayHeaderContent: { html: "<button></button>"},
    
    //PROPRIETA' DI PERMESSI
    editable:     true,                         //consente modifiche agli eventi presenti   :  da gestire sulla base del ruolo
    selectable:   true,                         //consente di creare eventi                 :  da gestire sulla base del ruolo

    //AZIONI
    select:       this.addEvento.bind(this),          //quando si crea un evento...
    eventClick:   this.openDetail.bind(this),         //quando si fa click su un evento esistente...
    eventDrop:    this.handleDrop.bind(this),         //quando si rilascia un evento che viene draggato...
    eventResize:  this.handleResize.bind(this),       //quando si fa il resize della durata di un evento...

//#region ***********TENTATIVI E TEST su calendarOptions

    // eventContent: function (event: any, element: any) {
    //   let eventWrapper = document.createElement('div');
    //   eventWrapper.addEventListener("click",function(event){ return this })
    //   //eventWrapper.innerText = 'test dayGridWeek';
    //   var arrayOfDomNodes = [eventWrapper];
    //   return { domNodes: arrayOfDomNodes };
    // },

    //******************* */

      //   eventDidMount: function(event) {
      //     console.log(event);
      //     console.log (event.el);
      //     event.el.prepend("<button>Add</button>");
      //     //$(event.el).closest('td[role="gridcell"]').find('.fc-daygrid-day-top').prepend('<button class="button button-secondary button-small">Add</button>');
      //     //$(event.el).closest('td[role="gridcell"]').find('.fc-daygrid-day-top').append('<button class="button button-secondary button-small">Add</button>');

      // },
  ///******************** */
    // eventContent: { html: "<button class='ilMioButton'>mybutton</button>" },
  //***/
    // eventDidMount: function (el) {
    //   let buttons = el.el.querySelectorAll(".ilMioButton");
    //   console.log (buttons);
    //         buttons.forEach( (btn) =>{
    //         btn.addEventListener("click", (e) => {
    //           console.log ('cucu');
    //           //this.deleteEvent()
    //         });
    //       })
    // },

  //********************* */

    //così lancio una funzione su click dell'evento. Potrei ad es. poi identificare se si tratta di un click sull'evento
    //o sul button
    // eventClick: function (info) {
    //   showdata(info.event.id);
    // }
  //********************* */
    //   eventClick: function(event: any, element: any) {
    //     element.html(event.title + '<span class="removeEvent glyphicon glyphicon-trash pull-right" id="Delete"></span>');
    //  }
  //********************* */
    // viewDidMount: function (info) {
    // let buttons = document.querySelectorAll(".ilMioButton");
    // console.log("buttons presenti", buttons);
    // buttons.forEach( (btn) =>{
    //   btn.addEventListener("click", (e) => {
    //     console.log ('cucu');
    //     this.deleteEvent()
    //   });
    // })
    // }

  //********************* */
    // eventClick: function(calEvent:any) { let tg = calEvent.jsEvent.target.id; //così si identifica su cosa si fa click

  //********************* */
    // views: {
    //   timeGridWeek: {  //questo modifica TUTTI gli eventi in questa vista
    //     eventContent: function (event: any, element: any) {
    //       let eventWrapper = document.createElement('div');
    //       eventWrapper.addEventListener("click",function(event){ (x: any) => x.bind.deleteEvent() })
    //       eventWrapper.innerText = 'test dayGridWeek';
    //       var arrayOfDomNodes = [eventWrapper];
    //       return { domNodes: arrayOfDomNodes };
    //     }
    //   },
    // },
//#endregion
  };
//#endregion


//#region ----- ViewChild Input Output -------
  @Input() idClasse!:                     number;
  @ViewChild('calendarDOM') calendarDOM!: FullCalendarComponent;
//#endregion


  
  constructor(
    private svcLezioni:       LezioniService,
    private _loadingService:  LoadingService,
    private _snackBar:        MatSnackBar,
    public _dialog:           MatDialog, 
    public appRef:            ApplicationRef
  ) { }


//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    if (this.idClasse != undefined) {
      this.loadData();
    }
  }

  ngOnInit(){
  }

  loadData () {
    let obsLezioni$: Observable<CAL_Lezione[]>;

    obsLezioni$= this.svcLezioni.listByClasseSezioneAnno(this.idClasse);
    const loadLezioni$ =this._loadingService.showLoaderUntilCompleted(obsLezioni$);
    loadLezioni$.subscribe(val => 
      {
        
        this.Events = val;
        this.calendarOptions.events = this.Events;
        this.setEventiDefault('title');
      }
    );
  }

  setEventiDefault(cosaMostrare: string) {
    this.calendarOptions.eventContent =         
    (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
    { 
        //mostra l'ora
        let timeText = document.createElement('div')
          timeText.className = "fc-event-time";
          timeText.innerHTML = arg.timeText;
        //include Info aggiuntive
        let titleText = document.createElement('div')
          titleText.className = "fc-event-title";
          titleText.innerHTML = arg.event[cosaMostrare];
        //include img/icon che lavorerà come fosse un button
        let img = document.createElement('img');
        if (arg.event.extendedProps.ckFirma == true) {
          img.src = '../../assets/sign_YES.svg';
        } else {
          img.src = '../../assets/sign_NO.svg';
        }
        img.className = "_iconFirma";
        
        img.addEventListener("click", (e: Event) => {
          e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
          this.anotherMethod();                                   //collega il metodo all'immagine
        })

        //Aggiungo icona epoca
        let img2 = document.createElement('img');
        if (arg.event.extendedProps.ckEpoca == true) {
          img2.src = '../../assets/epoca_YES.svg';
        } else {
          img2.src = '../../assets/epoca_NO.svg';
        }
        img2.className = "_iconEpoca";

        img2.addEventListener("click", (e: Event) => {
          e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
          this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
        })

        let arrayOfDomNodes = [ timeText, titleText, img, img2];     //prepara il set di Nodes
        return { domNodes: arrayOfDomNodes }
    }
  }
//#endregion

//#region ----- Add Edit Eventi -------

  openDetail(clickInfo: EventClickArg) {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '450px',
      data: {
        idLezione: clickInfo.event.id,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        dtCalendario: clickInfo.event.extendedProps.dtCalendario,
        h_Ini: clickInfo.event.extendedProps.h_Ini,
        h_End: clickInfo.event.extendedProps.h_End,
        idClasseSezioneAnno: this.idClasse
      }
    };

    console.log (dialogConfig);
    const dialogRef = this._dialog.open(LezioneComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => { 
        this.loadData(); 
      }
    );
  }
  
  openCalendarioUtils () {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '650px',
      height: '425px',
      data:  {
        start: this.calendarDOM.getApi().getDate(),
        idClasseSezioneAnno: this.idClasse
      }
    };
    const dialogRef = this._dialog.open(CalendarioUtilsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => { 
        this.loadData(); 
      }
    );
  }


  mostraDocenti () {
    if (this.toggleDocentiMaterie == 'materie') {
      this.toggleDocentiMaterie = 'docenti';
      this.calendarOptions!.customButtons!.mostraDocenti.text = "Lezioni"

      this.calendarOptions.eventContent =         
      (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
      { 
          //mostra l'ora
          let timeText = document.createElement('div')
            timeText.className = "fc-event-time";
            timeText.innerHTML = arg.timeText;
          //include Info aggiuntive
          let docenteText = document.createElement('i')
            docenteText.className = "fc-event-title";
            docenteText.innerHTML = arg.event.extendedProps.docente.persona.nome +  " " + arg.event.extendedProps.docente.persona.cognome;
          //include img/icon che lavorerà come fosse un button
          let img = document.createElement('img');
          if (arg.event.extendedProps.ckFirma == true) {
            img.src = '../../assets/sign_YES.svg';
          } else {
            img.src = '../../assets/sign_NO.svg';
          }
          img.className = "_iconFirma";
          

          img.addEventListener("click", (e: Event) => {
            e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
            this.anotherMethod();                                   //collega il metodo all'immagine
          })

          let arrayOfDomNodes = [ timeText, docenteText, img ];     //prepara il set di Nodes
          return { domNodes: arrayOfDomNodes }
      }

    } else {
      this.toggleDocentiMaterie = 'materie'
      this.calendarOptions!.customButtons!.mostraDocenti.text = "Docenti"
      this.setEventiDefault('title');
    } 
  }

  toggleEpoca(idLezione: number) {
    console.log (idLezione);
    this.svcLezioni.toggleEpoca(idLezione).subscribe(() => this.loadData());
  }

  anotherMethod () {
    console.log ("fat-to");
  }

  addEvento(selectInfo: DateSelectArg) {
    //INSERIMENTO NUOVO EVENTO
    let dtStart: Date;
    let dtEnd: Date;
    dtStart = selectInfo.start;
    dtEnd = selectInfo.end;


    //https://stackoverflow.com/questions/12413243/javascript-date-format-like-iso-but-local
    //console.log("toLocaleString(sv)", dtStart.toLocaleString('sv').replace(' ', 'T'));
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '450px',
      data: {
        idLezione: 0,
        start: dtStart.toLocaleString('sv').replace(' ', 'T'),
        end: dtEnd.toLocaleString('sv').replace(' ', 'T'),
        dtCalendario: dtStart.toLocaleString('sv').replace(' ', 'T').substring(0,10),
        h_Ini: dtStart.toLocaleString('sv').replace(' ', 'T').substring(11,19),
        h_End: dtEnd.toLocaleString('sv').replace(' ', 'T').substring(11,19),
        idClasseSezioneAnno: this.idClasse
      }
    };
    const dialogRef = this._dialog.open(LezioneComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => { 
        this.loadData(); 
      }
    );
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); 
  }

  handleResize (resizeInfo: EventResizeDoneArg) {
    let form: CAL_Lezione;

    this.svcLezioni.get(resizeInfo.event.id)
    .pipe (
      tap ( val   =>  {
        form = val;

        let dtISOLocaleEnd = resizeInfo.event.end!.toLocaleString('sv').replace(' ', 'T');
        form.h_End = dtISOLocaleEnd.substring(11,19);
      }),
      concatMap(() => this.svcLezioni.put(form))
    ).subscribe(
      res=>{
        //this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      err=>{
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      }
    );
  }


  checkDisponibilita (docenteID: number, dtCalendario: string, strH_INI: string, strH_END: string) {
    this.svcLezioni.listByDocenteAndOra (docenteID, dtCalendario, strH_INI, strH_END)
      .subscribe ( val => {
        return (val)
      }
      )
  }
  handleDrop (dropInfo: EventDropArg) {
    
    // if (this.checkDisponibilita(
    //       dropInfo.event.extendedProps.docenteID,
    //       dropInfo.event.extendedProps.dtCalendario,
    //       dropInfo.event.extendedProps.h_Ini,
    //       dropInfo.event.extendedProps.h_End,

    //       ))
    
    let form: CAL_Lezione;

    this.svcLezioni.get(dropInfo.event.id)
    .pipe (
      tap ( val   =>  {
        form = val;
        let dtISOLocaleStart = dropInfo.event.start!.toLocaleString('sv').replace(' ', 'T');
        form.dtCalendario = dtISOLocaleStart.substring(0,10);
        form.h_Ini = dtISOLocaleStart.substring(11,19);
        let dtISOLocaleEnd = dropInfo.event.end!.toLocaleString('sv').replace(' ', 'T');
        form.h_End = dtISOLocaleEnd.substring(11,19);
      }),
      concatMap(() => this.svcLezioni.put(form))
    ).subscribe(
      res=>{
        //this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      err=>{
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      }
    );

  }
  

}


