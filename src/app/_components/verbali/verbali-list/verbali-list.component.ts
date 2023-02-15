import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit, ViewChild }  from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';

//components
import { VerbaleEditComponent }                 from '../verbale-edit/verbale-edit.component';
import { VerbaliFilterComponent }               from '../verbali-filter/verbali-filter.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { VerbaliService }                       from '../verbali.service';

//models
import { DOC_Verbale }                             from 'src/app/_models/DOC_Verbale';

@Component({
  selector: 'app-verbali-list',
  templateUrl: './verbali-list.component.html',
  styleUrls: ['../verbali.css']
})
export class VerbaliListComponent implements OnInit, OnChanges {
  
//#region ----- Variabili -------

  matDataSource =                               new MatTableDataSource<DOC_Verbale>();

  displayedColumns:                             string[] =  [
    "actionsColumn", 
    "nome",
    "tipoVerbaleID",
    "dtVerbale",
    "classeSezioneAnnoID",
    "titolo",
  ];



  rptTitle = 'Lista Verbali';
  rptFileName = 'ListaVerbali';
  rptFieldsToKeep  = [
    "dtVerbale"
     ];

  rptColumnsNames  = [
    "data Verbale"
    ];

  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;

  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    nome: '',
    cognome: '',
    tipo: '',
    dtVerbale: '',
    classe: '',
    titolo: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output -------

  @Input() verbaliFilterComponent!:             VerbaliFilterComponent;
  @Input("annoID") annoID!:                     number;

  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;

//#endregion  

  constructor(private svcVerbali:                            VerbaliService,
              private _loadingService:                    LoadingService,
              public _dialog:                             MatDialog ) {
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    this.loadData();
  }

  ngOnInit(): void {

  }

  loadData() {

    this.showPageTitle = true;
    this.showTableRibbon = true;
    
    let obsVerbali$: Observable<DOC_Verbale[]>;
    obsVerbali$= this.svcVerbali.listByAnno(this.annoID);
    let loadVerbali$ =this._loadingService.showLoaderUntilCompleted(obsVerbali$);

    loadVerbali$.subscribe( 
      val =>   {
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

      let dtVerbaleddmmyyyy!: string;
      if (data.dtVerbale){
        let dArrN = data.dtVerbale.split("-");
        dtVerbaleddmmyyyy = dArrN[2].substring(0,2)+ "/" +dArrN[1]+"/"+dArrN[0];
      } 
      else 
        dtVerbaleddmmyyyy = '';

      let boolSx =  String(data.nome).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.cognome).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.tipo).indexOf(searchTerms.filtrosx) !== -1
                  || String(dtVerbaleddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.titolo).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.classe).indexOf(searchTerms.filtrosx) !== -1 ;
      
      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = 
                    String(data.nome).indexOf(searchTerms.nome) !== -1
                    && String(data.cognome).indexOf(searchTerms.cognome) !== -1
                    && String(data.tipo.toLowerCase()).indexOf(searchTerms.tipo) !== -1
                    && String(dtVerbaleddmmyyyy).indexOf(searchTerms.dtVerbale) !== -1
                    && String(data.tipo.toLowerCase()).indexOf(searchTerms.tipo) !== -1
                    && String(data.classe.toLowerCase()).indexOf(searchTerms.classe) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop -------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '500px',
      data: {
        verbale: null,
        annoID: this.annoID
      }
    };
    const dialogRef = this._dialog.open(VerbaleEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( res => 
      this.loadData()
    );
  }

  openDetail(element: DOC_Verbale){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '500px',
      data: {
        verbale: element,
        annoID: this.annoID
      }
    };
    const dialogRef = this._dialog.open(VerbaleEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( 
      res=> this.loadData()
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

}