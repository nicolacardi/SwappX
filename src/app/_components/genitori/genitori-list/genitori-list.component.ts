import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { GenitoriService } from '../../../_services/genitori.service';
import { GenitoreDetailsComponent } from '../genitore-details/genitore-details.component';
import { LoadingService } from '../../utilities/loading/loading.service';

//import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

@Component({
  selector: 'app-genitori-list',
  templateUrl: './genitori-list.component.html',
  styleUrls: []
})

export class GenitoriListComponent implements OnInit {
  
  matDataSource = new MatTableDataSource<ALU_Genitore>();
  displayedColumns = ["actionsColumn", 
                      "nome", 
                      "cognome", 
                      "tipo", 
                      "indirizzo", 
                      "telefono", 
                      "email", 
                      "dtNascita" ];

  matSortActive!: string;
  matSortDirection!: string;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild("filterInput") filterInput!: ElementRef;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger;

  //@Input()
  //idAlunno!: number;

  //public alunnoInput!: ALU_Alunno;  

  constructor(private svcGenitori:        GenitoriService,
                        private route:            ActivatedRoute,
                        private router:           Router,
                        public _dialog:           MatDialog, 
                        //public _snackBar:         MatSnackBar,
                        private _loadingService:  LoadingService
                        ) {}

  ngOnInit () {
    this.displayedColumns = (window.innerWidth <= 800) ? ["actionsColumn", "nome", "cognome", "telefono", "email","dtNascita"] : ["actionsColumn", "nome", "cognome", "tipo","indirizzo", "telefono", "email","dtNascita"];

    this.refresh();
  }

  refresh () {
    const obsGenitori$: Observable<ALU_Genitore[]> = this.svcGenitori.loadGenitori();
    const loadGenitori$ =this._loadingService.showLoaderUntilCompleted(obsGenitori$);

    loadGenitori$.subscribe(val => 
      {
        var caller_page = this.route.snapshot.queryParams["page"];
        var caller_size = this.route.snapshot.queryParams["size"];
        var caller_filter = this.route.snapshot.queryParams["filter"];
        var caller_sortField = this.route.snapshot.queryParams["sortField"];
        var caller_sortDirection = this.route.snapshot.queryParams["sortDirection"];
        
        this.matDataSource.data = val;
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

  
  openDetail(id:any){
    this.router.navigate(["genitori",id], {queryParams:{page: this.paginator.pageIndex,
                                                      size: this.paginator.pageSize,  
                                                      filter: this.filterInput.nativeElement.value,
                                                      sortField: this.matDataSource.sort?.active,
                                                      sortDirection: this.matDataSource.sort?.direction
                                                    }});
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  addRecord(){
    const dialogConfig = new MatDialogConfig();
    //dialogConfig.disableClose = true; //lo farebbe non chiudibile cliccando altrove
    dialogConfig.data = 0;
    dialogConfig.panelClass = 'add-DetailDialog';
    dialogConfig.width = "800px";
    const dialogRef = this._dialog.open(GenitoreDetailsComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.refresh();
    });
  }

  onResize(event: any) {
    this.displayedColumns = (event.target.innerWidth <= 800) ?  ["actionsColumn", "nome", "cognome", "telefono", "email","dtNascita"] : ["actionsColumn", "nome", "cognome", "tipo","indirizzo", "telefono", "email","dtNascita"];
  }

  onRightClick(event: MouseEvent, element: ALU_Genitore) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  } 
}

