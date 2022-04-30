import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

//components
//import { AlunniListComponent } from '../../alunni/alunni-list/alunni-list.component';
import { IscrizioniClasseListComponent } from '../../iscrizioni/iscrizioni-classe-list/iscrizioni-classe-list.component';

import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { IscrizioniAddComponent } from '../../iscrizioni/iscrizioni-add/iscrizioni-add.component';

//services
import { JspdfService } from '../../utilities/jspdf/jspdf.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { IscrizioniService } from '../../iscrizioni/iscrizioni.service';
import { ClassiSezioniAnniListComponent } from '../../classi-sezioni-anni/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { IscrizioniClasseCalcoloComponent } from '../../iscrizioni/iscrizioni-classe-calcolo/iscrizioni-classe-calcolo.component';
import { DocenzeAddComponent } from '../docenze/docenze-add/docenze-add.component';
import { DocenzeListComponent } from '../docenze/docenze-list/docenze-list.component';
import { DocenzeService } from '../docenze/docenze.service';
import { LezioniCalendarioComponent } from '../../lezioni/lezioni-calendario/lezioni-calendario.component';
import { MatTabGroup } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-classi-dashboard',
//#region ----- animations -------
  // animations: [
  //   trigger('openCloseAlu', [
  //     // ...
  //     state('openAddAlu', style({
  //       transform: 'rotate(0)',
  //       backgroundImage: 'url("../../../../assets/plus.svg")',
  //     })),
  //     state('closedAddAlu', style({
  //       transform: 'rotate(-360deg)',
  //       color: "black",
  //       backgroundImage: 'url("../../../../assets/alunnoPlus.svg")',
  //     })),
  //     transition('openAddAlu => closedAddAlu', [
  //       animate('0.2s ease-in-out')
  //     ]),
  //     transition('closed => open', [
  //       animate('0.2s ease-in-out')
  //     ]),
  //   ]),
  //   trigger('openCloseDoc', [
  //     // ...
  //     state('openAddDoc', style({
  //       transform: 'rotate(0)',
  //       backgroundImage: 'url("../../../../assets/plus.svg")',
  //     })),
  //     state('closedAddDoc', style({
  //       transform: 'rotate(-360deg)',
  //       color: "black",
  //       backgroundImage: 'url("../../../../assets/docentePlus.svg")',
  //     })),
  //     transition('openAddDoc => closedAddDoc', [
  //       animate('0.2s ease-in-out')
  //     ]),
  //     transition('closed => open', [
  //       animate('0.2s ease-in-out')
  //     ]),
  //   ]),
  // ],
//#endregion
  templateUrl: './classi-dashboard.component.html',
  styleUrls: ['./../classi.css']
})

export class ClassiDashboardComponent implements OnInit {


//#region ----- Variabili -------
  public classeSezioneAnnoID!:  number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public annoID!:               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public docenteID!:            number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public iscrizioneID!:         number;   //valore ricevuto (emitted) dal child IscrizioniClasseList
  
  public classeSezioneAnnoIDrouted!:        string;   //valore ricevuto (routed) dal ruoting
  public annoIDrouted!:         string;   //valore ricevuto (routed) dal ruoting
  isOpen = true;
//#endregion

//#region ----- ViewChild Input Output -------
  //@ViewChild(AlunniListComponent) alunniListComponent!: AlunniListComponent; 
  @ViewChild(ClassiSezioniAnniListComponent) viewClassiSezioniAnni!: ClassiSezioniAnniListComponent; 
  @ViewChild(IscrizioniClasseListComponent) viewListIscrizioni!: IscrizioniClasseListComponent; 
  @ViewChild(DocenzeListComponent) viewDocenzeList!: DocenzeListComponent; 
  @ViewChild('orarioLezioniDOM') viewOrarioLezioni!: LezioniCalendarioComponent; 
  @ViewChild('orarioDocenteDOM') viewOrarioDocente!: LezioniCalendarioComponent; 
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  //@Input () classeSezioneAnnoId!: number;
//#endregion

