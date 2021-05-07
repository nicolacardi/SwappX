import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { delayWhen, finalize, map } from 'rxjs/operators';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from '../../../_services/alunni.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlunnoDetailsComponent } from '../alunno-details/alunno-details.component';
import { LoadingService } from '../../utilities/loading/loading.service';


@Component({
  selector: 'app-alunni-list',
  templateUrl: './alunni-list.component.html',
  styleUrls: [],
  /* expanded
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],*/
})

export class AlunniListComponent implements OnInit {
  
  //dsAlunni!: AlunniDataSource;***Questa si usava per passargli un custom datasource
  //private update = new Subject<ALU_Alunno[]>();
  //update$ = this.update.asObservable();

  
  matDataSource = new MatTableDataSource<ALU_Alunno>();
  displayedColumns: string[] =  ["actionsColumn", "nome", "cognome", "dtNascita", "indirizzo", "comune", "cap", "prov", "email", "telefono", "ckAttivo" ];
  //expandedElement!: ALU_Alunno | null;      //expanded
  matSortActive!: string;
  matSortDirection!: SortDirection;
  
  //@ViewChild('myTable') myTable!: MatTable<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild("filterInput") filterInput!: ElementRef;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private svcAlunni: AlunniService,
              private route:  ActivatedRoute,
              private router: Router,
              public _dialog: MatDialog, 
              public _snackBar: MatSnackBar,
              private _loadingService: LoadingService
              ) {}
  
  ngOnInit () {
    this.displayedColumns = (window.innerWidth <= 800) ? ["actionsColumn", "nome", "cognome", "dtNascita", "email"] : ["actionsColumn", "nome", "cognome", "dtNascita", "indirizzo", "comune", "cap", "prov", "email", "telefono", "ckAttivo"];
    this.refresh();
  }

  refresh () {

    const obsAlunni$: Observable<ALU_Alunno[]> = this.svcAlunni.loadAlunni();
    const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);

    loadAlunni$.subscribe(val => 
      {
        var caller_page = this.route.snapshot.queryParams["page"];
        var caller_size = this.route.snapshot.queryParams["size"];
        var caller_filter = this.route.snapshot.queryParams["filter"];
        var caller_sortField = this.route.snapshot.queryParams["sortField"];
        var caller_sortDirection = this.route.snapshot.queryParams["sortDirection"];
    
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort;
        this.matSortActive = "";

        if(caller_page != undefined ){
          //console.log("from Detail: page, size, sortField, sortDirection:",caller_page, caller_size, caller_sortField, caller_sortDirection);
          this.paginator.pageIndex = caller_page;
          this.paginator.pageSize = caller_size;
          this.matSortActive = caller_sortField; //non funziona benissimo
          this.matSortDirection = caller_sortDirection;
          this.filterInput.nativeElement.value = caller_filter;
          this.matDataSource.filter = caller_filter;

        }
      }
    );
  }

  openDetail(id:any){
    
    //Versione Router
    //this.router.navigate(["alunni", id]);
    //this.router.navigate(["alunni"], {queryParams:{ id:id, page:2}});
    console.log("from List sortField:", this.matDataSource.sort?.active); //resta valorizzato anche dopo che il sort è stato neutralizzato! anche con this.maSortActive, anzi lì peggio
    console.log("from List sortDirection: ", this.matDataSource.sort?.direction);
    this.router.navigate(["alunni",id], {queryParams:{page: this.paginator.pageIndex,
                                                      size: this.paginator.pageSize,  
                                                      filter: this.filterInput.nativeElement.value,
                                                      sortField: this.matDataSource.sort?.active,
                                                      sortDirection: this.matDataSource.sort?.direction
                                                    }});

    /* Versione Dialog
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
    //console.log (event);
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  addAlunno(){
    //this.router.navigate(["alunni", id]);
    const dialogConfig = new MatDialogConfig();
    //dialogConfig.disableClose = true; //lo fa modale
    dialogConfig.data = 0;
    dialogConfig.panelClass = 'my-dialog';
    dialogConfig.width = "800px";
    const dialogRef = this._dialog.open(AlunnoDetailsComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.refresh();
          console.log("chiudo la add dialog");
    });
  }

  /*
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: {name: this.name, animal: this.animal}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }
  */



  deleteDetail(element: any, event: Event){
    
    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.svcAlunni.deleteAlunno(element.id)
        .subscribe(
          res=>{    
            this._snackBar.openFromComponent(SnackbarComponent,
              {data: 'Alunno ' + element.nome + ' '+ element.cognome + ' cancellato', panelClass: ['red-snackbar'] });
            
              this.refresh();
            //this.matDataSource.data.splice(this.matDataSource.data.findIndex(x=> x.id === element.id),1);
            //this.matDataSource.data = this.matDataSource.data;
          },
          err=> (
              console.log("ERRORE")
          )
        );
      }
    });
    event.stopPropagation(); 
  }

  onResize(event: any) {
    //console.log(event);
    this.displayedColumns = (event.target.innerWidth <= 800) ? ["actionsColumn", "nome", "cognome", "dtNascita", "email"] : ["actionsColumn", "nome", "cognome", "dtNascita", "indirizzo", "comune", "cap", "prov", "email", "telefono", "ckAttivo"];;
  }
}



