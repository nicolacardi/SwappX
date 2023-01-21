import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';

//models
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { User } from 'src/app/_user/Users';

//components
import { ClassiSezioniAnniListComponent } from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { Utility } from '../../utilities/utility.component';

//services
import { DocenzeService } from '../../classi/docenze/docenze.service';
import { IscrizioniService } from '../../iscrizioni/iscrizioni.service';
import { JspdfService } from '../../utilities/jspdf/jspdf.service';
import { DocentiService } from '../docenti.service';
import { LezioniCalendarioComponent } from '../../lezioni/lezioni-calendario/lezioni-calendario.component';
import { PER_Docente } from 'src/app/_models/PER_Docente';

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
  
  public currUser!: User;
  
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
               private svcDocenti:                   DocentiService,
               private _navigationService:           NavigationService,
               public _dialog:                       MatDialog,
               private _jspdf:                       JspdfService,
               private actRoute:                     ActivatedRoute,
               private router:                       Router,        
               private _snackBar:                    MatSnackBar){
  }

  ngOnInit() {

    this.actRoute.queryParams.subscribe(
      params => {
        this.annoIDrouted = params['annoID'];     
        this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
    });

    //this._navigationService.passPage("docentiDashboard");

    this.currUser = Utility.getCurrentUser();
    //console.log("curruser: ", this.currUser)

    if(this.currUser.personaID != null && this.currUser.personaID != 0){
      this.svcDocenti.getByPersonaID(this.currUser.personaID).subscribe(
        res => this.docenteID = res.id,
        err => console.log("getDocenteBypersonaID- KO:", err)
      )
    }
  }
  
  //#region ----- ricezione emit -------
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
    //le classi ha bisogno di conoscere anche l'annoID per fare le proprie verifiche

  annoIdEmitted(annoID: number) {
    this.annoID = annoID;
  }

  classeSezioneAnnoIDEmitted(classeSezioneAnnoID: number) {
    this.classeSezioneAnnoID = classeSezioneAnnoID;
  }

  docenteIdEmitted(docenteId: number) {
    this.docenteID = docenteId;
  }

  iscrizioneIDEmitted(iscrizioneID: number) {
    this.iscrizioneID = iscrizioneID;
  }

  alunnoEmitted(alunno: ALU_Alunno) {
    this.alunno = alunno;
  }

  //#endregion

  selectedTabValue(event: any){
    //senza questo espediente non fa il primo render correttamente

    // if (this.tabGroup.selectedIndex == 1) {
    //   this.viewOrarioDocente.calendarDOM.getApi().render();
    //   this.viewOrarioDocente.loadData()

    // }
    
  }

}