  constructor(
    private svcIscrizioni:                IscrizioniService,
    private svcDocenze:                   DocenzeService,
    private _navigationService:           NavigationService,
    public _dialog:                       MatDialog,
    private _jspdf:                       JspdfService,
    private actRoute:                     ActivatedRoute,
    private router:                       Router,        
    private _snackBar:                    MatSnackBar
  
    ) {}

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    //annoID e classeSezioneAnnoID sono due queryParams che arrivano a classi-dashboard ad es. quando si naviga da ClassiSezioniAnniSummary con right click
    //ora vanno passati al Child ClassiSezioniAnniList perchè quello deve settarsi su questo anno e su questa classe
    //l'annoID ClassiSezioniAnniList lo prende dalla select che a sua volta lo prende dal local storage (anno di default)
    //bisogna fare in modo che annoID in arrivo da home component "vinca" rispetto all'annoID impostato per default

    this.actRoute.queryParams.subscribe(
      params => {
          this.annoIDrouted = params['annoID'];     
          this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
    });


    this._navigationService.passPage("classiDashboard");
  }
//#endregion

//#region ----- altri metodi-------
  mouseOver() {
    this.isOpen = false;
  }

  mouseOut() {
    this.isOpen = true;
  }



  creaPdfIscrizioni() {
    //elenco i campi da tenere
    let fieldsToKeep = ['alunno.nome', 'alunno.cognome', 'alunno.email', 'alunno.telefono', 'alunno.dtNascita'];
    //elenco i nomi delle colonne
    let columnsNames = [['nome', 'cognome', 'email', 'telefono', 'nato il']];
    this._jspdf.downloadPdf(
      this.viewListIscrizioni.matDataSource.data, 
      columnsNames,
      fieldsToKeep,
      "Classe "+ this.viewListIscrizioni.classeSezioneAnno.classeSezione.classe.descrizione2+" "+this.viewListIscrizioni.classeSezioneAnno.classeSezione.sezione,
       "ListaIscrizioni");

     this._jspdf.downloadPdf(
      this.viewListIscrizioni.matDataSource.data, 
      columnsNames,
      fieldsToKeep,
      "Classe "+ this.viewListIscrizioni.classeSezioneAnno.classeSezione.classe.descrizione2+" "+this.viewListIscrizioni.classeSezioneAnno.classeSezione.sezione,
       "ListaIscrizioni");

  }

  creaPdfDocenze() {
    //elenco i campi da tenere
    let fieldsToKeep = ['materia.descrizione', 'docente.persona.nome', 'docente.persona.cognome'];
    //elenco i nomi delle colonne
    let columnsNames = [['materia', 'Nome Docente', 'Cognome Docente']];
    this._jspdf.downloadPdf(
      this.viewDocenzeList.matDataSource.data,
      columnsNames,
      fieldsToKeep,
      "Docenti Classe "+ this.viewDocenzeList.classeSezioneAnno.classeSezione.classe.descrizione2+" "+this.viewDocenzeList.classeSezioneAnno.classeSezione.sezione,
      "ListaDocenze");
  }


  promuovi() {

    if (this.viewListIscrizioni.getChecked().length == 0) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Selezionare almeno un alunno da promuovere"}
      });
      return;
    }
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '300px',
      height: '335px',
      data: {
        annoID:               this.annoID,
        classeSezioneAnno:    this.viewClassiSezioniAnni.classeSezioneAnno,
        classeSezioneAnnoID:  this.classeSezioneAnnoID,
        arrAlunniChecked:     this.viewListIscrizioni.getChecked(),

      }
    };

    const dialogRef = this._dialog.open(IscrizioniClasseCalcoloComponent, dialogConfig);

  }
//#endregion

