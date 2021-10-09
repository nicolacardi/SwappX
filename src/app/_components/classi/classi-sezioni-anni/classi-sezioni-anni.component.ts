import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';

import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ClasseSezioneAnnoEditComponent } from '../classe-sezione-anno-edit/classe-sezione-anno-edit.component';

@Component({
  selector: 'app-classi-sezioni-anni',
  templateUrl: './classi-sezioni-anni.component.html',
  styleUrls: ['./../classi.css']
})
export class ClassiSezioniAnniComponent implements OnInit {


  public idAnnoScolastico!:   number;
  showSelect: boolean = true;
  showPageTitle: boolean = true;
  showTableRibbon: boolean = true;
  @Input('dove') dove! :                                      string;
  @Input('alunnoId') alunnoId! :                              number;
  
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild('selectAnnoScolastico') selectAnnoScolastico!: MatSelect; 
  @Output('annoId') annoIdEmitter = new EventEmitter<number>();
  @Output('classeId') classeIdEmitter = new EventEmitter<number>();
  @Output('addToAttended') addToAttended = new EventEmitter<CLS_ClasseSezioneAnno>();
  @Output('removeFromAttended') removeFromAttended = new EventEmitter<CLS_ClasseSezioneAnno>();
  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnno>();
  selectedRowIndex = -1;
  form! :                     FormGroup;

  displayedColumns: string[] =  [];

  // displayedColumns: string[] =  [
  //   "descrizione",
  //   "sezione"
  //   ];

  displayedColumnsClassiDashboard: string[] =  [
    "descrizione",
    "sezione"
    ];

  displayedColumnsClassiPage: string[] =  [
    "actionsColumn",
    "descrizione",
    "sezione",
    "descrizioneAnnoSuccessivo"
    ];

  displayedColumnsAlunnoEditList: string[] =  [
    "descrizione",
    "sezione",
    "addToAttended"
    ];

  displayedColumnsAlunnoEditAttended: string[] =  [
    "descrizioneCSAA",
    "sezioneCSAA",
    "annoscolasticoCSAA",
    "removeFromAttended"
    ];


  constructor(
    private svcClassiSezioniAnni:         ClassiSezioniAnniService,
    private _loadingService:              LoadingService,
    private fb:                           FormBuilder, 
    public _dialog:                       MatDialog, 
  ) { 
    this.form = this.fb.group({
      selectAnnoScolastico:   [2]
    })
  }
  ngOnChange () {
    
  }

  ngOnInit(): void {
    this.loadData(2);

    this.form.controls['selectAnnoScolastico'].valueChanges
    .subscribe(val => {
      this.loadData(val);
      this.annoIdEmitter.emit(val);
    })

    switch(this.dove) {
      case 'alunno-edit-list':
        this.displayedColumns = this.displayedColumnsAlunnoEditList;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        break;
      case 'alunno-edit-attended': 
        this.displayedColumns = this.displayedColumnsAlunnoEditAttended;
        this.showSelect = false;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        break;
      case 'classi-dashboard':
        this.displayedColumns = this.displayedColumnsClassiDashboard;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        break;
      case 'classi-page':
          this.displayedColumns = this.displayedColumnsClassiPage;
          break;
      default: this.displayedColumns = this.displayedColumnsClassiDashboard;
    }


  }

  loadData (val :number) {
    let obsClassi$: Observable<CLS_ClasseSezioneAnno[]>;
    // if (val == 0) {
    //   val = this.form.controls['selectAnnoScolastico'].value;
    // }
    if (this.dove == "alunno-edit-attended") {
      obsClassi$= this.svcClassiSezioniAnni.loadClassiByAlunno(this.alunnoId); //qui bisogna pescare byAlunno MA attenzione: il risultato è strutturalmente diverso
    } else {
      obsClassi$= this.svcClassiSezioniAnni.loadClassiByAnnoScolastico(val);
    }
    const loadClassi$ =this._loadingService.showLoaderUntilCompleted(obsClassi$);

    loadClassi$.subscribe(val => 
      {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        
        this.rowclicked(this.matDataSource.data[0]); //seleziona per default la prima riga NON FUNZIONA SEMPRE... SERVE??
      }
    );
  }

  rowclicked(val: CLS_ClasseSezioneAnno ){
    //il click su una classe deve essere trasmesso su al parent
    if(val!= undefined){
      this.classeIdEmitter.emit(val.id);
      this.selectedRowIndex = val.id;
    }
    else {
      this.selectedRowIndex = -1;
    }
  }

  addToAttendedEmit(item: CLS_ClasseSezioneAnno) {
    this.addToAttended.emit(item);
  }

  removeFromAttendedEmit(item: any) {
    this.removeFromAttended.emit(item);
  }

  openDetail(id:any) {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: id
    };

    const dialogRef = this._dialog.open(ClasseSezioneAnnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData(1); //TODO: metto intanto un valore di default CABLATO DENTRO COMUNQUE NON FUNZIONA BENE!
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }






}
