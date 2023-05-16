//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog }                            from '@angular/material/dialog';
import { MatTabGroup }                          from '@angular/material/tabs';
import { ActivatedRoute }                       from '@angular/router';

//components
import { ClassiSezioniAnniListComponent }       from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { DocentiService }                       from '../docenti.service';
import { CLS_ClasseDocenteMateria }             from 'src/app/_models/CLS_ClasseDocenteMateria';


//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { User }                                 from 'src/app/_user/Users';
import { DocenzeService } from '../../classi/docenze/docenze.service';
import { Observable } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//#endregion
@Component({
  selector: 'app-docenti-dashboard',
  templateUrl: './docenti-dashboard.component.html',
  styleUrls: ['../docenti.css']
})

export class DocentiDashboardComponent implements OnInit {

//#region ----- Variabili ----------------------

  public classeSezioneAnnoID!:                  number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public annoID!:                               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public docenteID!:                            number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList

  public iscrizioneID!:                         number;   //valore ricevuto (emitted) dal child IscrizioniClasseList
  public alunno!:                               ALU_Alunno;   //valore ricevuto (emitted) dal child IscrizioniClasseList

  public classeSezioneAnnoIDrouted!:            string;   //valore ricevuto (routed) dal ruoting
  public annoIDrouted!:                         string;   //valore ricevuto (routed) dal ruoting
  isOpen = true;
  
  public currUser!:                             User;
  
  obsMaterie$!:                                 Observable<CLS_ClasseDocenteMateria[]>;

  form! :                                       UntypedFormGroup;
  public materiaID!:                            number;

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

  constructor( 
    private svcDocenti:                         DocentiService,
    public _dialog:                             MatDialog,
    private actRoute:                           ActivatedRoute,
    private svcDocenze:                         DocenzeService,
    private fb:                                 UntypedFormBuilder, 


  ){

    this.form = this.fb.group( {
      selectMaterieDocenteClasse: 0
    });
  }

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {

    this.actRoute.queryParams.subscribe(
      params => {
        this.annoIDrouted = params['annoID'];     
        this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
    });

    //this._navigationService.passPage("docentiDashboard");

    this.currUser = Utility.getCurrentUser();

    if(this.currUser.personaID != null && this.currUser.personaID != 0){
      this.svcDocenti.getByPersonaID(this.currUser.personaID).subscribe(
        res => {   
          if(res)
            this.docenteID = res.id;
          else
            this.docenteID = 0;
        },
        //err => console.log("getDocenteBypersonaID- KO:", err)
      )
    }

    this.form.controls.selectMaterieDocenteClasse.valueChanges.subscribe(
      sel => this.materiaID = sel );


  }
//#endregion

//#region ----- ricezione emit -------
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
    //le classi ha bisogno di conoscere anche l'annoID per fare le proprie verifiche

  annoIdEmitted(annoID: number) {
    this.annoID = annoID;
  }

  classeSezioneAnnoIDEmitted(classeSezioneAnnoID: number) {
    this.classeSezioneAnnoID = classeSezioneAnnoID;
        //estraggo le materie di questo docente in questa classe e le metto nella combo
    this.obsMaterie$ = this.svcDocenze.listByClasseSezioneAnnoDocente(classeSezioneAnnoID, this.docenteID);
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

//#region ----- Altri metodi ------------------

  selectedTabValue(event: any){
    //senza questo espediente non fa il primo render correttamente

    // if (this.tabGroup.selectedIndex == 1) {
    //   this.viewOrarioDocente.calendarDOM.getApi().render();
    //   this.viewOrarioDocente.loadData()

    // }
    
  }
  
//#endregion
}
