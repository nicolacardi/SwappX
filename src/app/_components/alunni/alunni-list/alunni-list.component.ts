import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckbox } from '@angular/material/checkbox';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from '../alunni.service';
import { AlunnoEditComponent } from '../alunno-edit/alunno-edit.component';

import { LoadingService } from '../../utilities/loading/loading.service';
import { FiltriService } from '../../utilities/filtri/filtri.service';


@Component({
  selector:     'app-alunni-list',
  templateUrl:  './alunni-list.component.html',
  styleUrls:    ['../alunni.css']
})

export class AlunniListComponent implements OnInit {
  
  matDataSource = new MatTableDataSource<ALU_Alunno>();
  displayedColumns: string[] =  [];
  displayedColumnsAlunniList: string[] = [
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
  displayedColumnsClassiDashboard: string[] = [
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
                                    ];

  selection = new SelectionModel<ALU_Alunno>(true, []);   //rappresenta la selezione delle checkbox

  matSortActive!:       string;
  matSortDirection!:    string;
  public idGenitore!:   number;
  public page!:         string;
  menuTopLeftPosition =  {x: '0', y: '0'} 
  idAlunniChecked:      number[] = [];
  toggleChecks:         boolean = false;

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

    this._filtriService.getPage().subscribe(val=>{
      this.page = val;
      //console.log("alunni-list - ngOnInit getPage: la pagina attuale è: "+val);
      });
    
    if (this.page == "alunniList") 
      this.displayedColumns =  this.displayedColumnsAlunniList;
    else 
      this.displayedColumns =  this.displayedColumnsClassiDashboard;

    if (this.page == "alunniList") {
      this._filtriService.getGenitore()
        .subscribe(
          val=>{
          this.idGenitore = val;
          //uno dei tre refresh parte qui: serve quando cambia il filtro idGenitore
          //console.log("alunni-list.component.ts - ngOnInit chiamata a this.refresh da getGenitore");
          this.refresh(); 
      });
    }
  }

  ngOnChanges() {
    //questo refresh vien lanciato due volte
    //serve perchè quando listAlunni è child di classiDashboard gli viene passato il valore di idClasse
    // e devo "sentire" in questo modo che deve refreshare
    //console.log("alunni-list.component.ts - ngOnChanges chiamata a this.refresh ");
    this.refresh(); 
    this.toggleChecks = false;
    this.resetSelections();
  }
  
  refresh () {

    let obsAlunni$: Observable<ALU_Alunno[]>;
    if (this.page == "classiDashboard") {
      
      obsAlunni$= this.svcAlunni.loadByClasse(this.idClasse);
      console.log("alunni-list.component.ts - this.refresh - caso 1");

    } else {
      if(this.idGenitore && this.idGenitore != undefined  && this.idGenitore != null && this.idGenitore != 0) {
        obsAlunni$= this.svcAlunni.loadByGenitore(this.idGenitore);
        console.log("alunni-list.component.ts - this.refresh - caso 2");
      } else {
        //purtroppo passa di qua anche quando sta caricando all'inizio, non ha ancora il numero di pagina (getPage non dà ancora valore)
        //e quindi inizialmente passa di qua comunque
        obsAlunni$= this.svcAlunni.load();
        console.log("alunni-list.component.ts - this.refresh - caso 3: this.page = "+this.page);
      }
    }
    
    if (this.page != undefined && this.page != "" && this.page != null) {
      console.log("alunni-list.component.ts - refresh : carico di loadAlunni$. this.page = "+this.page);
      const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);

      loadAlunni$.subscribe(val => 
        {
          // var caller_page = this.route.snapshot.queryParams["page"];
          // var caller_size = this.route.snapshot.queryParams["size"];
          // var caller_filter = this.route.snapshot.queryParams["filter"];
          // var caller_sortField = this.route.snapshot.queryParams["sortField"];
          // var caller_sortDirection = this.route.snapshot.queryParams["sortDirection"];
          
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.matDataSource.sort = this.sort;
          this.matDataSource.filterPredicate = this.createFilter();

          // if(caller_page != undefined ){
          //   if (caller_sortDirection) {
          //     this.sort.sort(({ id: caller_sortField, start: caller_sortDirection}) as MatSortable);
          //   }
          //   this.paginator.pageIndex = caller_page;
          //   this.paginator.pageSize = caller_size;
          //   this.filterInput.nativeElement.value = caller_filter;
          //   this.matDataSource.filter = caller_filter;
          // }
        }
      );
    }
  }


  createFilter(): (data: any, filter: string) => boolean {
    //la stringa che cerco è 'filter'
    
    let filterFunction = function(data: any, filter: any): boolean {
      //JSON.parse normalizza la stringa e la trasforma in un oggetto javascript
      let searchTerms = JSON.parse(filter);
      //data è uno a uno rappresentato dai record del matDataSource
      //console.log ("data", data);
     //viene ritornato un boolean che è la AND di tutte le ricerche, su ogni singolo campo
     //infatti data.nome.toLowerCase().indexOf(searchTerms.nome) !== -1 ritorna truese search.Terms.nome viene trovato nel campo nome di data
      console.log("data.dtNascita", String(data.dtNascita));
      return String(data.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
        && String(data.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
        && String(data.dtNascita).indexOf(searchTerms.annoNascita) !== -1
        && String(data.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
        && String(data.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
        && String(data.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
        //se trova dei valori NULL .toString() va in difficoltà (ce ne sono in telefono e email p.e.) per cui sono passato a String(...)
        && String(data.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
        && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1;
    }
    return filterFunction;
  }

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '620px',
      data: 0
    };

    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.refresh();
    });
  }

  openDetail(id:any){
    //***** Versione Router
    // this.router.navigate(["alunni",id], {queryParams:{page: this.paginator.pageIndex,
    //                                                   size: this.paginator.pageSize,  
    //                                                   filter: this.filterInput.nativeElement.value,
    //                                                   sortField: this.matDataSource.sort?.active,
    //                                                   sortDirection: this.matDataSource.sort?.direction
    //                                                 }});

    //***** Versione Dialog
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '620px',
      data: id
    };

    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.refresh();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
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

  //questo metodo ritorna un booleano che dice se sono selezionati tutti i record o no
  //per ora non lo utilizzo
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
    this.toggleChecks = !this.toggleChecks;

    if (this.toggleChecks) {
      this.selection.select(...this.matDataSource.data);
    } else {
      this.resetSelections();
    }
  }

  resetSelections() {
    this.selection.clear();
    this.matDataSource.data.forEach(row => this.selection.deselect(row));
  }
  selectedRow(element: ALU_Alunno) {
    this.selection.toggle(element); //questa riga è FONDAMENTALE! E' QUELLA CHE POPOLA LA SELECTION.SELECTED
    console.log("alunni-list.component.ts - selectedRow: this.getChecked=", this.getChecked());
  }

  getChecked() {
    return this.selection.selected;
  }
}


  // RemoveElementFromArray(element: number) {
  //   this.idAlunniChecked.forEach((value,index)=>{
  //       if(value==element) this.idAlunniChecked.splice(index,1);
  //   });
  // }


// deleteDetail(element: any, event: Event){
  
//   const dialogRef = this._dialog.open(DialogYesNoComponent, {
//     width: '320px',
//     data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
//   });

//   dialogRef.afterClosed().subscribe(result => {
//     if(result){
//       this.svcAlunni.delete(element.id)
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