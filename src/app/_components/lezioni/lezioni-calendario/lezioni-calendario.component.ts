import { ApplicationRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/angular';
import { FullCalendarComponent } from '@fullcalendar/angular';//-->serve per il ViewChild
import { EventResizeDoneArg } from '@fullcalendar/interaction';

import itLocale from '@fullcalendar/core/locales/it';
import { Observable, of } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

//components
import { LezioneComponent } from '../lezione-edit/lezione.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { LezioniUtilsComponent } from '../lezioni-utils/lezioni-utils.component';
import { Utility } from '../../utilities/utility.component';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { LezioniService } from '../lezioni.service';

//classes
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';


@Component({
  selector: 'app-lezioni-calendario',
  templateUrl: './lezioni-calendario.component.html',
  styleUrls: ['../lezioni.component.css']
})
export class LezioniCalendarioComponent implements OnInit {

//#region ----- Variabili -------
  toggleDocentiMaterie = "materie";
  Events: any[] = [];
  
  showWarn:           boolean = false;


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

    views: {
      timeGridDay: {  //questo modifica TUTTI gli eventi in questa vista
        eventContent: (event: any, element: any) => {
          { 

            console.log (event);
            //mostra l'ora
            let timeText = document.createElement('div');
            timeText.className = "fc-event-time";
            timeText.innerHTML = event.timeText;
            //include Info aggiuntive
            let titleText = document.createElement('div');
            titleText.className = "fc-event-title";
            titleText.innerHTML = '[<span class="fs10">Mat: </span><b>'
                +event.event._def.title +' '
                + '</b>] [<span class="fs10">Doc: </span><b>'
                + event.event._def.extendedProps.docente.persona.nome + ' '
                + event.event._def.extendedProps.docente.persona.cognome + ' '
                + '</b>] [<span class="fs10">Arg: </span>'
                + (event.event._def.extendedProps.argomento? event.event._def.extendedProps.argomento: "") + ' '
                + '] [<span class="fs10">Comp: </span>'
                + (event.event._def.extendedProps.compiti? event.event._def.extendedProps.compiti: "") + '] '
            
            //Aggiungo icona firma
            let img = document.createElement('img');
            if (event.event._def.extendedProps.ckFirma == true) 
              img.src = '../../assets/sign_YES.svg';
            else 
              img.src = '../../assets/sign_NO.svg';
            
            img.className = "_iconFirma";

            //Aggiungo icona epoca
            let img2 = document.createElement('img');
            if (event.event._def.extendedProps.ckEpoca == true) 
              img2.src = '../../assets/epoca_YES.svg';
            else 
              img2.src = '../../assets/epoca_NO.svg';
            
            img2.className = "_iconEpoca";


            let arrayOfDomNodes = [ timeText, titleText, img2, img];     //prepara il set di Nodes
            return { domNodes: arrayOfDomNodes }
        }
        }
      },
    },

    //dayHeaderContent: { html: "<button></button>"},
    

    //AZIONI
    select:       this.addEvento.bind(this),          //quando si crea un evento...
    eventClick:   this.openDetail.bind(this),         //quando si fa click su un evento esistente...
    eventDrop:    this.handleDrop.bind(this),         //quando si rilascia un evento che viene draggato...
    eventResize:  this.handleResize.bind(this),       //quando si fa il resize della durata di un evento...
  };

//#endregion

//#region ----- ViewChild Input Output -------
  @Input() idClasse!:                     number;
  @Input() idDocente!:                    number;
  @Input() dove!:                         string;
  @ViewChild('calendarDOM') calendarDOM!: FullCalendarComponent;
//#endregion
  
  constructor( private svcLezioni:       LezioniService,
               private _loadingService:  LoadingService,
               private _snackBar:        MatSnackBar,
               public _dialog:           MatDialog, 
               public appRef:            ApplicationRef ) {

  }


//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    if (this.idClasse != undefined  && this.dove != undefined) 
      this.loadData();
  }

  ngOnInit(){
  }

  loadData () {
    let obsLezioni$: Observable<CAL_Lezione[]>;
    this.showWarn = false;
    if (this.dove == "orario") {
      //se c'è un Docente selezionato allora filtro anche per lui
      if (this.idDocente != undefined && this.idDocente > 0) {
        obsLezioni$= this.svcLezioni.listByDocenteClasseSezioneAnno(this.idDocente, this.idClasse);
      } else {
        //se non c'è un docente seleziono non filtro anche per lui
        obsLezioni$= this.svcLezioni.listByClasseSezioneAnno(this.idClasse);
      }
    } else {
      //qui ("orario per Docente) non conta la classe ma solo l'IDDocente
      if (this.idDocente != undefined && this.idDocente > 0) {
        obsLezioni$= this.svcLezioni.listByDocente(this.idDocente);
      } else {
        this.showWarn = true;
        obsLezioni$= this.svcLezioni.listByDocente(0);
      }
    }

    const loadLezioni$ =this._loadingService.showLoaderUntilCompleted(obsLezioni$);
    loadLezioni$.subscribe(val =>   {
        this.Events = val;
        this.calendarOptions.events = this.Events;
      }
    );

    if (this.dove == "orario") {

      this.calendarOptions.customButtons = {
        mostraDocenti: {
          text: 'Mostra Docenti',
          click: this.mostraDocenti.bind(this),
        },
        settings: {
          icon: 'settings-icon',
          click: this.openLezioniUtils.bind(this)
        }
      }  

      this.calendarOptions.editable =             true;             //consente modifiche agli eventi presenti   :  da gestire sulla base del ruolo
      this.calendarOptions.selectable =           true;             //consente di creare eventi                 :  da gestire sulla base del ruolo
      this.calendarOptions.eventStartEditable =   true;             //consente di draggare eventi               :  da gestire sulla base del ruolo
      this.calendarOptions.eventDurationEditable =true;            //consente di modificare la lunghezza eventi:  da gestire sulla base del ruolo

      if (this.calendarOptions!.customButtons!.mostraDocenti.text == 'Mostra Lezioni') 
        this.setEventiDocenti();
      else 
        this.setEventiLezioni();

    } 
    else {

      this.calendarOptions.customButtons = {
        mostraDocenti: {
          text: 'Mostra Lezioni',
          click: this.mostraDocenti.bind(this),
        },
        settings: {
          icon: 'settings-icon',
          click: this.openLezioniUtils.bind(this)
        }
      }  

      this.calendarOptions.editable =             true;             //consente modifiche agli eventi presenti   :  da gestire sulla base del ruolo
      this.calendarOptions.selectable =           false;            //consente di creare eventi                 :  da gestire sulla base del ruolo
      this.calendarOptions.eventStartEditable =   false;            //consente di draggare eventi               :  da gestire sulla base del ruolo
      this.calendarOptions.eventDurationEditable =false;            //consente di modificare la lunghezza eventi:  da gestire sulla base del ruolo

      if (this.calendarOptions!.customButtons!.mostraDocenti.text == 'Mostra Lezioni')
        this.setEventiClassi();
      else 
        this.setEventiLezioni();
      
    }
  }

  setEventiLezioni() {
    this.calendarOptions.eventContent = (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
      { 
        //mostra l'ora
        let timeText = document.createElement('div');
        timeText.className = "fc-event-time";
        timeText.innerHTML = arg.timeText;
        //include Info aggiuntive
        let titleText = document.createElement('div');
        titleText.className = "fc-event-title";
        titleText.innerHTML = arg.event['title'];

        //Aggiungo icona firma
        let img = document.createElement('img');
        if (arg.event.extendedProps.ckFirma == true) 
          img.src = '../../assets/sign_YES.svg';
        else 
          img.src = '../../assets/sign_NO.svg';

        img.className = "_iconFirma";
        // img.addEventListener("click", (e: Event) => {
        //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
        //   this.anotherMethod();                                   //collega il metodo all'immagine
        // })

        //Aggiungo icona epoca
        let img2 = document.createElement('img');
        if (arg.event.extendedProps.ckEpoca == true) 
          img2.src = '../../assets/epoca_YES.svg';
        else 
          img2.src = '../../assets/epoca_NO.svg';
        
        img2.className = "_iconEpoca";
        img2.addEventListener("click", (e: Event) => {
          e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
          this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
        })

        let arrayOfDomNodes = [ timeText, titleText, img, img2];     //prepara il set di Nodes
        return { domNodes: arrayOfDomNodes }
    }
  }

  setEventiDocenti() {
    this.calendarOptions.eventContent =         
    (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
    { 
      //mostra l'ora
      let timeText = document.createElement('div');
        timeText.className = "fc-event-time";
        timeText.innerHTML = arg.timeText;
      //include Info aggiuntive
      let docenteText = document.createElement('i');
        docenteText.className = "fc-event-title";
        docenteText.innerHTML = arg.event.extendedProps.docente.persona.nome +  " " + arg.event.extendedProps.docente.persona.cognome;
      //Aggiungo icona firma
      let img = document.createElement('img');
      if (arg.event.extendedProps.ckFirma == true) 
        img.src = '../../assets/sign_YES.svg';
      else 
        img.src = '../../assets/sign_NO.svg';
      
      img.className = "_iconFirma";
  
      // img.addEventListener("click", (e: Event) => {
      //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
      //   this.anotherMethod();                                   //collega il metodo all'immagine
      // })

      //Aggiungo icona epoca
      let img2 = document.createElement('img');
      if (arg.event.extendedProps.ckEpoca == true) 
        img2.src = '../../assets/epoca_YES.svg';
      else 
        img2.src = '../../assets/epoca_NO.svg';
      
      img2.className = "_iconEpoca";
      img2.addEventListener("click", (e: Event) => {
        e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
        this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
      })

      let arrayOfDomNodes = [ timeText, docenteText, img, img2 ];     //prepara il set di Nodes
      return { domNodes: arrayOfDomNodes }
    }
  }

  setEventiClassi() {
    this.calendarOptions.eventContent =         
    (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
    { 
      //mostra l'ora
      let timeText = document.createElement('div');
        timeText.className = "fc-event-time";
        timeText.innerHTML = arg.timeText;
      //include Info aggiuntive
      let classeText = document.createElement('div');
        classeText.className = "fc-event-title";
        classeText.innerHTML =  
            arg.event.extendedProps.classeSezioneAnno.classeSezione.classe.descrizioneBreve + ' ' + 
            arg.event.extendedProps.classeSezioneAnno.classeSezione.sezione;
      //Aggiungo icona firma
      let img = document.createElement('img');
      if (arg.event.extendedProps.ckFirma == true) 
        img.src = '../../assets/sign_YES.svg';
      else 
        img.src = '../../assets/sign_NO.svg';
      
      img.className = "_iconFirma";
  
      // img.addEventListener("click", (e: Event) => {
      //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
      //   this.anotherMethod();                                   //collega il metodo all'immagine
      // })

      //Aggiungo icona epoca
      let img2 = document.createElement('img');
      if (arg.event.extendedProps.ckEpoca == true) 
        img2.src = '../../assets/epoca_YES.svg';
      else 
        img2.src = '../../assets/epoca_NO.svg';
      
      img2.className = "_iconEpoca";
      img2.addEventListener("click", (e: Event) => {
        e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
        this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
      })

      let arrayOfDomNodes = [ timeText, classeText, img, img2 ];     //prepara il set di Nodes
      return { domNodes: arrayOfDomNodes }
    }
  }

//#endregion

//#region ----- Add Edit Eventi -------

  openDetail(clickInfo: EventClickArg) {

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '900px',
      height: '500px',
      data: {
        idLezione: clickInfo.event.id,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        dtCalendario: clickInfo.event.extendedProps.dtCalendario,
        h_Ini: clickInfo.event.extendedProps.h_Ini,
        h_End: clickInfo.event.extendedProps.h_End,
        idClasseSezioneAnno: clickInfo.event.extendedProps.classeSezioneAnnoID,
        dove: this.dove
      }
    };

    const dialogRef = this._dialog.open(LezioneComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => { 
        this.loadData(); 
      }
    );
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
      width: '900px',
      height: '500px',
      data: {
        idLezione: 0,
        start: dtStart.toLocaleString('sv').replace(' ', 'T'),
        end: dtEnd.toLocaleString('sv').replace(' ', 'T'),
        dtCalendario: dtStart.toLocaleString('sv').replace(' ', 'T').substring(0,10),
        h_Ini: dtStart.toLocaleString('sv').replace(' ', 'T').substring(11,19),
        h_End: dtEnd.toLocaleString('sv').replace(' ', 'T').substring(11,19),
        idClasseSezioneAnno: this.idClasse,
        dove: this.dove
      }
    };
    const dialogRef = this._dialog.open(LezioneComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => { 
        this.loadData(); 
      }
    );
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); 
  }

  openLezioniUtils () {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '650px',
      height: '425px',
      data:  {
        start: this.calendarDOM.getApi().getDate(),
        idClasseSezioneAnno: this.idClasse
      }
    };
    const dialogRef = this._dialog.open(LezioniUtilsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => { 
        this.loadData(); 
      }
    );
  }

  mostraDocenti () {

    if (this.dove == 'orario') {
      if (this.calendarOptions!.customButtons!.mostraDocenti.text == 'Mostra Docenti') {
        this.calendarOptions!.customButtons!.mostraDocenti.text = "Mostra Lezioni"
        this.setEventiDocenti();
      } 
      else {
        this.calendarOptions!.customButtons!.mostraDocenti.text = "Mostra Docenti"
        this.setEventiLezioni();
      } 
    } else {
      if (this.calendarOptions!.customButtons!.mostraDocenti.text == 'Mostra Classi') {
        this.calendarOptions!.customButtons!.mostraDocenti.text = "Mostra Lezioni"
        this.setEventiClassi();
      } 
      else {
        this.calendarOptions!.customButtons!.mostraDocenti.text = "Mostra Classi"
        this.setEventiLezioni();
      } 
    }
  }

  toggleEpoca(idLezione: number) {
    if (this.dove == 'orario')
    this.svcLezioni.toggleEpoca(idLezione).subscribe(() => this.loadData());
  }

  anotherMethod () {
    console.log ("fat-to");
  }

  handleResize (resizeInfo: EventResizeDoneArg) {

    //let dt : Date | null   = resizeInfo.event.start;
    let dtCalendario =Utility.UT_FormatDate(resizeInfo.event.start);
    let strH_INI =Utility.UT_FormatHour(resizeInfo.event.start);
    let strH_END =Utility.UT_FormatHour(resizeInfo.event.end);
    let form: CAL_Lezione;

    const promise  = this.svcLezioni.listByDocenteAndOraOverlap (parseInt(resizeInfo.event.id), resizeInfo.event.extendedProps.docenteID, dtCalendario, strH_INI, strH_END)
      .toPromise();

    promise.then( 
      (val: CAL_Lezione[]) => {
        if (val.length > 0) {
          let strMsg = "il Maestro " + val[0].docente.persona.nome + " " + val[0].docente.persona.cognome + " \n è già impegnato in questo slot in ";
          val.forEach (x =>
            {strMsg = strMsg + "\n - " + x.classeSezioneAnno.classeSezione.classe.descrizione2 + ' ' + x.classeSezioneAnno.classeSezione.sezione;}
          )
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: strMsg}
          });
          resizeInfo.revert();
        }
        else {
          this.svcLezioni.get(resizeInfo.event.id)
          .pipe ( tap ( val   =>  {
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
      }
    )
  }

  handleDrop (dropInfo: EventDropArg) {
    
    //let dt : Date | null   = dropInfo.event.start;
    let dtCalendario =Utility.UT_FormatDate(dropInfo.event.start);
    let strH_INI =Utility.UT_FormatHour(dropInfo.event.start);
    let strH_END =Utility.UT_FormatHour(dropInfo.event.end);

    const promise  = this.svcLezioni.listByDocenteAndOraOverlap (parseInt(dropInfo.event.id), dropInfo.event.extendedProps.docenteID, dtCalendario, strH_INI, strH_END)
      .toPromise();

    let form: CAL_Lezione;
    promise.then( 
      (val: CAL_Lezione[]) => {
        if (val.length > 0) {
          let strMsg = "il Maestro " + val[0].docente.persona.nome + " " + val[0].docente.persona.cognome + " \n è già impegnato in questo slot in ";
          val.forEach (x =>
            {strMsg = strMsg + "\n - " + x.classeSezioneAnno.classeSezione.classe.descrizione2 + ' ' + x.classeSezioneAnno.classeSezione.sezione;}
          )
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: strMsg}
          });
          dropInfo.revert();
        }
        else {
          this.svcLezioni.get(dropInfo.event.id).pipe (
            tap ( val   =>  {
              form = val;
              form.dtCalendario = dtCalendario;
              form.h_Ini = strH_INI;
              form.h_End = strH_END;
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
    )
  }
}



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