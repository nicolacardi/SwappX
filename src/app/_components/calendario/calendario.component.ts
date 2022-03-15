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

  @Input() idClasse!:                     number;
  @ViewChild('calendarDOM') calendarDOM!: FullCalendarComponent;

  toggleDocentiMaterie = "materie";
  Events: any[] = [];



  calendarOptions: CalendarOptions = {

    //PROPRIETA' BASE
    initialView:  'timeGridWeek',
    slotMinTime:  '08:00:00',
    slotMaxTime:  '16:00:00',
    height:       500,
    allDaySlot:   false,
    locale:       'it',
    locales:      [itLocale],
    themeSystem:  'bootstrap5',
    forceEventDuration : true,
    defaultTimedEventDuration : "01:00:00",
    expandRows: true,
    // weekends:     false,
    hiddenDays: [ 0 ],
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay,listWeek mostraDocenti,settings'
    },  

    customButtons: {
      mostraDocenti: {
        text: 'Docenti',
        click: this.mostraDocenti.bind(this, this.msgtest())
      },
      settings: {
        icon: 'settings-icon',
        click: this.openCalendarioUtils.bind(this)
      }

    },  

    //dayHeaderContent: { html: "<button></button>"},
    
    //PROPRIETA' DI PERMESSI
    editable:     true,                               //consente modifiche agli eventi presenti  
    selectable:   true,                               //consente di creare eventi

    //AZIONI
    select:       this.handleDateSelect.bind(this),   //quando si crea un evento...
    eventClick:   this.openDetail.bind(this), 
    eventDrop:    this.handleDrop.bind(this),
    eventResize:  this.handleResize.bind(this),
    //CARICAMENTO EVENTI
    //events: INITIAL_EVENTS,
    
//#region ***********TENTATIVI E TEST

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
    // eventDidMount: function(arg) {
    //   console.log (arg);
    //   arg.el.onclick = function() {
    //     //arg.el.style.backgroundColor = 'red'
    //     //arg.event.remove();
    //   }
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
    //eventContent: this.renderEventContent,
  //********************* */
    // eventClick: function (info) {
    //     console.log (info);
    // }
  //********************* */
    // eventClick: function(calEvent:any) {
    //   let tg = calEvent.jsEvent.target.id;
    //   tg.click(() => 
    // }
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




  
  constructor(
    private svcLezioni:       LezioniService,
    private _loadingService:  LoadingService,
    private _snackBar:        MatSnackBar,
    public _dialog:           MatDialog, 
    public appRef:            ApplicationRef



  ) { }



  msgtest() {

  }
  ngOnChanges() {
    if (this.idClasse != undefined) {
      this.loadData();
    }
  }
  ngOnInit(): void {

    
  }

  loadData () {
    let obsLezioni$: Observable<CAL_Lezione[]>;

    obsLezioni$= this.svcLezioni.listByClasseSezioneAnno(this.idClasse);
      const loadLezioni$ =this._loadingService.showLoaderUntilCompleted(obsLezioni$);
      loadLezioni$.subscribe(val => 
        {
          this.Events = val;
          this.calendarOptions.events = this.Events;
          // this.calendarOptions.eventContent =  function () { 
            
          //   let eventWrapper = document.createElement('a');
          //   eventWrapper.addEventListener("onclick", function () { console.log ("ciao")})

          //   let arrayOfDomNodes = [eventWrapper];
          //   return { domNodes: arrayOfDomNodes };
          // }
        }
        
      );
  }

  ngAfterViewInit(): void {
    // let buttons = document.querySelectorAll(".ilMioButton");
    // console.log("buttons presenti", buttons);
    // buttons.forEach( (btn) =>{
    //   btn.addEventListener("click", (e) => {
    //     console.log ('cucu');
    //     this.deleteEvent();
    //   });
    // })
  }


  openDetail(clickInfo: EventClickArg) {

    // PER CANCELLARE UN EVENTO:  clickInfo.event.remove();

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: {
        idLezione: clickInfo.event.id,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
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
      width: '500px',
      height: '500px',
      data: this.calendarDOM.getApi().getDate()
    };
    const dialogRef = this._dialog.open(CalendarioUtilsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => { 
        this.loadData(); 
      }
    );
  }


  renderEventContent(eventInfo:any, createElement: any) {
    //eventInfo gli passa automaticamente i contenuti dell'evento tramite .event._def.extendedProps.
    //così si riesce a rendere dinamico
    //let innerHtml;
    //if (eventInfo.event._def.extendedProps.imageUrl) {
     //innerHtml = eventInfo.event._def.title+"<img style='width:100px;' src='"+eventInfo.event._def.extendedProps.imageUrl+"'>";
     //return createElement = { html: '<div>'+innerHtml+'</div>' }
     //return createElement = { html: '<div>'+eventInfo.event._def.extendedProps.buttonMsg+'</div>' }
    //} else {
    //  return null
    //}
    return createElement = { html: '<button onclick="deleteEvent()"></button>' }
  }

  mostraDocenti () {
    if (this.toggleDocentiMaterie == 'materie') {
      this.toggleDocentiMaterie = 'docenti';
      this.calendarOptions!.customButtons!.mostraDocenti.text = "Lezioni"


      
      this.calendarOptions.eventContent = 
        //function(arg: any, $scope: any) {
        //$scope.anotherMethod;  //NON FUNZIONA MA LO RICONOSCE!+
        
        (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
        { 
          
            //show the time
            let timeText = document.createElement('div')
              timeText.className = "fc-event-time";
              timeText.innerHTML = arg.timeText;
            //include additional info
            let docenteText = document.createElement('i')
              docenteText.className = "fc-event-title";
              docenteText.innerHTML = arg.event.extendedProps.docente.persona.nome +  " " + arg.event.extendedProps.docente.persona.cognome;
            //include img/icon that should work as a button
            let img = document.createElement('img');
            if (arg.event.extendedProps.ckFirma == true) {
              img.src = '../../assets/sign_YES.svg';
            } else {
              img.src = '../../assets/sign_NO.svg';
            }
            img.className = "_iconFirma";
            

            img.addEventListener("click", (e: Event) => {
              e.stopPropagation();
              this.anotherMethod();
              
            })

            let arrayOfDomNodes = [ timeText, docenteText, img ]
            return { domNodes: arrayOfDomNodes }
          
        }




    } else {
      this.toggleDocentiMaterie = 'materie'
      delete this.calendarOptions.eventContent;
      this.calendarOptions!.customButtons!.mostraDocenti.text = "Docenti"
    } 
  }

  anotherMethod () {
    console.log ("fat-to");
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    //INSERIMENTO NUOVO EVENTO
    let dtStart: Date;
    let dtEnd: Date;
    dtStart = selectInfo.start;
    dtEnd = selectInfo.end;

    //https://stackoverflow.com/questions/12413243/javascript-date-format-like-iso-but-local
    console.log("toLocaleString(sv)", dtStart.toLocaleString('sv').replace(' ', 'T'));
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: {
        idLezione: 0,
        start: dtStart.toLocaleString('sv').replace(' ', 'T'),
        end: dtEnd.toLocaleString('sv').replace(' ', 'T'),
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

  handleDrop (dropInfo: EventDropArg) {

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


