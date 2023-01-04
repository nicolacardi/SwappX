import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

//models

//components
import { ClassiSezioniAnniListComponent } from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { DocenzeService } from '../../classi/docenze/docenze.service';
import { IscrizioniService } from '../../iscrizioni/iscrizioni.service';
import { JspdfService } from '../../utilities/jspdf/jspdf.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';

//services

@Component({
  selector: 'app-docenti-dashboard',
  templateUrl: './docenti-dashboard.component.html',
  styleUrls: ['../docenti.css']
})

export class DocentiDashboardComponent implements OnInit {

  //#region ----- Variabili -------

  public classeSezioneAnnoID!:  number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public annoID!:               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public docenteID!:            number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public iscrizioneID!:         number;   //valore ricevuto (emitted) dal child IscrizioniClasseList
  public alunno!:               ALU_Alunno;   //valore ricevuto (emitted) dal child IscrizioniClasseList

  public classeSezioneAnnoIDrouted!:        string;   //valore ricevuto (routed) dal ruoting
  public annoIDrouted!:         string;   //valore ricevuto (routed) dal ruoting
  isOpen = true;
  
  //#endregion
  
  //#region ----- ViewChild Input Output -------
  //@ViewChild(AlunniListComponent) alunniListComponent!: AlunniListComponent; 
  @ViewChild(ClassiSezioniAnniListComponent) viewClassiSezioniAnni!: ClassiSezioniAnniListComponent; 
  // @ViewChild(IscrizioniClasseListComponent) viewListIscrizioni!: IscrizioniClasseListComponent; 
  // @ViewChild(DocenzeListComponent) viewDocenzeList!: DocenzeListComponent; 
  // @ViewChild('orarioLezioniDOM') viewOrarioLezioni!: LezioniCalendarioComponent; 
  // @ViewChild('orarioDocenteDOM') viewOrarioDocente!: LezioniCalendarioComponent; 
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  //#endregion

  constructor( private svcIscrizioni:                IscrizioniService,
               private svcDocenze:                   DocenzeService,
               private _navigationService:           NavigationService,
               public _dialog:                       MatDialog,
               private _jspdf:                       JspdfService,
               private actRoute:                     ActivatedRoute,
               private router:                       Router,        
               private _snackBar:                    MatSnackBar){
  }

  ngOnInit(): void {

    this.actRoute.queryParams.subscribe(
      params => {
        this.annoIDrouted = params['annoID'];     
        this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
    });

    this._navigationService.passPage("docentiDashboard");


    //QUI!!!
    //recuperare docenteID : sul token ho personaID


    //impostarlo sulla combo (che deve essere read-only, siamo sul croscotto docente )

    
  }

  selectedTabValue(event: any){
    //senza questo espediente non fa il primo render correttamente
/*
    if (this.tabGroup.selectedIndex == 2) {
      this.viewOrarioLezioni.calendarDOM.getApi().render();
      this.viewOrarioLezioni.loadData();
    }
    if (this.tabGroup.selectedIndex == 3) {
      this.viewOrarioDocente.calendarDOM.getApi().render();
      this.viewOrarioDocente.loadData()

    }
    */
  }

  
//#region ----- ricezione emit -------
annoIdEmitted(annoID: number) {
  //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
  //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
  //le classi ha bisogno di conoscere anche l'annoID per fare le proprie verifiche
  this.annoID = annoID;
}

classeSezioneAnnoIDEmitted(classeSezioneAnnoID: number) {
  this.classeSezioneAnnoID = classeSezioneAnnoID;
}

docenteIdEmitted(docenteId: number) {
  //console.log("DEBUG- docenteEmitted: " + docenteId)

  this.docenteID = docenteId;
}

iscrizioneIDEmitted(iscrizioneID: number) {
  this.iscrizioneID = iscrizioneID;
}

alunnoEmitted(alunno: ALU_Alunno) {
  //console.log ("classi-dashboard emit alunno", alunno)
  this.alunno = alunno;
}

//#endregion
}
