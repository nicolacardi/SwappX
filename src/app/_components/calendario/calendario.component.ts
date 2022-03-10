import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/angular';
import { INITIAL_EVENTS, createEventId } from './event.utils';
import { FullCalendarComponent } from '@fullcalendar/angular';//-->serve per il ViewChild
import itLocale from '@fullcalendar/core/locales/it';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

  @ViewChild('calendarDOM') calendarDOM!: FullCalendarComponent;


  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    locale: 'it',
    locales: [itLocale],
    weekends: false,
    themeSystem: 'bootstrap',
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay,listWeek'
    },     
    editable: true,
    selectable: true,
    select: this.handleDateSelect.bind(this),
    //eventClick: this.handleEventClick.bind(this),
    slotMinTime: '08:00:00',
    slotMaxTime: '17:00:00',
    allDaySlot: false,
    height: 500,
    events: INITIAL_EVENTS,
    //eventContent: { html: '<div><button>schiaccia il bottone</button></div>' }
    eventContent: this.renderEventContent,
    // views: {
    //   timeGridWeek: {  //questo modifica TUTTI gli eventi in questa vista
    //     eventContent: function (info) {
    //       let eventWrapper = document.createElement('div');
    //       eventWrapper.addEventListener("click",function(){ alert("Hello World!"); })
    //       eventWrapper.innerText = 'test dayGridWeek';

    //       var arrayOfDomNodes = [eventWrapper];
    //       console.log ("eventWrapper", eventWrapper);
    //       return { domNodes: arrayOfDomNodes };
    //     }
    //   },
    // },

  };

  renderEventContent(eventInfo:any, createElement: any) {
    
    //eventInfo gli passa automaticamente i contenuti dell'evento tramite .event._def.extendedProps.
    //così si riesce a rendere dinamico

    // var innerHtml;
    // if (eventInfo.event._def.extendedProps.imageUrl) {
    //  innerHtml = eventInfo.event._def.title+"<img style='width:100px;' src='"+eventInfo.event._def.extendedProps.imageUrl+"'>";
    //  return createElement = { html: '<div>'+innerHtml+'</div>' }
    // } else {
    //   return null
    // }
    return createElement = { html: 
     "<div><img class=\"iconaMenu\" src=\"../../assets/deleteWhite.svg\" onclick=\"alert(\'"+eventInfo.event._def.extendedProps.buttonMsg+"\')\"></div>"}
    


    
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

  deleteEvent (e: Event) {
    console.log ("deleteEvent")
  }

  mostraMsg(){
    console.log ("ciao");

  }

  handleDateSelect(selectInfo: DateSelectArg) {
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


  handleEventClick(clickInfo: EventClickArg) {
    // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    //   clickInfo.event.remove();
    // }
  }
  
  constructor() { }

  
  ngOnInit(): void {

  }

}
