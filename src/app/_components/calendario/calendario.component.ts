import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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

    //PROPRIETA' BASE
    initialView:  'timeGridWeek',
    slotMinTime:  '08:00:00',
    slotMaxTime:  '17:00:00',
    height:       500,
    allDaySlot:   false,
    locale:       'it',
    locales:      [itLocale],
    weekends:     false,
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
    
    
    //CARICAMENTO EVENTI
    events: INITIAL_EVENTS,
    eventContent: { html: "<button class='ilMioButton'>mybutton</button>" },

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


    eventDidMount: function(arg) {
      console.log (arg);
      arg.el.onclick = function() {
        //arg.el.style.backgroundColor = 'red'
        //arg.event.remove();
        
      }



    },

//così lancio una funzione su click dell'evento. Potrei ad es. poi identificare se si tratta di un click sull'evento
//o sul button

  // eventClick: function (info) {
  //   showdata(info.event.id);
  // }

    eventClick: this.handleEventClick.bind(this), 

  //   eventClick: function(event: any, element: any) {
  //     element.html(event.title + '<span class="removeEvent glyphicon glyphicon-trash pull-right" id="Delete"></span>');
  //  }

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
    //eventContent: this.renderEventContent,

    // eventClick: function (info) {
    //     console.log (info);
    // }

  


    // eventClick: function(calEvent:any) {
    //   let tg = calEvent.jsEvent.target.id;
    //   tg.click(() => 

    // }
    
    // views: {
    //   timeGridWeek: {  //questo modifica TUTTI gli eventi in questa vista
        
    //     eventContent: function (event: any, element: any) {
          
    //       let eventWrapper = document.createElement('div');
    //       eventWrapper.addEventListener("click",function(event){ console.log(event); })
        
    //       eventWrapper.innerText = 'test dayGridWeek';
    //       var arrayOfDomNodes = [eventWrapper];

    //       return { domNodes: arrayOfDomNodes };
    //     }
    //   },
    // },

  };

  renderEventContent(eventInfo:any, createElement: any) {
    
    //eventInfo gli passa automaticamente i contenuti dell'evento tramite .event._def.extendedProps.
    //così si riesce a rendere dinamico

    let innerHtml;
    //if (eventInfo.event._def.extendedProps.imageUrl) {
     //innerHtml = eventInfo.event._def.title+"<img style='width:100px;' src='"+eventInfo.event._def.extendedProps.imageUrl+"'>";
     //return createElement = { html: '<div>'+innerHtml+'</div>' }

     //return createElement = { html: '<div>'+eventInfo.event._def.extendedProps.buttonMsg+'</div>' }

     return createElement = { html: '<button onclick="deleteEvent()"></button>' }
    //} else {
    //  return null
    //}
    // return createElement = { html: 
    //  "<div><img class=\"iconaMenu\" src=\"../../assets/deleteWhite.svg\" onclick=\"alert(\'"+eventInfo.event._def.extendedProps.buttonMsg+"\')\"></div>"}

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
    //if (clickInfo.jsEvent.target)
    // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    //   clickInfo.event.remove();
    // }
  }
  
  constructor() { }

  
  ngOnInit(): void {

  }

  // ngAfterViewInit(): void {
    // let buttons = document.querySelectorAll(".ilMioButton");
    // console.log("buttons presenti", buttons);
    // buttons.forEach( (btn) =>{
    //   btn.addEventListener("click", (e) => {
    //     console.log ('cucu');
    //     this.deleteEvent();
    //   });
    // })

    
  // }



  

}
