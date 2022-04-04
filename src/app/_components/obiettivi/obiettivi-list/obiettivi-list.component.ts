import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { MAT_Obiettivo } from 'src/app/_models/MAT_Obiettivo';
import { LoadingService } from '../../utilities/loading/loading.service';
import { ObiettiviService } from '../obiettivi.service';
import { ObiettivoEditComponent } from '../obiettivo-edit/obiettivo-edit.component';

@Component({
  selector: 'app-obiettivi-list',
  templateUrl: './obiettivi-list.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettiviListComponent implements OnInit {

//#region ----- Variabili -------

matDataSource = new MatTableDataSource<MAT_Obiettivo>();

obsObiettivi$!:               Observable<MAT_Obiettivo[]>;

displayedColumns: string[] = [
    "actionsColumn", 
    "classe",
    "anno",
    "materia",
    "descrizione",

];


rptTitle = 'Lista Obiettivi';
rptFileName = 'ListaObiettivi';
rptFieldsToKeep  = [

  "classe",
  "anno",
  "materia",
  "descrizione",


];

rptColumnsNames  = [
  "classe",
  "anno",
  "materia",
  "descrizione",
];

filterValue = '';       //Filtro semplice

filterValues = {
  descrizione: '',
  filtrosx: ''
}
//#endregion
//#region ----- ViewChild Input Output -------
@ViewChild(MatSort) sort!:                MatSort;
//#endregion

constructor(
  private svcObiettivi:                   ObiettiviService,

  private _loadingService:                LoadingService,
  public _dialog:                         MatDialog, 


) { }



ngOnInit(): void {
  this.loadData();
}

loadData() {

  
  this.obsObiettivi$ = this.svcObiettivi.list();  

  const loadObiettivi$ =this._loadingService.showLoaderUntilCompleted(this.obsObiettivi$);

  loadObiettivi$.subscribe(val =>   {
    this.matDataSource.data = val;
    this.matDataSource.sort = this.sort; 
    this.matDataSource.filterPredicate = this.filterPredicate(); //usiamo questo per uniformità con gli altri component nei quali c'è anche il filtro di destra, così volendo lo aggiungiamo velocemente
  }
);

}

//#region ----- Add Edit Drop -------
addRecord(){
  const dialogConfig : MatDialogConfig = {
    panelClass: 'add-DetailDialog',
    width: '400px',
    height: '430px',
    data: 0
  };
  const dialogRef = this._dialog.open(ObiettivoEditComponent, dialogConfig);
  dialogRef.afterClosed()
    .subscribe(
      () => {
        this.loadData();
  });
}

openDetail(obiettivoID:any){
  const dialogConfig : MatDialogConfig = {
    panelClass: 'add-DetailDialog',
    width: '400px',
    height: '430px',
    data: obiettivoID
  };
  const dialogRef = this._dialog.open(ObiettivoEditComponent, dialogConfig);
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

filterPredicate(): (data: any, filter: string) => boolean {
  let filterFunction = function(data: any, filter: any): boolean {
    
    let searchTerms = JSON.parse(filter);

    let boolSx = String(data.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  || String(data.materia.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  || String(data.classe.descrizione2).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  
    return boolSx;

  }
  return filterFunction;
}
//#endregion


}
