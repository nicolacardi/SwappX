import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CLS_ClasseDocenteMateria } from 'src/app/_models/CLS_ClasseDocenteMateria';
import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiDocentiMaterieService } from '../classi-docenti-materie.service';

@Component({
  selector: 'app-classi-docenti-materie-list',
  templateUrl: './classi-docenti-materie-list.component.html',
  styleUrls: ['../classi.css']
})
export class ClassiDocentiMaterieListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new           MatTableDataSource<CLS_ClasseDocenteMateria>();
  storedFilterPredicate!:       any;
  filterValue = '';

  displayedColumns: string[] = [
    "id",
    "materia",
    "docenteID"
  ];

  selection = new SelectionModel<CLS_ClasseDocenteMateria>(true, []);   //rappresenta la selezione delle checkbox

  matSortActive!:               string;
  matSortDirection!:            string;

  public page!:                 string;

  menuTopLeftPosition =  {x: '0', y: '0'} 
  //idAlunniChecked:              number[] = [];
  toggleChecks:                 boolean = false;
  showPageTitle:                boolean = true;
  showTableRibbon:              boolean = true;
  public swSoloAttivi :         boolean = true;

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;

  @Input() idClasse!:                                         number;
  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
//#endregion




  private _dialog: any;
  matMenuTrigger: any;

  constructor(
    private svcClassiDocentiMaterie:    ClassiDocentiMaterieService,
    private _loadingService:            LoadingService 

  ) { }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();
  }

  loadData () {

    let obsInsegnamenti$: Observable<CLS_ClasseDocenteMateria[]>;

    obsInsegnamenti$= this.svcClassiDocentiMaterie.list();
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

//#region ----- Right Click -------

  onRightClick(event: MouseEvent, element: CLS_ClasseDocenteMateria) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
  /*
  openPagamenti(alunnoID: number){

    let anno = 1; //TODO questa sarà un default da mettere nei parametri
    const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '850px',
        height: '700px',
        data: {
          idAlunno: alunnoID,
          idAnno: anno
        }
    };

    const dialogRef = this._dialog.open(RettaEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
  }
  */
//#endregion

  //#region ----- Add Edit Drop -------
  addRecord(){

    //TODO!!!
    /*
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
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

  openDetail(recordID:number){
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: recordID
    };
    // const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    // dialogRef.afterClosed().subscribe(
    //   () => { 
    //     this.loadData(); 
    //   }
    // );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion
}
