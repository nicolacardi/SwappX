import { animate, state, style, transition, trigger } from '@angular/animations';
import { NONE_TYPE } from '@angular/compiler';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import { fromEvent, Observable } from 'rxjs';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { AlunniListComponent } from '../../alunni/alunni-list/alunni-list.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { FiltriService } from '../../utilities/filtri/filtri.service';
import { JspdfService } from '../../utilities/jspdf/jspdf.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiSezioniAnniAlunniService } from '../classi-sezioni-anni-alunni.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { DialogAddComponent } from '../dialog-add/dialog-add.component';

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

export class ClassiDashboardComponent implements OnInit, AfterViewInit {
  
  public idClasse!:           number;
  public idAnnoScolastico!:   number;

  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnno>();
  
  isOpen = true;
  selectedRowIndex = -1;
  form! :                     FormGroup;
  showChild:                  boolean = true;

  displayedColumns: string[] =  [
                                "descrizione",
                                "sezione"
                                ];

  menuTopLeftPosition =  {x: '0', y: '0'} 
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
  @ViewChild('selectAnnoScolastico') selectAnnoScolastico!: MatSelect; 
  @ViewChild(AlunniListComponent) alunnilist!: AlunniListComponent; 

  constructor(private fb:                           FormBuilder, 
              private svcClassiSezioniAnni:         ClassiSezioniAnniService,
              private svcClassiSezioniAnniAlunni:   ClassiSezioniAnniAlunniService,
              private _loadingService:              LoadingService,
              private _filtriService:               FiltriService,
              public _dialog:                       MatDialog,
              private _jspdf:                       JspdfService
              ) { 
                this.form = this.fb.group({
                  selectAnnoScolastico:   [2]
                })
              }
  


  ngOnInit(): void {
    this.refresh(2);
    this.form.controls['selectAnnoScolastico'].valueChanges
    .subscribe(val => {
      this.refresh(val);
      //console.log("classi-dahsboard.component.ts - selectAnnoScolastico.valueChanges : ", val);
    })

    this._filtriService.passPage("classiDashboard");
  }

  ngAfterViewInit () {
    //this._filtriService.passPage("classiDashboard");
  }

  refresh (val :number) {
    let obsClassi$: Observable<CLS_ClasseSezioneAnno[]>;
    obsClassi$= this.svcClassiSezioniAnni.loadClassiByAnnoScolastico(val);
    const loadClassi$ =this._loadingService.showLoaderUntilCompleted(obsClassi$);
    loadClassi$.subscribe(val => 
      {
        this.matDataSource.data = val;
        this.rowclicked(this.matDataSource.data[0]); //seleziona per default la prima riga NON FUNZIONA SEMPRE
      }
    );
  }

  mouseOver() {
    this.isOpen = false;
  }

  mouseOut() {
    this.isOpen = true;
  }

  rowclicked(val: CLS_ClasseSezioneAnno ){
    if(val!= undefined){
      this.idClasse = val.id; 
      this.selectedRowIndex = val.id;
    }
    else
    this.idClasse = -1; 
    this.selectedRowIndex = -1;
  }

  addAlunnoToClasse() {

    if(this.idClasse<0) return;     //AS: fix per evitare errore nel caso non ci sia una classe selezionata

    //dialogConfig.disableClose = true; //lo farebbe non chiudibile cliccando altrove
    const dialogConfig : MatDialogConfig = {
      panelClass: 'app-full-bleed-dialog',
      width: '400px',
      minHeight: '300px',
      data: {titolo: "Aggiungi nuovo Alunno alla classe", 
              idAnno: this.form.controls['selectAnnoScolastico'].value,
              idClasse: this.idClasse}
    };

    const dialogRef = this._dialog.open(DialogAddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        result => {
          if(result == undefined){        //AS: non so perchè ma la dialog restituisce undefined se faccio save, stringa vuota se annullo, ma così almeno non fa refresh se annullo

          //qui bisogna dire NON alla parte di sx ma alla alunniList che è tempo di fare refresh
          //questo avviene automaticamente quando si fa clic sulla riga, ma non funziona in questo caso con 
          //this.rowclicked(this.matDataSource.data[0]);
          //in quanto sto continuando a passare lo stesso valore, non sto cambiando valore: serve un trigger di refresh di alunnilist
          //this.idClasse = this.selectedRowIndex
          //this.idClasse = 0;
          //this.idClasse = this.selectedRowIndex
          //setTimeout( () => { this.idClasse = this.selectedRowIndex }, 100 );
          // this.showChild = false;
          
          this.alunnilist.refresh()
          //   setTimeout(() => {
          //      this.showChild = true
          //    }, 100);
          //this.alunnilist.refresh(); //NON FUNZIONA NEMMENO QUESTO!!!
          //this.idClasse = 17;
          //this.refresh(this.form.value.selectAnnoScolastico);
          //this.matDataSource.data = this.matDataSource.data;
          //this.idClasse = 16;
          //this.rowclicked(16);
          //this.rowclicked(this.matDataSource.data[0]);
          //this.form.controls['selectAnnoScolastico'].setValue(2);
          //this.refresh(this.form.value.selectAnnoScolastico); //PARTE MA NON FA IL SUO LAVORO
          //this.matDataSource.data = this.matDataSource.data;
          }
    });
  }

  removeAlunnoFromClasse() {
    const objIdAlunniToRemove = this.alunnilist.getChecked();
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
                    //this.alunnilist.refresh();
                    //this.alunnilist.resetSelections();
                })
            }); 
            //AS: spostato qua per evitare che faccia n refresh, solo che bisogna verificare la sync
            this.alunnilist.refresh();
            this.alunnilist.resetSelections();
          }
      })
    }
  }

  creaPdf() {
    const tableHeaders = [['id', 'nome', 'cognome', "genere", "dtNascita"]];
    this._jspdf.creaPdf(this.alunnilist.matDataSource.data, tableHeaders);
  }
}