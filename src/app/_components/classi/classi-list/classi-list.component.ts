import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { CLS_ClasseSezione } from 'src/app/_models/CLS_ClasseSezione';
import { ClassiSezioniService } from '../classi-sezioni.service';
//import { AlunnoDetailsComponent } from '../-details/alunno-details.component';

import { LoadingService } from '../../utilities/loading/loading.service';
import { FiltriService } from '../../utilities/filtri/filtri.service';

@Component({
  selector: 'app-classi-list',
  templateUrl: './classi-list.component.html',
  styleUrls: ['./classi-list.component.css']
})
/*
export class ClassiListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
*/
export class ClassiListComponent implements OnInit {
  
  matDataSource = new MatTableDataSource<CLS_ClasseSezione>();
  displayedColumns: string[] =  ["actionsColumn",
                                "classe.descrizione",
                                "sezione",
                                "classe.descrizioneBreve",
                                "classe.descrizione2"
                                 ];

  matSortActive!:     string;
  matSortDirection!:  string;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  constructor(private svcClassi:        ClassiSezioniService,
              private route:            ActivatedRoute,
              private router:           Router,
              public _dialog:           MatDialog, 
              private _loadingService:  LoadingService,
              private _filtriService:   FiltriService
              ) {}
  
  ngOnInit () {
    this.displayedColumns = (window.innerWidth <= 800) ? ["actionsColumn",
                                                          "classe.descrizione",
                                                          "sezione",
                                                          "classe.descrizioneBreve",
                                                          "classe.descrizione2"] :
                                                          ["actionsColumn",
                                                          "classe.descrizione",
                                                          "sezione",
                                                          "classe.descrizioneBreve",
                                                          "classe.descrizione2"];
    /* TODO!!!
    this._filtriService.getGenitore()
      .subscribe(
        val=>{
        this.idGenitore = val;
        this.refresh();
    });
    */
    this.refresh(); //TMP
  }

  refresh () {
    let obsClassi$: Observable<CLS_ClasseSezione[]>;

    obsClassi$= this.svcClassi.loadClassi();

    const loadClassi$ =this._loadingService.showLoaderUntilCompleted(obsClassi$);

    loadClassi$.subscribe(val => 
      {
        var caller_page = this.route.snapshot.queryParams["page"];
        var caller_size = this.route.snapshot.queryParams["size"];
        var caller_filter = this.route.snapshot.queryParams["filter"];
        var caller_sortField = this.route.snapshot.queryParams["sortField"];
        var caller_sortDirection = this.route.snapshot.queryParams["sortDirection"];
        
        this.matDataSource.data = val;
        this.filterPredicateCustom();   //serve per rendere filtrabili anche i campi nested
        this.sortCustom();              //serve per rendere sortabili anche i campi nested
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort;

        if(caller_page != undefined ){
          if (caller_sortDirection) {
            this.sort.sort(({ id: caller_sortField, start: caller_sortDirection}) as MatSortable);
          }
          this.paginator.pageIndex = caller_page;
          this.paginator.pageSize = caller_size;
          this.filterInput.nativeElement.value = caller_filter;
          this.matDataSource.filter = caller_filter;
        }
      }
    );
  }


  filterPredicateCustom(){ //NC
    //questa funzione consente il filtro ANCHE sugli oggetti della classe
    //https://stackoverflow.com/questions/49833315/angular-material-2-datasource-filter-with-nested-object/49833467
    this.matDataSource.filterPredicate = (data, filter: string)  => {
      const accumulator = (currentTerm: any, key: string) => { //Key è il campo in cui cerco
        if (key === 'classe') {
          return currentTerm + data.classe.descrizione + data.classe.descrizione2 + data.classe.descrizioneBreve;
        } else {
          return currentTerm + data.sezione;
        }
      };
      const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };
  }

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item, property) => {
      switch(property) {
        case 'classe.descrizione': return item.classe.descrizione;
        case 'classe.descrizione2': return item.classe.descrizione2;
        case 'classe.descrizioneBreve': return item.classe.descrizioneBreve;
        default: return item['sezione'];
      }
    };
  }

  
  openDetail(id:any){
    //***** Versione Router
    this.router.navigate(["classi",id], {queryParams:{page: this.paginator.pageIndex,
                                                      size: this.paginator.pageSize,  
                                                      filter: this.filterInput.nativeElement.value,
                                                      sortField: this.matDataSource.sort?.active,
                                                      sortDirection: this.matDataSource.sort?.direction
                                                    }});
    /***** Versione Dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true; //lo fa modale
    dialogConfig.autoFocus = true;    //il primo elemento ha il focus
    dialogConfig.data = id;
    dialogConfig.panelClass = 'my-dialog';
    let dialogRef = this.dialog.open(AlunnoDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(()=>{
      this.refresh();                         //Aggiorna la griglia dopo update da dialog
    });
    */

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
  
  addRecord(){
    /* TODO!!!
    const dialogConfig = new MatDialogConfig();
    //dialogConfig.disableClose = true; //lo farebbe non chiudibile cliccando altrove
    dialogConfig.data = 0;
    dialogConfig.panelClass = 'add-DetailDialog';
    dialogConfig.width = "800px";
    const dialogRef = this._dialog.open(AlunnoDetailsComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.refresh();
    });
  */
  }
  
  onResize(event: any) {
    this.displayedColumns = (event.target.innerWidth <= 800) ? ["actionsColumn", 
                                                                "classe.descrizione",
                                                                "sezione",
                                                                "classe.descrizioneBreve",
                                                                "classe.descrizione2"] : 
                                                                ["actionsColumn", 
                                                                "classe.descrizione",
                                                                "sezione",
                                                                "classe.descrizioneBreve",
                                                                "classe.descrizione2"];
  }

  onRightClick(event: MouseEvent, element: CLS_ClasseSezione) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  
  openDetails(id: number) {
  //  this._filtriService.passAlunno(id);
  //  this.router.navigateByUrl("/genitori");
  }
  
}

