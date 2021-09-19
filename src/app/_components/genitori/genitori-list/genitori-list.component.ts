import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { map } from 'rxjs/operators';

import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { GenitoriService } from '../genitori.service';
import { GenitoreEditComponent } from '../genitore-edit/genitore-edit.component';
import { GenitoriFilterComponent } from '../genitori-filter/genitori-filter.component';

import { LoadingService } from '../../utilities/loading/loading.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';

@Component({
  selector: 'app-genitori-list',
  templateUrl: './genitori-list.component.html',
  styleUrls: ['../genitori.css']
})

export class GenitoriListComponent implements OnInit {
  
  matDataSource = new MatTableDataSource<ALU_Genitore>();
  storedFilterPredicate!:       any;

  displayedColumns = ["actionsColumn", 
                      "nome", 
                      "cognome", 
                      "tipo", 
                      "indirizzo", 
                      "telefono", 
                      "email", 
                      "dtNascita" ];

  matSortActive!:     string;
  matSortDirection!:  string;

  //public idAlunno!:   number;  //alunnoInput viene passato a alunnoHeader qualora ricevuto

  public passedAlunno!:       string;
  public page!:                 string;
  menuTopLeftPosition =  {x: '0', y: '0'} 
  //idGenitoriChecked:              number[] = [];
  //toggleChecks:                 boolean = false;
  //public swSoloAttivi : boolean = true;

   //filterValues contiene l'elenco dei filtri avanzati da applicare 
   filterValues = {
    nome: '',
    cognome: '',
    annoNascita: '',
    indirizzo: '',
    comune: '',
    prov: '',
    email: '',
    telefono: '',
    nomeCognomeAlunno: ''
  };

  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger;

  @Input() genitoriFilterComponent!: GenitoriFilterComponent;

  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();

  constructor(private svcGenitori:                GenitoriService,
                        private route:            ActivatedRoute,
                        private router:           Router,
                        public _dialog:           MatDialog, 
                        private _loadingService:  LoadingService,
                        private _navigationService:    NavigationService
                        ) {
  }

  ngOnChanges() {
    this._navigationService.getPage().subscribe(val=>{
      this.page = val;
      this.loadData(); 
      //this.toggleChecks = false;
      //this.resetSelections();
    })
  }

  ngOnInit () {
    
    /*
    this._navigationService.passPage("genitoriList");

    this.displayedColumns = (window.innerWidth <= 800) ? ["actionsColumn", "nome", "cognome", "telefono", "email","dtNascita"] : ["actionsColumn", "nome", "cognome", "tipo","indirizzo", "telefono", "email","dtNascita"];

    this._navigationService.getAlunno()
      .subscribe(
        val=>{
        this.idAlunno = val;
        this.refresh();
    });
    */
      this._navigationService.getAlunno().subscribe(
        val=>{
        if (val!= '') {
          this.passedAlunno = val;
          this.toggleDrawer.emit();
          this.genitoriFilterComponent.nomeCognomeAlunnoFilter.setValue(val);
          this.loadData(); 
        }
      });    
  }

  loadData () {

    let obsGenitori$: Observable<ALU_Genitore[]>;
    // if(this.swSoloAttivi){
    //   obsAlunni$= this.svcAlunni.loadWithParents()
    //     .pipe(map(res=> res.filter((x) => x.ckAttivo == true)));
    // }
    // else
        obsGenitori$= this.svcGenitori.loadWithChildren();

    /*
    if(this.idAlunno && this.idAlunno != undefined  && this.idAlunno != null && this.idAlunno != 0) {
      obsGenitori$= this.svcGenitori.loadByAlunno(this.idAlunno);
    } else {
      obsGenitori$= this.svcGenitori.load();
    }
    */
    const loadGenitori$ =this._loadingService.showLoaderUntilCompleted(obsGenitori$);

    loadGenitori$.subscribe(val => 
      {
        // var caller_page = this.route.snapshot.queryParams["page"];
        // var caller_size = this.route.snapshot.queryParams["size"];
        // var caller_filter = this.route.snapshot.queryParams["filter"];
        // var caller_sortField = this.route.snapshot.queryParams["sortField"];
        // var caller_sortDirection = this.route.snapshot.queryParams["sortDirection"];
  
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort;
        this.storedFilterPredicate = this.matDataSource.filterPredicate;
        this.matDataSource.filterPredicate = this.createFilter();

        // if(caller_page != undefined ){
        //   if (caller_sortDirection) {
        //     this.sort.sort(({ id: caller_sortField, start: caller_sortDirection}) as MatSortable);
        //   }
        //   this.paginator.pageIndex = caller_page;
        //   this.paginator.pageSize = caller_size;
        //   this.filterInput.nativeElement.value = caller_filter;
        //   this.matDataSource.filter = caller_filter;
      }
    );
  }

