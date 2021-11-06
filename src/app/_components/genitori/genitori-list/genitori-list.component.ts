import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, pipe } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

//components
import { GenitoreEditComponent } from '../genitore-edit/genitore-edit.component';
import { GenitoriFilterComponent } from '../genitori-filter/genitori-filter.component';

//services
import { GenitoriService } from '../genitori.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { AlunniService } from '../../alunni/alunni.service';

//models
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';

@Component({
  selector: 'app-genitori-list',
  templateUrl: './genitori-list.component.html',
  styleUrls: ['../genitori.css']
})

export class GenitoriListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<ALU_Genitore>();
  storedFilterPredicate!:       any;

  displayedColumns: string[] =  [];
  displayedColumnsAlunnoEditFamiglia: string[] = [
      "actionsColumn", 
      "nome", 
      "cognome",
      "tipo",
      "telefono", 
      "email",
      "dtNascita",
      "removeFromFam" 
    ];
  displayedColumnsAlunnoEditList: string[] = [
      "actionsColumn", 
      "nome", 
      "cognome",
      "tipo",
      "telefono", 
      "email",
      "dtNascita",
      "addToFam" 
  ];
  displayedColumnsGenitoriPage = [
    "actionsColumn", 
    "nome", 
    "cognome", 
    "tipo", 
    "indirizzo", 
    "telefono", 
    "email", 
    "dtNascita"
   ];

  showPageTitle:                boolean = true;
  showTableRibbon:              boolean = true;

  public passedAlunno!:       string;
  public page!:                 string;
  menuTopLeftPosition =  {x: '0', y: '0'} 

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
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger;

  @Input('dove') dove! :                                      string;
  @Input('alunnoId') alunnoId! :                              number;
  @Input() genitoriFilterComponent!: GenitoriFilterComponent;

  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
  @Output('addToFamily') addToFamily = new EventEmitter<ALU_Genitore>();
  @Output('removeFromFamily') removeFromFamily = new EventEmitter<ALU_Genitore>();
//#endregion

  constructor(
                        private svcGenitori:      GenitoriService,
                        private svcAlunni:        AlunniService,
                        private route:            ActivatedRoute,
                        private router:           Router,
                        public _dialog:           MatDialog, 
                        private _loadingService:  LoadingService,
                        private _navigationService:    NavigationService
                        ) {
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    // this._navigationService.getPage().subscribe(val=>{
    //   this.page = val;
    //   this.loadData(); 
    // })
    if (this.dove != ''){
      this.loadData();
    }
  }

  ngOnInit () {

    if (this.dove == "alunno-edit-list" || this.dove == "alunno-edit-famiglia") {
      this.showPageTitle = false;
    }
    if (this.dove == "alunno-edit-famiglia") {
      this.showTableRibbon = false;
    }

    switch(this.dove) {
      case 'alunno-edit-list': this.displayedColumns = this.displayedColumnsAlunnoEditList; break;
      case 'alunno-edit-famiglia': this.displayedColumns = this.displayedColumnsAlunnoEditFamiglia; break;
      default: this.displayedColumns = this.displayedColumnsGenitoriPage;
    }

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

    if(this.dove == "alunno-edit-famiglia"){
      console.log("this.alunnoId sto per caricare solo l'alunno:", this.alunnoId);
      obsGenitori$= this.svcGenitori.loadByAlunno(this.alunnoId);

      //.pipe(map(res=> res.filter(gen => gen._Figli.some(y => (y.id == this.alunnoId)))));  //BELLISSIMA Sembra giusta ma non funziona
    }
    else {
      obsGenitori$= this.svcGenitori.loadWithChildren();
    }


    
    const loadGenitori$ =this._loadingService.showLoaderUntilCompleted(obsGenitori$);

    loadGenitori$.subscribe(val => 
      {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort;
        this.storedFilterPredicate = this.matDataSource.filterPredicate;
        this.matDataSource.filterPredicate = this.filterRightPanel();
      }
    );
  }
//#endregion

//#region ----- Filtri & Sort -------
  filterRightPanel(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
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
        && String(data.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
        && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1
        && foundAlunno;
    }
    return filterFunction;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.length == 1) {
      //ripristino il filterPredicate iniziale, precedentemente salvato in storedFilterPredicate
      this.matDataSource.filterPredicate = this.storedFilterPredicate;
      this.genitoriFilterComponent.resetAllInputs();
    }
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

//#endregion

//#region ----- Add Edit Drop -------
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click -------

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
//#endregion

//#region ----- Emit per alunno-edit -------

  addToFamilyEmit(item: ALU_Genitore) {
    this.addToFamily.emit(item);
  }

  removeFromFamilyEmit(item: ALU_Genitore) {
    this.removeFromFamily.emit(item);
  }
//#endregion

//#region ----- Altri metodi -------
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
//#endregion

}



//Per fare il resize
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