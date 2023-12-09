//#region ----- IMPORTS ------------------------

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { SelectionModel }                       from '@angular/cdk/collections';
import { MatTableDataSource}                    from '@angular/material/table';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';

//components
import { RisorsaCSAEditComponent }              from '../risorsa-csa-edit/risorsa-csa-edit.component';
import { Utility }                              from '../../../utilities/utility.component';

//services
import { RisorseCSAService }                    from '../risorse-csa.service';
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { TableColsService }                     from '../../../utilities/toolbar/tablecols.service';
import { TableColsVisibleService }              from '../../../utilities/toolbar/tablecolsvisible.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { CLS_RisorsaCSA }                       from 'src/app/_models/CLS_RisorsaCSA';


//#endregion
@Component({
  selector: 'app-risorse-csa-list',
  templateUrl: './risorse-csa-list.component.html',
  styleUrls: ['../risorse-csa.css']
})

export class RisorseCSAListComponent implements OnInit {

//#region ----- Variabili ----------------------
  maxSeq!:                                      number;
  currUser!:                                    User;
    
  matDataSource = new MatTableDataSource<CLS_RisorsaCSA>();

  tableName = "RisorseClassiList";
  displayedColumns: string[] =  [
    "actionsColumn",
    "classe",
    "fileName",
    "tipoDocumento"
  ];

  rptTitle = 'Lista Template Classi';
  rptFileName = 'ListaTemplateClassi';

  rptFieldsToKeep  = [
    "fileName",
    "classe",
    "tipoDoc"
  ];

  rptColumnsNames  = [
    "Nome File",
    "Classe",
    "Tipo Documento"
  ];

  selection = new SelectionModel<CLS_RisorsaCSA>(true, []);   //rappresenta la selezione delle checkbox


  menuTopLeftPosition =  {x: '0', y: '0'} 

  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showFilter:                                   boolean = true;

  showTableRibbon:                              boolean = true;

  filterValue = '';       //Filtro semplice
   //filterValues contiene l'elenco dei filtri avanzati da applicare 
   filterValues = {
    parName: '',
    parValue: '',
    parDescr: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild("filterInput") filterInput!:       ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger;

  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
//#endregion

//#region ----- Constructor --------------------
  constructor(private svcRisorseCSA:            RisorseCSAService,
              public _dialog:                   MatDialog, 
              private _loadingService:          LoadingService) {
     
     this.currUser = Utility.getCurrentUser();
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {

      this.loadData();
      this.toggleChecks = false;
      this.resetSelections();
  }

  ngOnInit () {

      this.showFilter = false;
      this.loadData(); 
  }


  loadData () {

    let obsRisorseClassi$: Observable<CLS_RisorsaCSA[]>;
    obsRisorseClassi$= this.svcRisorseCSA.list();    
    const loadParametri$ =this._loadingService.showLoaderUntilCompleted(obsRisorseClassi$);

    loadParametri$.subscribe(
      val =>   {
        console.log("risorse-classi-list - loadData", val);
        this.matDataSource.data = val;
        //this.matDataSource.paginator = this.paginator;
        //this.sortCustom();
        //this.matDataSource.sort = this.sort;
        //this.matDataSource.filterPredicate = this.filterPredicate();
        // this.maxSeq = val.reduce((max, item) => {
        //   return item.seq! > max ? item.seq! : max;
        // }, 0);
      }
    );
  }

//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'parName':                         return item.parName;
        case 'parValue':                        return item.parValue;
        default: return item[property]
      }
    };
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  resetSearch(){
    this.filterInput.nativeElement.value = "";
    this.filterValue = "";
    this.filterValues.filtrosx = "";
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      let boolSx =  String(data.parName).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  ||  String(data.parValue).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  ||  String(data.parDescr).toLowerCase().indexOf(searchTerms.filtrosx) !== -1

      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.parName).toLowerCase().indexOf(searchTerms.parName) !== -1
                  && String(data.parValue).toLowerCase().indexOf(searchTerms.parValue) !== -1
                  && String(data.parDescr).toLowerCase().indexOf(searchTerms.parDescr) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '600px',
      height: '350px',
      data:  { risorsaCSAID: 0 }
    };

    const dialogRef = this._dialog.open(RisorsaCSAEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      res => this.loadData()
    );
  }
  
  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '600px',
      height: '350px',
      data:  { risorsaCSAID: id }
    };

    const dialogRef = this._dialog.open(RisorsaCSAEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        () => this.loadData()
    );
  }

  drop(event: any){
    // this.svcRisorseClassi.updateSeq(event.previousIndex+1, event.currentIndex+1 )
    // .subscribe(res=> this.loadData());
  }

//#endregion

//#region ----- Gestione Campo Checkbox --------

selectedRow(element: CLS_RisorsaCSA) {
  this.selection.toggle(element);
}

masterToggle() {
  this.toggleChecks = !this.toggleChecks;

  if (this.toggleChecks) {
    const visibleData = this.matDataSource.filteredData || this.matDataSource.data;
    this.selection.select(...visibleData);
  } else 
    this.resetSelections();
}

resetSelections() {
  this.selection.clear();
  this.matDataSource.data.forEach(row => this.selection.deselect(row));
}

getChecked() {
  //funzione usata da classi-dahsboard
  return this.selection.selected;
}

//non so se serva questo metodo: genera un valore per l'aria-label...
//forse serve per poi pescare i valori selezionati?
checkboxLabel(row?: CLS_RisorsaCSA): string {
  if (!row) 
    return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  else
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
}

//questo metodo ritorna un booleano che dice se sono selezionati tutti i record o no
//per ora non lo utilizzo
isAllSelected() {
  const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
  const numRows = this.matDataSource.data.length;       //conta il numero di elementi del matDataSource
  return numSelected === numRows;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
}
//#endregion


}


