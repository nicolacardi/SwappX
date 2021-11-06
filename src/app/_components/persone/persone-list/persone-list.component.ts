import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { AlunnoEditComponent } from '../../alunni/alunno-edit/alunno-edit.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { PersonaEditComponent } from '../persona-edit/persona-edit.component';
import { PersoneFilterComponent } from '../persone-filter/persone-filter.component';
import { PersoneService } from '../persone.service';

@Component({
  selector: 'app-persone-list',
  templateUrl: './persone-list.component.html',
  styleUrls: ['../persone.css']
})
export class PersoneListComponent implements OnInit {

  matDataSource = new MatTableDataSource<PER_Persona>();
  storedFilterPredicate!:       any;

  filterValues = {
    nome: '',
    cognome: '',
    annoNascita: '',
    indirizzo: '',
    comune: '',
    prov: '',
    email: '',
    telefono: ''
  };

  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
  @Input() personeFilterComponent!:                           PersoneFilterComponent;
  @Input('dove') dove! :                                      string;
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

  menuTopLeftPosition =  {x: '0', y: '0'} 

  constructor(private svcPersone:       PersoneService,
              private _loadingService:  LoadingService,
              public _dialog:           MatDialog, 
            ) { }

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
        this.storedFilterPredicate = this.matDataSource.filterPredicate;
        this.matDataSource.filterPredicate = this.filterRightPanel();
      }
    );
  }

  filterRightPanel(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      return String(data.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
        && String(data.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
        && String(data.dtNascita).indexOf(searchTerms.annoNascita) !== -1
        && String(data.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
        && String(data.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
        && String(data.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
        && String(data.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
        && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1
    }
    return filterFunction;
  }


  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.length == 1) {
      this.matDataSource.filterPredicate = this.storedFilterPredicate;
      if (this.dove == "persone-page") this.personeFilterComponent.resetAllInputs();
    }
    this.matDataSource.filter = filterValue.trim().toLowerCase();
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  onRightClick(event: MouseEvent, element: PER_Persona) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
  
}