import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { delayWhen, finalize, map } from 'rxjs/operators';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from '../../../_services/alunni.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlunnoDetailsComponent } from '../alunno-details/alunno-details.component';


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

  obs_ALU_Alunni$! : Observable<ALU_Alunno[]>;
  matDataSource = new MatTableDataSource<ALU_Alunno>();
  displayedColumns: string[] =  ["nome", "cognome", "dtNascita", "indirizzo", "comune", "cap", "prov", "email", "telefono", "ckAttivo", "actionsColumn"];
  //expandedElement!: ALU_Alunno | null;      //expanded

  //@ViewChild('myTable') myTable!: MatTable<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private svcALU_Alunni: AlunniService,
              private router : Router,
              public _dialog: MatDialog, 
              public _snackBar: MatSnackBar,
              private dialog: MatDialog) {}

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  ngOnInit () {
    this.displayedColumns = (window.innerWidth <= 800) ? ["nome", "cognome", "dtNascita", "email"] : ["nome", "cognome", "dtNascita", "indirizzo", "comune", "cap", "prov", "email", "telefono", "ckAttivo", "actionsColumn"];;

    this.loadingSubject.next(true);
    //this.update$.subscribe (()=>{this.refresh()});
    this.refresh();
    //this.obs_ALU_Alunni$ = this.svcALU_Alunni.loadAlunniWithParents()
  }

  refresh () {
    this.obs_ALU_Alunni$ = this.svcALU_Alunni.loadAlunni()
    .pipe (
      //delayWhen(() => timer(200)),
      finalize(() => this.loadingSubject.next(false)
    )
    );

    this.obs_ALU_Alunni$.subscribe(val => 
      {
      this.matDataSource.data = val;
      this.matDataSource.paginator = this.paginator;
      this.matDataSource.sort = this.sort;
      }
    );
  }

  onRowClicked(id:any) {
    //this.router.navigate(["alunni", id]);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true; //lo fa modale
    dialogConfig.autoFocus = true;    //il primo elemento ha il focus
    dialogConfig.data = id;
    dialogConfig.panelClass = 'my-dialog';
    let dialogRef = this.dialog.open(AlunnoDetailsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(()=>{
      this.refresh();                         //Aggiorna la griglia dopo update da dialog
    });
  }
  
  // Apertura dettaglio in modalità link
  openDetail(id:any){
    this.router.navigate(["alunni", id]);
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

    this.dialog.open(AlunnoDetailsComponent, dialogConfig);

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
      console.log('The dialog was closed');
      console.log(result);
      if(result){
        this.svcALU_Alunni.deleteAlunno(element.id)
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
    this.displayedColumns = (event.target.innerWidth <= 800) ? ["nome", "cognome", "dtNascita", "email"] : ["nome", "cognome", "dtNascita", "indirizzo", "comune", "cap", "prov", "email", "telefono", "ckAttivo", "actionsColumn"];;
  }
}




  //per paginazione client side ma con datasource custom
  // ngAfterViewInit() {
  //   this.paginator.page
  //   //     .pipe(
  //   //         tap(() => this.loadAlunniPage())
  //   //     )
  //        .subscribe(
  //          () => this.loadAlunniPage(this.paginator.pageSize, this.paginator.pageIndex)
  //          //() => console.log (this.paginator.pageSize, this.paginator.pageIndex)
  //          );
  //          this.paginator.pageIndex = 1;
  // }



  //per paginazione client side ma con custom datasource
  // loadAlunniPage(pageSize: number, pageIndex: number) {
  //   console.log (pageSize, pageIndex);
  //   this.dsAlunni.loadAlunniPage(pageSize, pageIndex);
  // }


  //per filtro e paginazione server side
  // findAlunniPage() {
  //     //console.log (this.paginator.pageSize);
  //     this.dsAlunni.findAlunni(
  //         '',
  //         'asc',
  //         this.paginator.pageIndex,
  //         this.paginator.pageSize);
  // }

// PER PRENDERE ALCUNI ELEMENTI DELL'OBSERVABLE (tipo dal quinto al settimo)
      // .pipe (
      //   map(val => val.slice(this.startItem, this.endItem)),
      // )


    //NON USO IL FILE DATASOURCE MA PASSO DIRETTAMENTE L'OBSERVABLE DEL SERVICE COME DATASOURCE DELLA MATTABLE
    
    //this.dsAlunni.findAlunni('', 'asc', 0, 3); //filtro e pagination server side
    //this.loadAlunniPage(3, 0);***Questa si usava per passargli un custom datasource
    //this.loading$ = this.dsAlunni.loading$;***Questa si usava per passargli un custom datasource
    //this.dsAlunni.paginator = this.paginator;