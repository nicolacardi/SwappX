import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { DOC_Nota } from 'src/app/_models/DOC_Nota';
import { LoadingService } from '../../utilities/loading/loading.service';
import { NoteService } from '../note.service';
import { NotaEditComponent } from '../nota-edit/nota-edit.component';


@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['../note.component.css']
})
export class NoteListComponent implements OnInit {
//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<DOC_Nota>();

  displayedColumns: string[] =  [
    "actionsColumn", 
    "periodo",
    "dtNota",
    "nota",
    "personaID",
    "ckFirmato",
    "dtFirma"
  ];

  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    dtNota: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output -------
  @Input('iscrizioneID') iscrizioneID!:          number;
  @Input('alunno') alunno!:                      ALU_Alunno;

  @ViewChild(MatPaginator) paginator!:           MatPaginator;
  @ViewChild(MatSort) sort!:                     MatSort;


//#endregion  

  constructor(
    private svcNote:               NoteService,
    private _loadingService:       LoadingService,
    public _dialog:                MatDialog, 

    
  ) { }

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    if (this.iscrizioneID != undefined) {
      this.loadData();
      console.log ("iscrizioneID", this.iscrizioneID);
    }
  }

  ngOnInit(): void {
  }

  loadData() {
    let obsNote$: Observable<DOC_Nota[]>;
    obsNote$= this.svcNote.listByIscrizione(this.iscrizioneID);
    let loadNote$ =this._loadingService.showLoaderUntilCompleted(obsNote$);

    loadNote$.subscribe(
      val =>   {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );

  }
//#endregion

//#region ----- Filtri & Sort -------
  applyFilter(event: Event) {

    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    //if (this.context == "alunni-page") this.alunniFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {

      let searchTerms = JSON.parse(filter);

      let dArr = data.dtNota.split("-");
      const dtNotaddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];

      let boolSx = 
                String(dtNotaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1;
      
      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = 
                String(dtNotaddmmyyyy).indexOf(searchTerms.dtNascita) !== -1
                ;


      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop -------

openDetail(id:any){

  const dialogConfig : MatDialogConfig = {
    panelClass: 'add-DetailDialog',
    width: '850px',
    height: '500px',
    data: id
  };
  const dialogRef = this._dialog.open(NotaEditComponent, dialogConfig);
  dialogRef.afterClosed().subscribe(
    () => this.loadData()
  );
}


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

}
