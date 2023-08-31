//#region ----- IMPORTS ------------------------

import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable, firstValueFrom, iif }                           from 'rxjs';
import { SelectionModel }                       from '@angular/cdk/collections';
import { concatMap, map, tap }                                  from 'rxjs/operators';

//components
import { SocioEditComponent }                 from '../socio-edit/socio-edit.component';
import { SociFilterComponent }                  from '../soci-filter/soci-filter.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { SociService }                          from '../soci.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { TableColsService }                     from '../../utilities/toolbar/tablecols.service';
import { TableColsVisibleService }              from '../../utilities/toolbar/tablecolsvisible.service';

//models
import { PER_Socio }                          from 'src/app/_models/PER_Soci';
import { User }                                 from 'src/app/_user/Users';

//#endregion
@Component({
  selector: 'app-soci-list',
  templateUrl: './soci-list.component.html',
  styleUrls: ['../soci.css']
})
export class SociListComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!:                                    User;

  matDataSource = new MatTableDataSource<PER_Socio>();

  tableName = "SociList";
  displayedColumns: string[] =  [];
  displayedColumnsSociList: string[] = [
    "actionsColumn", 
    "personaID", 
    "tipoSocio",
    "dtRichiesta"
  ];

  filterValue = '';       //Filtro semplice

  filterValues = {
    personaID: '',
    tipoSocioID: '',
    filtrosx: ''
  };
  
  rptTitle = 'Soci';
  rptFileName = 'ListaSoci';

  rptFieldsToKeep  = [
    "tipoSocio.descrizione",
];

  rptColumnsNames  = [
    "tipo",
];

  selection = new SelectionModel<PER_Socio>(true, []);   //rappresenta la selezione delle checkbox

  menuTopLeftPosition =  {x: '0', y: '0'} 

  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;
  public ckSoloAttivi :                         boolean = true;
  emailAddresses!:                              string;


//#endregion

//#region ----- ViewChild Input Output -------

  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild("filterInput") filterInput!:       ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() sociFilterComponent!:             SociFilterComponent;
  @Input('dove') dove! :                        string;

//#endregion

//#region ----- Constructor --------------------

  constructor(private svcSoci:                         SociService,
              private _loadingService:                    LoadingService,
              public _dialog:                             MatDialog,
              private svcTableCols:                       TableColsService,
              private svcTableColsVisible:                TableColsVisibleService)   { 

    this.currUser = Utility.getCurrentUser();
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  async ngOnInit() {
    //this.displayedColumns =  this.displayedColumnsSociList;
    await firstValueFrom(this.loadLayout()); //va eseguita in maniera SINCRONA altrimenti le colonne arrivano troppo tardi e intanto la loadData ha proceduto
     this.loadData(); 
  }

   loadLayout():   Observable<any> {
    return this.svcTableColsVisible.listByUserIDAndTable(this.currUser.userID, this.tableName)
    .pipe(
      tap(colonne=> {
        if (colonne.length != 0) this.displayedColumns = colonne.map(a => a.tableCol!.colName)
        else this.svcTableCols.listByTable(this.tableName).subscribe( colonne => {
            this.displayedColumns = colonne.map(a => a.colName)
          });
        })
    );
  }

  loadData () {
    let obsSoci$: Observable<PER_Socio[]>;
    
    if(this.ckSoloAttivi){
      obsSoci$= this.svcSoci.list();
    }
    else  obsSoci$= this.svcSoci.list();
 
    const loadSoci$ =this._loadingService.showLoaderUntilCompleted(obsSoci$);
    loadSoci$.subscribe( val => {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate();
        this.getEmailAddresses();
      }
    );
  }

  getEmailAddresses() {
    //aggiorna this.emailAddresses che serve per poter copiare dalla toolbar gli indirizzi dei genitori
    //   const emailArray = this.matDataSource.filteredData
    //     .map(socio => socio.email).filter(email => !!email)//TODO da sistemare
    //     .filter(emails => emails.length > 0); 
  
    // this.emailAddresses = emailArray.join(', ');
  }

//#endregion

//#region ----- Filtri & Sort ------------------

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
    this.getEmailAddresses()
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      //let foundTipoSocio = (String(data.tipoSocioID).indexOf(searchTerms.tipoSocioID) !== -1); //per ricerca non numerica...
      let foundTipoSocio = data.tipoSocioID==searchTerms.tipoSocioID;

      if (searchTerms.tipoSocioID == null || searchTerms.tipoSocioID == '') foundTipoSocio = true;

      let boolSx = String(data.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.tipoSocio.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1


      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && foundTipoSocio


      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '600px',
      data: 0
    };

    const dialogRef = this._dialog.open(SocioEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '600px',
      data: id
    };

    const dialogRef = this._dialog.open(SocioEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Gestione Campo Checkbox --------

selectedRow(element: PER_Socio) {
  this.selection.toggle(element);
}

masterToggle() {
  this.toggleChecks = !this.toggleChecks;

  if (this.toggleChecks) 
    this.selection.select(...this.matDataSource.data);
  else 
    this.resetSelections();
}

resetSelections() {
  this.selection.clear();
  this.matDataSource.data.forEach(row => this.selection.deselect(row));
}

toggleAttivi(){
  this.ckSoloAttivi = !this.ckSoloAttivi;
  this.loadData();
}

getChecked() {
  //funzione usata da classi-dahsboard
  return this.selection.selected;
}

//non so se serva questo metodo: genera un valore per l'aria-label...
//forse serve per poi pescare i valori selezionati?
checkboxLabel(row?: PER_Socio): string {
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

//#region ----- Right Click --------------------

  onRightClick(event: MouseEvent, element: PER_Socio) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion
  
}
