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
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

@Component({
  selector: 'app-genitori-list',
  templateUrl: './genitori-list.component.html',
  styleUrls: ['../genitori.css']
})

export class GenitoriListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<ALU_Genitore>();

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

  rptTitle = 'List Genitori';
  rptFileName = 'ListaGenitori';

  rptFieldsToKeep  = [
    "nome", 
    "cognome", 
    "tipo", 
    "indirizzo", 
    "telefono", 
    "email", 
    "dtNascita"];

  rptColumnsNames  = [
    "nome", 
    "cognome", 
    "tipo", 
    "indirizzo", 
    "telefono", 
    "email", 
    "nato il"];


  public passedAlunno!:         string;
  public page!:                 string;
  
  menuTopLeftPosition =  {x: '0', y: '0'} 

  showPageTitle:                boolean = true;
  showTableRibbon:              boolean = true;

  filterValue = '';       //Filtro semplice
   //filterValues contiene l'elenco dei filtri avanzati da applicare 
   filterValues = {
    nome: '',
    cognome: '',
    dtNascita: '',
    indirizzo: '',
    comune: '',
    prov: '',
    email: '',
    telefono: '',
    nomeCognomeAlunno: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger;

  @Input() genitoriFilterComponent!: GenitoriFilterComponent;
  @Input('context') context! :                                string;
  @Input('alunnoID') alunnoID! :                              number;

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
  ) {}

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    if (this.context != '')
      this.loadData();
  }

  ngOnInit () {

    if (this.context == "alunno-edit-list" || this.context == "alunno-edit-famiglia") {
      this.showPageTitle = false;
    }
    if (this.context == "alunno-edit-famiglia") {
      this.showTableRibbon = false;
    }

    switch(this.context) {
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

    if(this.context == "alunno-edit-famiglia"){
      obsGenitori$= this.svcGenitori.listByAlunno(this.alunnoID);
      //.pipe(map(res=> res.filter(gen => gen._Figli.some(y => (y.id == this.alunnoID)))));  //BELLISSIMA Sembra giusta ma non funziona
    }
    else {
      obsGenitori$= this.svcGenitori.listWithChildren();
    }
    const loadGenitori$ =this._loadingService.showLoaderUntilCompleted(obsGenitori$);

    loadGenitori$.subscribe(
      val =>   {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort;
        this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
  }
//#endregion

//#region ----- Filtri & Sort -------
  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    //this.genitoriFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      let foundAlunno : boolean = false;
      
      //if (Object.values(searchTerms).every(x => x === null || x === '')) 
      if (data._Figli.length == 0)
        foundAlunno = true;
      else {
        data._Figli?.forEach((val : { alunno: { nome: any; cognome: any}; })=>  {
            const foundCognomeNome = foundAlunno || String(val.alunno.cognome+" "+val.alunno.nome).toLowerCase().indexOf(searchTerms.nomeCognomeAlunno) !== -1;
            const foundNomeCognome = foundAlunno || String(val.alunno.nome+" "+val.alunno.cognome).toLowerCase().indexOf(searchTerms.nomeCognomeAlunno) !== -1; 
            foundAlunno = foundCognomeNome || foundNomeCognome;
        })
      }

      let dArr = data.persona.dtNascita.split("-");
      const dtNascitaddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];


      let boolSx = String(data.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(dtNascitaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.indirizzo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.comune).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.prov).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.telefono).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1

      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.persona.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.persona.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && String(dtNascitaddmmyyyy).indexOf(searchTerms.dtNascita) !== -1
                && String(data.persona.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
                && String(data.persona.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
                && String(data.persona.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
                && String(data.persona.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
                && String(data.persona.email).toLowerCase().indexOf(searchTerms.email) !== -1
                && foundAlunno;
      return boolSx && boolDx;

    }
    return filterFunction;
  }



//#endregion

//#region ----- Add Edit Drop -------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: 0
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }
  
  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: id
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        () => this.loadData()
    );
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
    this._navigationService.passGenitore(item.persona.nome+" "+item.persona.cognome);
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



}



//Per fare il resize
    /*
    this._navigationService.passPage("genitoriList");

    this.displayedColumns = (window.innerWidth <= 800) ? ["actionsColumn", "nome", "cognome", "telefono", "email","dtNascita"] : ["actionsColumn", "nome", "cognome", "tipo","indirizzo", "telefono", "email","dtNascita"];

    this._navigationService.getAlunno()
      .subscribe(
        val=>{
        this.alunnoID = val;
        this.refresh();
    });
    */