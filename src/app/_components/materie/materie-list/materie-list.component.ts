import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { MaterieService } from 'src/app/_components/materie/materie.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MateriaEditComponent } from '../materia-edit/materia-edit.component';

import { MAT_Materia } from 'src/app/_models/MAT_Materia';
import { MAT_MacroMateria } from 'src/app/_models/MAT_MacroMateria';
import { MacroMaterieService } from '../macromaterie.service';

@Component({
  selector: 'app-materie-list',
  templateUrl: './materie-list.component.html',
  styleUrls: ['../materie.css']
})
export class MaterieListComponent implements OnInit {

//#region ----- Variabili -------

  matDataSource = new MatTableDataSource<MAT_Materia>();

  obsMaterie$!:               Observable<MAT_Materia[]>;

  displayedColumns: string[] = [
      "actionsColumn", 
      "descrizione", 
      "macroMateria"
  ];


  rptTitle = 'Lista Materie';
  rptFileName = 'ListaMaterie';
  rptFieldsToKeep  = [
    "descrizione"

  ];

  rptColumnsNames  = [
    "descrizione"
  ];

  filterValue = '';       //Filtro semplice

  filterValues = {
    descrizione: '',
    filtrosx: ''
  }
//#endregion
//#region ----- ViewChild Input Output -------
  @ViewChild(MatSort) sort!:                                  MatSort;
//#endregion

  constructor(
    private svcMaterie:                     MaterieService,

    private _loadingService:                LoadingService,
    public _dialog:                         MatDialog, 


  ) { }

 
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    
    this.obsMaterie$ = this.svcMaterie.list();  

    const loadMaterie$ =this._loadingService.showLoaderUntilCompleted(this.obsMaterie$);

    loadMaterie$.subscribe(val =>   {
      this.matDataSource.data = val;
      console.log (val);
      this.matDataSource.sort = this.sort; 
    }
  );

  }

//#region ----- Add Edit Drop -------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: 0
    };
    const dialogRef = this._dialog.open(MateriaEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
  }

  openDetail(materiaID:any){
    console.log (materiaID);
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: materiaID
    };
    const dialogRef = this._dialog.open(MateriaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => { 
        this.loadData(); 
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
//#endregion


}
