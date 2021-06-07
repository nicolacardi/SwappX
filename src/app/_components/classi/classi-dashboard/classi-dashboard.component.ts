import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { fromEvent, Observable } from 'rxjs';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { FiltriService } from '../../utilities/filtri/filtri.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { DialogAddComponent } from '../dialog-add/dialog-add.component';

@Component({
  selector: 'app-classi-dashboard',
  templateUrl: './classi-dashboard.component.html',
  styleUrls: ['./classi-dashboard.component.css']
})
export class ClassiDashboardComponent implements OnInit, AfterViewInit {

  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnno>();
  public idClasse!:        number;
  //public idClasse :        number = 1;
  selectedRowIndex = -1;
  form! :                     FormGroup;

  displayedColumns: string[] =  [
                                "classeSezione.classe.descrizione2",
                                "classeSezione.sezione"
                                ];

  public idAnnoScolastico!: number;
  menuTopLeftPosition =  {x: '0', y: '0'} 
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
  @ViewChild('selectAnnoScolastico') selectAnnoScolastico!: MatSelect; 

  constructor(private fb:                           FormBuilder, 
              private svcClassiSezioniAnni:         ClassiSezioniAnniService,
              private _loadingService:              LoadingService,
              private _filtriService:               FiltriService,
              public _dialog:                       MatDialog 
              
              ) { 

                this.form = this.fb.group({
                  selectAnnoScolastico:   [2]
                })
              }

  ngOnInit(): void {
    
    this.refresh(2);
    this.form.controls['selectAnnoScolastico'].valueChanges
    .subscribe(val => {this.refresh(val);
      console.log("classi-dahsboard.component.ts - selectAnnoScolastico.valueChanges : ", val);})

  }

  ngAfterViewInit () {
    this._filtriService.passPage("classiDashboard");
    
  }

  refresh (val :number) {

    let obsClassi$: Observable<CLS_ClasseSezioneAnno[]>;

    // if(this.idAnnoScolastico && this.idAnnoScolastico != undefined  && this.idAnnoScolastico != null && this.idAnnoScolastico != 0) {
      obsClassi$= this.svcClassiSezioniAnni.loadClassiByAnnoScolastico(val);
    // } else {
    //   obsClassi$= this.svcClassiSezioniAnni.loadClassi();
    // }


    const loadClassi$ =this._loadingService.showLoaderUntilCompleted(obsClassi$);

    loadClassi$.subscribe(val => 
      {
        this.matDataSource.data = val;
        this.rowclicked(this.matDataSource.data[0]); //seleziona per default la prima riga NON FUNZIONA SEMPRE
      }
    );
    
  }

  rowclicked(val: CLS_ClasseSezioneAnno ){
    console.log("classi-dahsboard.component.ts - rowClicked : idClasse", val.id);
    this.idClasse = val.id;
    this.selectedRowIndex = val.id;
  }

  addAlunnoToClasse() {
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
    //this._dialog.open(DialogAddComponent, dialogConfig);
    // dialogRef.afterClosed()
    //   .subscribe(
    //     () => {
    //       this.refresh();
    // });
  }



}
