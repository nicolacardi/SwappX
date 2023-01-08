import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';

//components
import { NotaEditComponent }                    from '../nota-edit/nota-edit.component';
import { NoteFilterComponent } from '../note-filter/note-filter.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { NoteService }                          from '../note.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { DOC_Nota }                             from 'src/app/_models/DOC_Nota';


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

    "docente",
    //"personaID",

    "alunno",
    //"iscrizioneID"

    "dtNota",
    "periodo",
    "nota",
    "ckFirmato",
    "dtFirma"
  ];

  rptTitle = 'Lista Note';
  rptFileName = 'ListaNote';
  rptFieldsToKeep  = [
    "dtNota"
     ];

  rptColumnsNames  = [
    "data Nota"
    ];

  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    dtNota: '',
    nota: '',
    docente: '',
    alunno: '',
    periodo: '',
    ckFirmato: '',
    dtFirma: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output -------
  @Input('iscrizioneID') iscrizioneID!:         number;
  @Input('alunno') alunno!:                     ALU_Alunno;
  @Input() noteFilterComponent!:                NoteFilterComponent;

  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;

//#endregion  

  constructor( private svcNote:            NoteService,
               private _loadingService:    LoadingService,
               public _dialog:             MatDialog ) {

  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    //if (this.iscrizioneID != undefined) {
      this.loadData();
      //console.log ("iscrizioneID", this.iscrizioneID);
    //}
  }

  ngOnInit(): void {
  }

  loadData() {
    let obsNote$: Observable<DOC_Nota[]>;
    //obsNote$= this.svcNote.listByIscrizione(this.iscrizioneID);
    obsNote$= this.svcNote.list();
    let loadNote$ =this._loadingService.showLoaderUntilCompleted(obsNote$);

    loadNote$.subscribe( 
      val =>   {
        console.log ("loadNote", val);
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );

  }
//#endregion

//#region ----- Filtri & Sort -------
  applyFilter(event: Event) {

    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {

      let searchTerms = JSON.parse(filter);
      let foundAlunno : boolean = false;
      //console.log (filter);
      /*
      if (data.iscrizione.iscrizione.alunno.length == 0) 
        foundAlunno = true;
      else {
        data.iscrizione.iscrizione.alunno?.forEach(
          (val: { alunno: { nome: any; cognome: any}; })=>  {   
             const foundCognomeNome = foundAlunno || String(val.alunno.cognome+" "+val.alunno.nome).toLowerCase().indexOf(searchTerms.nomeCognomeAlunno) !== -1;
             const foundNomeCognome = foundAlunno || String(val.alunno.nome+" "+val.alunno.cognome).toLowerCase().indexOf(searchTerms.nomeCognomeAlunno) !== -1; 
             foundAlunno = foundCognomeNome || foundNomeCognome;
         })
      }
      */
     let dtNotaddmmyyyy!: string;
      if (data.dtNota){
        let dArrN = data.dtNota.split("-");
         dtNotaddmmyyyy = dArrN[2].substring(0,2)+ "/" +dArrN[1]+"/"+dArrN[0];
      } else {
         dtNotaddmmyyyy = '';
      }

      let dtFirmaddmmyyyy!: string;
      if (data.dtFirma){
        let dArrF = data.dtFirma.split("-");
         dtFirmaddmmyyyy = dArrF[2].substring(0,2)+ "/" +dArrF[1]+"/"+dArrF[0];
      } else {
         dtFirmaddmmyyyy = '';
      }

      console.log ("st", searchTerms);
      console.log ("data", data);

      let boolSx = String(dtNotaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.nota).indexOf(searchTerms.filtrosx) !== -1
                  || (data.periodo == searchTerms.periodo)
                  || String(data.persona.nome.toLowerCase() + ' ' + data.persona.cognome.toLowerCase()).indexOf(searchTerms.filtrosx) !== -1
                  || String(dtFirmaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.iscrizione.alunno.persona.nome.toLowerCase() + ' ' + data.iscrizione.alunno.persona.cognome.toLowerCase()).indexOf(searchTerms.filtrosx) !== -1


                  ;
      
      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(dtNotaddmmyyyy).indexOf(searchTerms.dtNota) !== -1
                    && String(data.nota.toLowerCase()).indexOf(searchTerms.nota) !== -1
                    && ((data.periodo == searchTerms.periodo) || searchTerms.periodo == '' || searchTerms.periodo == null)
                    && String(data.persona.nome.toLowerCase() + ' ' + data.persona.cognome.toLowerCase()).indexOf(searchTerms.docente) !== -1
                    && String(dtFirmaddmmyyyy).indexOf(searchTerms.dtFirma) !== -1
                    && String(data.iscrizione.alunno.persona.nome.toLowerCase() + ' ' + data.iscrizione.alunno.persona.cognome.toLowerCase()).indexOf(searchTerms.alunno) !== -1

                    ;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop -------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '450px',
      height: '550px',
      data: 0
    };
    const dialogRef = this._dialog.open(NotaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( res => 
      this.loadData()
    );
  }

  openDetail(element: DOC_Nota){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '450px',
      height: '550px',
      data: {
        iscrizioneID:                           element.iscrizioneID,
        notaID:                                 element.id,
        personaID:                              element.personaID,
        classeSezioneAnnoID:                    element.iscrizione?.classeSezioneAnnoID
      }
    };
    const dialogRef = this._dialog.open(NotaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( res=>
       this.loadData()
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

}
