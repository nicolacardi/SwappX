import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from '../../../_services/alunni.service';
import { AlunnoDetailsComponent } from '../alunno-details/alunno-details.component';

import { LoadingService } from '../../utilities/loading/loading.service';
import { FiltriService } from '../../utilities/filtri/filtri.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector:     'app-alunni-list',
  templateUrl:  './alunni-list.component.html',
  styleUrls:    []
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
  
  matDataSource = new MatTableDataSource<ALU_Alunno>();
  displayedColumns: string[] =  [
                                "select",
                                "actionsColumn", 
                                "nome", 
                                "cognome", 
                                "dtNascita", 
                                "indirizzo", 
                                "comune", 
                                "cap", 
                                "prov", 
                                "email", 
                                "telefono", 
                                "ckAttivo" ];

  selection = new SelectionModel<ALU_Alunno>(true, []);   //rappresenta la selezione delle checkbox

  

  //expandedElement!: ALU_Alunno | null;      //expanded
  matSortActive!:     string;
  matSortDirection!:  string;
  public idGenitore!: number;
  public page$!:       Observable<string>;
  menuTopLeftPosition =  {x: '0', y: '0'} 

  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() idClasse!: number;

  constructor(private svcAlunni:        AlunniService,
              private route:            ActivatedRoute,
              private router:           Router,
              public _dialog:           MatDialog, 
              private _loadingService:  LoadingService,
              private _filtriService:   FiltriService
              ) {

                
              }
  
  
  ngOnInit () {

    this._filtriService.passPage("alunniList");

    // this.displayedColumns = (window.innerWidth <= 800) ? [
    //             "select", 
    //             "actionsColumn", 
    //             "nome",
    //             "cognome",
    //             "dtNascita", 
    //             "email"] 
    //             : 
    //             ["select",
    //             "actionsColumn", 
    //             "nome", 
    //             "cognome", 
    //             "dtNascita", 
    //             "indirizzo", 
    //             "comune", 
    //             "cap", 
    //             "prov", 
    //             "email", 
    //             "telefono", 
    //             "ckAttivo"];

    this.displayedColumns = [
                "select",
                "actionsColumn", 
                "nome", 
                "cognome", 
                "dtNascita", 
                "indirizzo", 
                "comune", 
                "cap", 
                "prov", 
                "email", 
                "telefono", 
                "ckAttivo"];

    this._filtriService.getGenitore()
      .subscribe(
        val=>{
        this.idGenitore = val;
        this.refresh();
    });


  }

  ngOnChanges() {
    this.refresh();
  }
  

  refresh () {
        
    let obsAlunni$: Observable<ALU_Alunno[]>;

    if(this.idGenitore && this.idGenitore != undefined  && this.idGenitore != null && this.idGenitore != 0) {
      obsAlunni$= this.svcAlunni.loadAlunniByGenitore(this.idGenitore);
    } else if (this.idClasse && this.idClasse != undefined  && this.idClasse != null && this.idClasse != 0) {
      obsAlunni$= this.svcAlunni.loadAlunniByClasse(this.idClasse);
    } else {
      obsAlunni$= this.svcAlunni.loadAlunni();
    }

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
    //***** Versione Router
    this.router.navigate(["alunni",id], {queryParams:{page: this.paginator.pageIndex,
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
    //const dialogConfig = new MatDialogConfig();
    //dialogConfig.disableClose = true; //lo farebbe non chiudibile cliccando altrove
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '620px',
      data: 0
    };



    const dialogRef = this._dialog.open(AlunnoDetailsComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.refresh();
    });
  }

  onResize(event: any) {
    this.displayedColumns = (event.target.innerWidth <= 800) ? 
                      ["select", 
                      "actionsColumn", 
                      "nome", 
                      "cognome", 
                      "dtNascita", 
                      "email"] 
                      : 
                      ["select", 
                      "actionsColumn", 
                      "nome", 
                      "cognome", 
                      "dtNascita", 
                      "indirizzo", 
                      "comune", 
                      "cap", 
                      "prov", 
                      "email", 
                      "telefono", 
                      "ckAttivo"];;
  }

  onRightClick(event: MouseEvent, element: ALU_Alunno) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  openGenitori(id: number) {
    this._filtriService.passAlunno(id);
    this.router.navigateByUrl("/genitori");
  }

  //questo metodo ritorna un booleano che dice se sono selezionati tutti i recordo o no
  isAllSelected() {
    const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
    const numRows = this.matDataSource.data.length;       //conta il numero di elementi del matDataSource
    return numSelected === numRows;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
  }

  //non so se serva questo metodo: genera un valore per l'aria-label...
  //forse serve per poi pescare i valori selezionati?
  checkboxLabel(row?: ALU_Alunno): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  //seleziona/deseleziona tutti i record
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.matDataSource.data);
  }

  selectedRow(row: number) {
    //a seconda che resti almeno un elemento selezionato o meno deve comparei l'icona della cancellazioneo rimozione dell'alunno
    //deve però comparire IN ALUNNI LIST se siamo nella piena pagina e IN DASHBOARD CLASSI se siamo in quella pagina.
    console.log(row);
    console.log(this._filtriService.getPage().subscribe(val=>console.log(val)));
  }

}





// deleteDetail(element: any, event: Event){
  
//   const dialogRef = this._dialog.open(DialogYesNoComponent, {
//     width: '320px',
//     data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
//   });

//   dialogRef.afterClosed().subscribe(result => {
//     if(result){
//       this.svcAlunni.deleteAlunno(element.id)
//       .subscribe(
//         res=>{    
//           this._snackBar.openFromComponent(SnackbarComponent,
//             {data: 'Alunno ' + element.nome + ' '+ element.cognome + ' cancellato', panelClass: ['red-snackbar'] });
//             this.refresh();
//         },
//         err=> (
//             console.log("ERRORE")
//         )
//       );
//     }
//   });
//   event.stopPropagation(); 
// }