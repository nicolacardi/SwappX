import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import jsPDF from 'jspdf';

//components
import { AlunniListComponent } from '../../alunni/alunni-list/alunni-list.component';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogAddComponent } from '../dialog-add/dialog-add.component';

//services
import { JspdfService } from '../../utilities/jspdf/jspdf.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { ClassiSezioniAnniAlunniService } from '../classi-sezioni-anni-alunni.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';

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
  public idClasse!:           number;
  public idAnno!:             number;  
  isOpen = true;
//#enderegion

//#region ----- ViewChild Input Output -------
  @ViewChild(AlunniListComponent) alunniListComponent!: AlunniListComponent; 
  @Input () classeSezioneAnnoId!: number;
//#endregion

  constructor(
              //private svcClassiSezioniAnni:         ClassiSezioniAnniService,
              private svcClassiSezioniAnniAlunni:   ClassiSezioniAnniAlunniService,
              //private _loadingService:              LoadingService,
              private _navigationService:           NavigationService,
              public _dialog:                       MatDialog,
              private _jspdf:                       JspdfService
              ) { 
              }
  
  ngOnInit() {
    this._navigationService.passPage("classiDashboard");
  }

  mouseOver() {
    this.isOpen = false;
  }

  mouseOut() {
    this.isOpen = true;
  }


  addAlunnoToClasse() {

    if(this.idClasse<0) return;

    const dialogConfig : MatDialogConfig = {
      panelClass: 'app-full-bleed-dialog',
      width: '400px',
      minHeight: '300px',
      data: {titolo: "Aggiungi nuovo Alunno alla classe", 
              idAnno: this.idAnno,
              idClasse: this.idClasse}
    };

    const dialogRef = this._dialog.open(DialogAddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        result => {
          if(result == undefined){          
          this.alunniListComponent.loadData()
          }
    });
  }

  removeAlunnoFromClasse() {
    const objIdAlunniToRemove = this.alunniListComponent.getChecked();
    const selections = objIdAlunniToRemove.length;
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
            objIdAlunniToRemove.forEach(val=>{
              this.svcClassiSezioniAnniAlunni.deleteClasseSezioneAnnoAlunno(this.idClasse , val.id)
                .subscribe(()=>{
                    //console.log("classi-dashboard.component.ts - removeAlunnoFromClasse: iscrizione di "+val.id+ " a "+this.idClasse + " rimossa" ); 
                    this.alunniListComponent.loadData();
                    //this.alunniListComponent.resetSelections();
                })
            }); 
            //AS: spostato qua per evitare che faccia n refresh, solo che bisogna verificare la sync
            //this.alunniListComponent.loadData();
            this.alunniListComponent.resetSelections();
          }
      })
    }
  }

  creaPdf() {
    const tableHeaders = [['id', 'nome', 'cognome', "genere", "dtNascita"]];
    this._jspdf.creaPdf(this.alunniListComponent.matDataSource.data, tableHeaders);
  }

  promuovi() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "SEMPRE TROPPO CURIOSO", sottoTitolo: "La gatta frettolosa fece i gattini ciechi"}
    });
  }

  annoIdEmitted(annoId: number) {
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
    //le classi ha bisogno di conoscere anche l'idAnno per fare le proprie verifiche
    //console.log (annoId);
    this.idAnno = annoId;
  }

  classeIdEmitted(classeId: number) {
    console.log (classeId);
    this.idClasse = classeId;
  }

}