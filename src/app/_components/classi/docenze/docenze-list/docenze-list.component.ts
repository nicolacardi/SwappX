//#region ----- IMPORTS ------------------------

import { SelectionModel }                       from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';

//components
import { DocenzaEditComponent }                 from '../docenza-edit/docenza-edit.component';
import { PersonaEditComponent }                 from '../../../persone/persona-edit/persona-edit.component';

//services
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { DocenzeService }                       from '../docenze.service';
import { ClassiSezioniAnniService }             from '../../classi-sezioni-anni.service';

//models
import { CLS_ClasseDocenteMateria }             from 'src/app/_models/CLS_ClasseDocenteMateria';
import { CLS_ClasseSezioneAnno }                from 'src/app/_models/CLS_ClasseSezioneAnno';


//#endregion
@Component({
  selector: 'app-docenze-list',
  templateUrl: './docenze-list.component.html',
  styleUrls: ['../../classi.css']
})

export class DocenzeListComponent implements OnInit {

//#region ----- Variabili ----------------------
matDataSource = new                             MatTableDataSource<CLS_ClasseDocenteMateria>();
  //storedFilterPredicate!:                       any;
  filterValue = '';
  classeSezioneAnno!:                           CLS_ClasseSezioneAnno;

  displayedColumns:                             string[] = [
    "select",
    "actionsColumn",
    "materia",
    "docenteNome",
    "docenteCognome",
    "ckOrario",
    "ckPagella"
  ];

  selection = new SelectionModel<CLS_ClasseDocenteMateria>(true, []);   //rappresenta la selezione delle checkbox

  matSortActive!:                               string;
  matSortDirection!:                            string;

  public page!:                                 string;

  menuTopLeftPosition =  {x: '0', y: '0'} 
  
  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;
  public ckSoloAttivi :                         boolean = true;
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() classeSezioneAnnoID!:                                         number;
  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
//#endregion

//#region ----- Constructor ---------------------
  constructor(private svcDocenze:                 DocenzeService,
              private svcClasseSezioneAnno:       ClassiSezioniAnniService,
              private _loadingService:            LoadingService,
              public _dialog:                     MatDialog ) {
            
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
    if (this.classeSezioneAnnoID != undefined) {
      this.loadData();
      //this.toggleChecks = false;
      //parcheggio in classeSezioneAnno i dati della classe che servono a classi-dashboard (per il nome dell'export)
      this.svcClasseSezioneAnno.get(this.classeSezioneAnnoID).subscribe(
        res => this.classeSezioneAnno = res
      )
    }
  }

  ngOnInit(){

  }

  loadData () {

    let obsInsegnamenti$: Observable<CLS_ClasseDocenteMateria[]>;
  
    obsInsegnamenti$= this.svcDocenze.listByClasseSezioneAnno(this.classeSezioneAnnoID);
    let loadInsegnamenti$ =this._loadingService.showLoaderUntilCompleted(obsInsegnamenti$);

    loadInsegnamenti$.subscribe(val =>  {
        this.matDataSource.data = val;
        //this.matDataSource.paginator = this.paginator;          
        //this.sortCustom();
        //this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
    
  }
//#endregion

//#region ----- Right Click --------------------

  onRightClick(event: MouseEvent, element: CLS_ClasseDocenteMateria) { 

    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  openDocente (docenteID: any) {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: docenteID
    };

    const dialogRef = this._dialog.open(PersonaEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(() => {
          this.loadData();
       });
  }

//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord(){

    //TODO!!!
    /*
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: 0
    };
    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
    */
  }

  openDetail(id:number){

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '440px',
      data: id
    };
    const dialogRef = this._dialog.open(DocenzaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => { 
        this.loadData(); 
      }
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Gestione Campo Checkbox --------
  selectedRow(element: CLS_ClasseDocenteMateria) {
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
  checkboxLabel(row?: CLS_ClasseDocenteMateria): string {
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