//#region ----- add/remove to/from Classe-------

  addAlunnoToClasse() {
    if(this.classeSezioneAnnoID<0) return;

    const dialogConfig : MatDialogConfig = {
      panelClass: 'app-full-bleed-dialog',
      width: '400px',
      minHeight: '300px',
      data: {titolo: "Iscrivi alunno alla classe", 
              annoID:   this.annoID,
              classeSezioneAnnoID: this.classeSezioneAnnoID}
    };

    const dialogRef = this._dialog.open(IscrizioniAddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        result => {
          if(result == undefined){          
          this.viewListIscrizioni.loadData()
          }
    });
  }

  addDocenteToClasse() {
    if(this.classeSezioneAnnoID<0) return;

    const dialogConfig : MatDialogConfig = {
      panelClass: 'app-full-bleed-dialog',
      width: '400px',
      minHeight: '300px',
      data: {titolo: "Iscrivi alunno alla classe", 
              annoID:   this.annoID,
              classeSezioneAnnoID: this.classeSezioneAnnoID}
    };

    const dialogRef = this._dialog.open(DocenzeAddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        result => {
          if(result == undefined)          
            this.viewDocenzeList.loadData()
    });
  }


  removeAlunnoFromClasse() {
    const objIdToRemove = this.viewListIscrizioni.getChecked();

    const selections = objIdToRemove.length;
    if (selections <= 0) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Selezionare almeno un alunno da cancellare"}
      });
    }
    else{

      const dialogRef = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Si stanno cancellando le iscrizioni di "+selections+" alunni alla classe. Continuare?"}
      });
      dialogRef.afterClosed().subscribe(
        async result => {
          if(!result) {
            return; 
          } else {
            // objIdToRemove.forEach(val=>{
              
            //   this.svcIscrizioni.delete(val.id)
            //     .subscribe(()=>{
            //     })
            // }); 
            //per ragioni di sincronia (aggiornamento classiSezioniAnniList dopo il loop) usiamo la Promise()
            for (const element of objIdToRemove) {
              // await this.svcIscrizioni.delete(element.id)
              // .toPromise();
              this.svcIscrizioni.delete(element.id).subscribe(
                res=>{},
                err=>{
                  console.log ("err",err);
                  this._snackBar.openFromComponent(SnackbarComponent, {data: err, panelClass: ['red-snackbar']});
                }

              );
            }

            // let tmpclicked = this.viewClassiSezioniAnni.classeSezioneAnnoID;
            // console.log (tmpclicked);
            this.viewClassiSezioniAnni.loadData()
            // this.viewClassiSezioniAnni.rowclicked(tmpclicked.toString());
            
            this.router.navigate(['/classi-dashboard'], { queryParams: { annoID: this.annoID, classeSezioneAnnoID: this.classeSezioneAnnoID } });

            this.viewListIscrizioni.resetSelections();
            this.viewListIscrizioni.loadData();

          }
      })
    }
  }

  removeDocenteFromClasse() {
    const objIdToRemove = this.viewDocenzeList.getChecked();

    const selections = objIdToRemove.length;
    if (selections <= 0) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Selezionare almeno una docenza da cancellare"}
      });
    }
    else{

      const dialogRef = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Si stanno cancellando "+selections+" docenze dalla classe. Continuare?"}
      });
      dialogRef.afterClosed().subscribe(
        async result => {
          if(!result) {
            return; 
          } else {
            // objIdToRemove.forEach(val=>{
              
            //   this.svcIscrizioni.delete(val.id)
            //     .subscribe(()=>{
            //     })
            // }); 
            //per ragioni di sincronia (aggiornamento classiSezioniAnniList dopo il loop) usiamo la Promise()
            for (const element of objIdToRemove) {
              await this.svcDocenze.delete(element.id)
              .toPromise();
            }

            this.viewDocenzeList.loadData()
            
            this.router.navigate(['/classi-dashboard'], { queryParams: { annoID: this.annoID, classeSezioneAnnoID: this.classeSezioneAnnoID } });

            this.viewDocenzeList.resetSelections();
            this.viewDocenzeList.loadData();
          }
      })
    }
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
  }

  docenteIdEmitted(docenteId: number) {
    this.docenteID = docenteId;
  }

  iscrizioneIdEmitted(iscrizioneId: number) {
    this.iscrizioneID = iscrizioneId;
  }

  //#endregion
  


  selectedTabValue(event: any){
    //senza questo espediente non fa il primo render correttamente

    if (this.tabGroup.selectedIndex == 2) {
      this.viewOrarioLezioni.calendarDOM.getApi().render();
      this.viewOrarioLezioni.loadData();
    }
    if (this.tabGroup.selectedIndex == 3) {
      this.viewOrarioDocente.calendarDOM.getApi().render();
      this.viewOrarioDocente.loadData()

    }

  }








}