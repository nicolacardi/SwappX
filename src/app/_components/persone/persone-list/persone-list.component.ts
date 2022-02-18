import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

//components
import { PersonaEditComponent } from '../persona-edit/persona-edit.component';
import { PersoneFilterComponent } from '../persone-filter/persone-filter.component';

//services
import { PersoneService } from '../persone.service';
import { LoadingService } from '../../utilities/loading/loading.service';

//models
import { PER_Persona } from 'src/app/_models/PER_Persone';
@Component({
  selector: 'app-persone-list',
  templateUrl: './persone-list.component.html',
  styleUrls: ['../persone.css']
})
export class PersoneListComponent implements OnInit {

//#region ----- Variabili -------

  matDataSource = new MatTableDataSource<PER_Persona>();

  displayedColumns: string[] =  [];
  displayedColumnsPersoneList: string[] = [
    "actionsColumn", 
    "nome", 
    "cognome", 
    "dtNascita", 
    "indirizzo", 
    "comune", 
    "cap", 
    "prov", 
    "email", 
    "telefono"
  ];

  filterValue = '';       //Filtro semplice

  filterValues = {
    nome: '',
    cognome: '',
    annoNascita: '',
    indirizzo: '',
    comune: '',
    prov: '',
    email: '',
    telefono: '',
    filtrosx: ''
  };
  
  rptTitle = 'Elenco Persone';
  
  rptFieldsToKeep  = [
    "nome", 
    "cognome", 
    "dtNascita", 
    "indirizzo", 
    "comune", 
    "cap", 
    "prov", 
    "email", 
    "telefono"];

  rptColumnsNames  = [
    "nome", 
    "cognome", 
    "nato il", 
    "indirizzo", 
    "comune", 
    "cap", 
    "prov", 
    "email", 
    "telefono"];

  menuTopLeftPosition =  {x: '0', y: '0'} 

//#endregion

//#region ----- ViewChild Input Output -------

  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
  @Input() personeFilterComponent!:                           PersoneFilterComponent;
  @Input('dove') dove! :                                      string;
//#endregion



  constructor(
    private svcPersone:       PersoneService,
    private _loadingService:  LoadingService,
    public _dialog:           MatDialog, 
  ) { }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
    this.displayedColumns =  this.displayedColumnsPersoneList;
    this.loadData(); 
  }

  loadData () {
    let obsAlunni$: Observable<PER_Persona[]>;
    obsAlunni$= this.svcPersone.load();
    const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);
    loadAlunni$.subscribe(val => 
      {
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
    //if (this.dove == "persone-page") this.personeFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }


  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      let boolSx = String(data.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.dtNascita).indexOf(searchTerms.filtrosx) !== -1
                || String(data.indirizzo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.comune).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.prov).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.telefono).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && String(data.dtNascita).indexOf(searchTerms.annoNascita) !== -1
                && String(data.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
                && String(data.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
                && String(data.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
                && String(data.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
                && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop -------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: 0
    };

    const dialogRef = this._dialog.open(PersonaEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
  }

  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: id
    };

    const dialogRef = this._dialog.open(PersonaEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click -------
  onRightClick(event: MouseEvent, element: PER_Persona) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion
  
}
