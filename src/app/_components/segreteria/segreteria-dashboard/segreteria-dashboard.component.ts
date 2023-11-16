//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { ActivatedRoute, Router }               from '@angular/router';
import { MatTabGroup }                          from '@angular/material/tabs';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatDrawer }                            from '@angular/material/sidenav';


//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';

import { IscrizioniClasseListComponent }        from '../../iscrizioni/iscrizioni-classe-list/iscrizioni-classe-list.component';
import { IscrizioniAddComponent }               from '../../iscrizioni/iscrizioni-add/iscrizioni-add.component';
import { LezioniCalendarioComponent }           from '../../lezioni/lezioni-calendario/lezioni-calendario.component';
import { DocenzeAddComponent }                  from '../../docenze/docenze-add/docenze-add.component';
import { DocenzeListComponent }                 from '../../docenze/docenze-list/docenze-list.component';
import { ClassiSezioniAnniListComponent }       from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { IscrizioniClasseCalcoloComponent }     from '../../iscrizioni/iscrizioni-classe-calcolo/iscrizioni-classe-calcolo.component';

//services
import { JspdfService }                         from '../../utilities/jspdf/jspdf.service';
import { NavigationService }                    from '../../utilities/navigation/navigation.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { DocenzeService }                       from '../../docenze/docenze.service';
import { ClassiSezioniAnniService }             from '../../classi/classi-sezioni-anni.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { CLS_ClasseSezioneAnno }                from 'src/app/_models/CLS_ClasseSezioneAnno';

//#endregion

@Component({
  selector: 'app-segreteria-dashboard',
  templateUrl: './segreteria-dashboard.component.html',
  styleUrls: ['../segreteria.css']
})

export class SegreteriaDashboardComponent implements OnInit {

//#region ----- Variabili ----------------------

  public classeSezioneAnnoID!:                  number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public classeSezioneAnno!:                    CLS_ClasseSezioneAnno;

  public annoID!:                               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public docenteID!:                            number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public iscrizioneID!:                         number;   //valore ricevuto (emitted) dal child IscrizioniClasseList
  public alunno!:                               ALU_Alunno;   //valore ricevuto (emitted) dal child IscrizioniClasseList

  public classeSezioneAnnoIDrouted!:            string;   //valore ricevuto (routed) dal routing
  public annoIDrouted!:                         string;   //valore ricevuto (routed) dal routing

//#endregion

//#region ----- ViewChild Input Output -------

//@ViewChild(AlunniListComponent) alunniListComponent!: AlunniListComponent; 
  //@ViewChild(ClassiSezioniAnniListComponent) viewClassiSezioniAnni!: ClassiSezioniAnniListComponent; 
  @ViewChild(IscrizioniClasseListComponent) viewListIscrizioni!: IscrizioniClasseListComponent; 
  //@ViewChild(DocenzeListComponent) viewDocenzeList!: DocenzeListComponent; 
  //@ViewChild('orarioLezioniDOM') viewOrarioLezioni!: LezioniCalendarioComponent; 
  //@ViewChild('orarioDocenteDOM') viewOrarioDocente!: LezioniCalendarioComponent; 
  //@ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  //@ViewChild('drawer') drawerClassi!: MatDrawer;
  //#endregion

  constructor(private svcIscrizioni:            IscrizioniService,
              private svcDocenze:               DocenzeService,
              private svcClassiSezioniAnni:     ClassiSezioniAnniService,
              private _navigationService:       NavigationService,
              public _dialog:                   MatDialog,
              private _jspdf:                   JspdfService,
              private actRoute:                 ActivatedRoute,
              private router:                   Router,        
              private _snackBar:                MatSnackBar ) {
    
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    //annoID e classeSezioneAnnoID sono due queryParams che arrivano a coordinatore-dashboard ad es. quando si naviga da ClassiSezioniAnniSummary con right click
    //ora vanno passati al Child ClassiSezioniAnniList perchè quello deve settarsi su questo anno e su questa classe
    //l'annoID ClassiSezioniAnniList lo prende dalla select che a sua volta lo prende dal local storage (anno di default)
    //bisogna fare in modo che annoID in arrivo da home component "vinca" rispetto all'annoID impostato per default
    this.actRoute.queryParams.subscribe(
      params => {
        this.annoIDrouted = params['annoID'];     
        this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
    });

    this._navigationService.passPage("coordinatoreDashboard");  //A cosa serve??
  }
//#endregion



//#region ----- ricezione emit -------
  annoIdEmitted(annoID: number) {
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
    //le classi ha bisogno di conoscere anche l'annoID per fare le proprie verifiche
    this.annoID = annoID;
  }

  classeSezioneAnnoIDEmitted(classeSezioneAnnoID: number) {

    this.classeSezioneAnnoID = classeSezioneAnnoID;
    
    if(this.classeSezioneAnnoID >0){
      //per poter mostrare il docente e la classe...
      this.svcClassiSezioniAnni.get(this.classeSezioneAnnoID).subscribe(
        csa => this.classeSezioneAnno = csa 
      );
      
    }

    
  }


  iscrizioneIDEmitted(iscrizioneID: number) {
    this.iscrizioneID = iscrizioneID;
  }

  alunnoEmitted(alunno: ALU_Alunno) {
    this.alunno = alunno;
  }

  PubblicaPagelle() {
    console.log(this.viewListIscrizioni.getChecked());
    this.viewListIscrizioni.getChecked().forEach(element => {     
      //ora deve fare il base64 di CIASCUNO e ASPETTARLO!    
      
      
      this.viewListIscrizioni.selection.toggle(element);
      //crea l'array di icone di fine procedura
      let arrEndedIcons = this.viewListIscrizioni.endedIcons.toArray();
      //imposta l'icona che ha id = "endedIcon_idDellaClasse" a visibility= visible
      (arrEndedIcons.find(x=>x.nativeElement.id=="endedIcon_"+element.id)?.nativeElement as HTMLElement).style.visibility = "visible";
      (arrEndedIcons.find(x=>x.nativeElement.id=="endedIcon_"+element.id)?.nativeElement as HTMLElement).style.opacity = "1";
    }); 
  }

  //#endregion
}