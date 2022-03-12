import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/angular';
import { INITIAL_EVENTS, createEventId } from './event.utils';
import { FullCalendarComponent } from '@fullcalendar/angular';//-->serve per il ViewChild
import itLocale from '@fullcalendar/core/locales/it';
import { EventiService } from './eventi.service';
import { Observable } from 'rxjs';
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { LoadingService } from '../utilities/loading/loading.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { EventoComponent } from './evento/evento.component';


@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

  @Input() idClasse!:                     number;
  @ViewChild('calendarDOM') calendarDOM!: FullCalendarComponent;

  Events: any[] = [];
  calendarOptions: CalendarOptions = {

    //PROPRIETA' BASE
    initialView:  'timeGridWeek',
    slotMinTime:  '08:00:00',
    slotMaxTime:  '17:00:00',
    height:       500,
    allDaySlot:   false,
    locale:       'it',
    locales:      [itLocale],
    // weekends:     false,
    hiddenDays: [ 0 ],
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay,listWeek'
    },  
    
    //PROPRIETA' DI PERMESSI
    editable:     true,                               //consente modifiche agli eventi presenti  
    selectable:   true,                               //consente di creare eventi

    //AZIONI
    select:       this.handleDateSelect.bind(this),   //quando si crea un evento...
    eventClick:   this.openDetail.bind(this), 


    //CARICAMENTO EVENTI
    //events: INITIAL_EVENTS,
    
//#region ***********TENTATIVI E TEST

    // eventContent: function (event: any, element: any) {
    //   let eventWrapper = document.createElement('div');
    //   eventWrapper.addEventListener("click",function(event){ this.deleteEvent.bind(this) })
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

//https://stackoverflow.com/questions/56862498/in-angular-is-it-possible-to-apply-mattooltip-on-an-element-that-was-created-on/56880367#56880367
//   renderEventContentx (eventInfo:any): void {
//     let bodyPortalHost = new DomPortalHost(
//       eventInfo.el.querySelector('.fc-content'), // Target the element where you wish to append your component
//       this.componentFactoryResolver,
//       this.appRef,
//       this.injector);
//     let componentToAppend = new ComponentPortal(MyComponentThatHasTheElementWIthTooltip);
//     let referenceToAppendedComponent = bodyPortalHost.attach(componentToAppend);
// }

  deleteEvent () {
    console.log ("deleteEvent")
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    //INSERIMENTO NUOVO EVENTO
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }



  
  constructor(
    private svcEventi:        EventiService,
    private _loadingService:  LoadingService,
    public _dialog:           MatDialog, 

  ) { }

  ngOnChanges() {
    if (this.idClasse != undefined) {
      this.loadData();
    }
  }
  ngOnInit(): void {

    
  }

  loadData () {
    let obsLezioni$: Observable<CAL_Lezione[]>;

    obsLezioni$= this.svcEventi.listByClasseSezioneAnno(this.idClasse);
      const loadLezioni$ =this._loadingService.showLoaderUntilCompleted(obsLezioni$);
      loadLezioni$.subscribe(val => 
        {
          console.log ("val", val)
          console.log ("INITIAL_EVENTS", INITIAL_EVENTS);
          this.Events = val;
          this.calendarOptions.events = this.Events;
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

    // PER CANCELLARE UN EVENTO  clickInfo.event.remove();

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '650px',
      data: clickInfo.event.id
    };
    const dialogRef = this._dialog.open(EventoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => { 
        this.loadData(); 
      }
    );



  }
  

}
