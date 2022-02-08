import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import jsPDF from 'jspdf';
import { ActivatedRoute, Router } from '@angular/router';

//components
//import { AlunniListComponent } from '../../alunni/alunni-list/alunni-list.component';
import { IscrizioniClasseListComponent } from '../iscrizioni-classe-list/iscrizioni-classe-list.component';

import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { IscrizioniAddComponent } from '../iscrizioni-add/iscrizioni-add.component';

//services
import { JspdfService } from '../../utilities/jspdf/jspdf.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { IscrizioniService } from '../iscrizioni.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { ClassiSezioniAnniListComponent } from '../classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { IscrizioniClasseCalcoloComponent } from '../iscrizioni-classe-calcolo/iscrizioni-classe-calcolo.component';


@Component({
  selector: 'app-classi-dashboard',
  animations: [
    trigger('openClose', [
      // ...
      state('open', style({
        transform: 'rotate(0)',
        backgroundImage: 'url("../../../../assets/plus.svg")',
      })),
      state('closed', style({
        transform: 'rotate(-360deg)',
        color: "black",
        backgroundImage: 'url("../../../../assets/alunnoPlus.svg")',
      })),
      transition('open => closed', [
        animate('0.2s ease-in-out')
      ]),
      transition('closed => open', [
        animate('0.2s ease-in-out')
      ]),
    ]),
  ],
  templateUrl: './classi-dashboard.component.html',
  styleUrls: ['./../classi.css']
})

export class ClassiDashboardComponent implements OnInit {

//#region ----- Variabili -------
  public idClasse!:             number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public idAnno!:               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public idClasseInput!:        string;   //valore ricevuto (routed) dal ruoting
  public idAnnoInput!:          string;   //valore ricevuto (routed) dal ruoting
  isOpen = true;
//#endregion

//#region ----- ViewChild Input Output -------
  //@ViewChild(AlunniListComponent) alunniListComponent!: AlunniListComponent; 
  @ViewChild(IscrizioniClasseListComponent) viewListIscrizioni!: IscrizioniClasseListComponent; 
  @Input () classeSezioneAnnoId!: number;
//#endregion

  constructor(
              //private svcClassiSezioniAnni:         ClassiSezioniAnniService,
              private svcIscrizioni:                IscrizioniService,
              //private _loadingService:              LoadingService,
              private _navigationService:           NavigationService,
              public _dialog:                       MatDialog,
              private _jspdf:                       JspdfService,
              private actRoute:                      ActivatedRoute,
              private router:                        Router          ) { 
              }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    //idAnno e idClasse sono due queryParams che arrivano a classi-dashboard ad es. quando si naviga da ClassiSezioniAnniSummary con right click
    //ora vanno passati al Child ClassiSezioniAnniList perchè quello deve settarsi su questo anno e su questa classe
    //l'idAnno ClassiSezioniAnniList lo rpende dalla select che a sua volta lo prende dal local storage (anno di default)
    //bisogna fare in modo che idAnno in arrivo da home component "vinca" rispetto all'idAnno impostato per default

    this.actRoute.queryParams.subscribe(
      params => {
          this.idAnnoInput = params['idAnno'];     
          this.idClasseInput = params['idclasseSezioneAnno'];  
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

  creaPdf() {
    const tableHeaders = [['id', 'nome', 'cognome', "genere", "dtNascita"]];
    this._jspdf.creaPdf(this.viewListIscrizioni.matDataSource.data, tableHeaders);
  }

  promuovi() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '680px',
      data: {
        idAnno:                 this.idAnno,
        idClasseSezioneAnno:  this.idClasse,
        arrAlunniChecked:     this.viewListIscrizioni.getChecked(),

      }
    };

    const dialogRef = this._dialog.open(IscrizioniClasseCalcoloComponent, dialogConfig);

  }
//#endregion

//#region ----- add/remove to/from Classe-------

  addAlunnoToClasse() {
    console.log ("this.idAnno", this.idAnno);
    if(this.idClasse<0) return;

    const dialogConfig : MatDialogConfig = {
      panelClass: 'app-full-bleed-dialog',
      width: '400px',
      minHeight: '300px',
      data: {titolo: "Iscrivi alunno alla classe", 
              idAnno: this.idAnno,
              idClasse: this.idClasse}
    };

    const dialogRef = this._dialog.open(IscrizioniAddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        result => {
          if(result == undefined){          
          this.viewListIscrizioni.loadData()
          }
    });
  }

  removeAlunnoFromClasse() {
    //const objIdAlunniToRemove = this.alunniListComponent.getChecked();
    const objIdToRemove = this.viewListIscrizioni.getChecked();

    const selections = objIdToRemove.length;
    if (selections <= 0) {
      //AS: mettere un messagebox "Selezionare almeno un elemento da cancellare"  ?
    }
    else{
    //if (selections != 0) {
      const dialogRef = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Si stanno cancellando le iscrizioni di "+selections+" alunni alla classe. Continuare?"}
      });
      dialogRef.afterClosed().subscribe(
        result => {
          if(!result) {
            return; 
          } else {
            objIdToRemove.forEach(val=>{
              //this.svcIscrizioni.delete(this.idClasse , val.id)
              this.svcIscrizioni.delete(val.id)
                .subscribe(()=>{
                    //console.log("classi-dashboard.component.ts - removeAlunnoFromClasse: iscrizione di "+val.id+ " a "+this.idClasse + " rimossa" ); 
                    //this.alunniListComponent.loadData();
                    this.viewListIscrizioni.loadData();
                })
            }); 
            //AS: spostato qua per evitare che faccia n refresh, solo che bisogna verificare la sync
            //this.alunniListComponent.loadData();
            //this.alunniListComponent.resetSelections();
            this.viewListIscrizioni.resetSelections();
          }
      })
    }
  }
//#endregion

//#region ----- ricezione emit -------
  annoIdEmitted(annoId: number) {
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
    //le classi ha bisogno di conoscere anche l'idAnno per fare le proprie verifiche
    
    this.idAnno = annoId;
  }

  classeIdEmitted(classeId: number) {
    this.idClasse = classeId;
  }
//#endregion
  
}