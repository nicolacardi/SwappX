import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

//services
import { ClasseAnnoMateriaService } from '../classe-anno-materia.service';

//models
import { CLS_ClasseAnnoMateria } from 'src/app/_models/CLS_ClasseAnnoMateria';

//components
import { ClasseAnnoMateriaEditComponent } from '../classe-anno-materia-edit/classe-anno-materia-edit.component';
import { LoadingService } from '../../../utilities/loading/loading.service';

@Component({
  selector: 'app-classi-anni-materie-list',
  templateUrl: './classi-anni-materie-list.component.html',
  styleUrls: ['../classi-anni-materie.css']
})
export class ClassiAnniMaterieListComponent implements OnInit {


//#region ----- Variabili -------

matDataSource = new MatTableDataSource<CLS_ClasseAnnoMateria>();

obsClassiAnniMaterie$!:               Observable<CLS_ClasseAnnoMateria[]>;

displayedColumns: string[] = [
    "actionsColumn", 
    "anno",
    "classe",
    "materia",
    "tipoVoto"
];

rptTitle = 'Lista Tipi Voto';
rptFileName = 'ListaTipiVoto';
rptFieldsToKeep  = [
  "classe",
  "anno",
  "materia",
  "tipoVoto"
];

rptColumnsNames  = [
  "classe",
  "anno",
  "materia",
  "tipoVoto"
];

filterValue = '';       //Filtro semplice

filterValues = {
  anno: '',
  classe: '',
  materia: '',
  tipoVoto: '',
  filtrosx: ''
}

//#endregion

//#region ----- ViewChild Input Output -------
@ViewChild(MatSort) sort!:                MatSort;
//#endregion

  constructor(private svcClasseAnnoMateria:           ClasseAnnoMateriaService,
              private _loadingService:                LoadingService,
              public _dialog:                         MatDialog ) {
              
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.obsClassiAnniMaterie$ = this.svcClasseAnnoMateria.list();  
    const loadClassiAnniMaterie$ =this._loadingService.showLoaderUntilCompleted(this.obsClassiAnniMaterie$);

    loadClassiAnniMaterie$.subscribe(val =>   {
        this.matDataSource.data = val;
        this.sortCustom(); 
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
    const dialogRef = this._dialog.open(ClasseAnnoMateriaEditComponent, dialogConfig);
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
    const dialogRef = this._dialog.open(ClasseAnnoMateriaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => { 
        this.loadData(); 
      }
    );
  }
//#endregion

//#region ----- Filtri & Sort -------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
    
      switch(property) {
        case 'anno':                        return item.anno.anno1;
        case 'classe':                      return item.classe.descrizione2;
        case 'materia':                     return item.materia.descrizione;
        case 'tipoVoto':                    return item.tipoVoto.descrizione;

        default: return item[property]
      }
    };
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    //if (this.context == "alunni-page") this.alunniFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      
      let searchTerms = JSON.parse(filter);

      let boolSx = String(data.anno.annoscolastico).toLowerCase().indexOf(searchTerms.filtrosx) !== -1  
                    || String(data.classe.descrizione2).toLowerCase().indexOf(searchTerms.filtrosx) !== -1               
                    || String(data.materia.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                    || String(data.tipoVoto.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                    
      return boolSx;

    }
    return filterFunction;
  }
//#endregion
}