  createFilter(): (data: any, filter: string) => boolean {
    //la stringa che cerco è 'filter'

    let filterFunction = function(data: any, filter: any): boolean {
    
     //console.log("filter: " , filter);

      //JSON.parse normalizza la stringa e la trasforma in un oggetto javascript
      let searchTerms = JSON.parse(filter);
      //data è uno a uno rappresentato dai record del matDataSource
     //viene ritornato un boolean che è la AND di tutte le ricerche, su ogni singolo campo
     //infatti data.nome.toLowerCase().indexOf(searchTerms.nome) !== -1 ritorna truese search.Terms.nome viene trovato nel campo nome di data

      let foundAlunno : boolean = false;
      if (Object.values(searchTerms).every(x => x === null || x === '')) 
        foundAlunno = true;
      else {
        console.log(data);
        data._Figli?.forEach((val: { alunno: { nome: any; cognome: any}; })=>  {
          console.log("val", val);
            const foundCognomeNome = foundAlunno || String(val.alunno.cognome+" "+val.alunno.nome).toLowerCase().indexOf(searchTerms.nomeCognomeAlunno) !== -1;
            const foundNomeCognome = foundAlunno || String(val.alunno.nome+" "+val.alunno.cognome).toLowerCase().indexOf(searchTerms.nomeCognomeAlunno) !== -1; 
            foundAlunno = foundCognomeNome || foundNomeCognome;
        })
      }

      return String(data.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
        && String(data.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
        && String(data.dtNascita).indexOf(searchTerms.annoNascita) !== -1
        && String(data.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
        && String(data.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
        && String(data.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
        //se trova dei valori NULL .toString() va in difficoltà (ce ne sono in telefono e email p.e.) per cui sono passato a String(...)
        && String(data.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
        && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1
        && foundAlunno;
    }
    return filterFunction;
  }

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: 0
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
  }
  
  openDetail(id:any){
    // //***** Versione Router
    // this.router.navigate(["genitori",id], {queryParams:{page: this.paginator.pageIndex,
    //                                                   size: this.paginator.pageSize,  
    //                                                   filter: this.filterInput.nativeElement.value,
    //                                                   sortField: this.matDataSource.sort?.active,
    //                                                   sortDirection: this.matDataSource.sort?.direction
    //                                                 }});

    //***** Versione Dialog
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: id
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
  }

  applyFilter(event: Event) {
    //al SOLO primo carattere devo:
    //1. resettare il filterpredicate
    //2. cancellare tutti i filtri

    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.length == 1) {
      //ripristino il filterPredicate iniziale, precedentemente salvato in storedFilterPredicate
      this.matDataSource.filterPredicate = this.storedFilterPredicate;
      this.genitoriFilterComponent.resetAllInputs();
    }
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  onResize(event: any) {
    this.displayedColumns = (event.target.innerWidth <= 800) ?  
                      ["actionsColumn",
                      "nome", 
                      "cognome", 
                      "telefono",
                      "email",
                      "dtNascita"] 
                      : 
                      ["actionsColumn", 
                      "nome", 
                      "cognome", 
                      "tipo",
                      "indirizzo", 
                      "telefono", 
                      "email",
                      "dtNascita"];

  }

  onRightClick(event: MouseEvent, element: ALU_Genitore) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  } 

  openAlunni(item: ALU_Genitore) {
    this._navigationService.passGenitore(item.nome+" "+item.cognome);
    this.router.navigateByUrl("/alunni");
  }

  // toggleAttivi(){
  //   this.swSoloAttivi = !this.swSoloAttivi;
  //   this.loadData();
  // }
}

