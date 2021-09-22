import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from '../alunni.service';
import { AlunnoEditComponent } from '../alunno-edit/alunno-edit.component';
import { AlunniFilterComponent } from '../alunni-filter/alunni-filter.component';
import { RettaEditComponent } from '../../pagamenti/retta-edit/retta-edit.component';

import { LoadingService } from '../../utilities/loading/loading.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';

@Component({
  selector:     'app-alunni-list',
  templateUrl:  './alunni-list.component.html',
  styleUrls:    ['../alunni.css']
})

export class AlunniListComponent implements OnInit {
  
  matDataSource = new MatTableDataSource<ALU_Alunno>();
  storedFilterPredicate!:       any;

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
      "ckAttivo"
  ];
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
  displayedColumnsGenitoreEditFamiglia: string[] = [
    "actionsColumn", 
    "nome", 
    "cognome", 
    "dtNascita", 
    "email", 
    "telefono", 
  ];
  selection = new SelectionModel<ALU_Alunno>(true, []);   //rappresenta la selezione delle checkbox

  matSortActive!:               string;
  matSortDirection!:            string;

  public passedGenitore!:       string;
  public page!:                 string;

  menuTopLeftPosition =  {x: '0', y: '0'} 
  idAlunniChecked:              number[] = [];
  toggleChecks:                 boolean = false;
  showPageTitle:                boolean = true;
  showTableRibbon:              boolean = true;
  public swSoloAttivi :         boolean = true;


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
    nomeCognomeGenitore: ''
  };

  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() idClasse!: number;
  @Input() alunniFilterComponent!: AlunniFilterComponent;
  @Input('dove') dove! :                                      string;
  @Input('genitoreId') genitoreId! :                          number;


  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();

  constructor(private svcAlunni:        AlunniService,
              private router:           Router,
              public _dialog:           MatDialog, 
              private _loadingService:  LoadingService,
              private _navigationService:   NavigationService
              ) {
  }
  
  ngOnChanges() {
    //mentre classiDashboard ripassa per ngOnChanges quando idClasse gli arriva (è una @Input)
    //alunniList non ci ripassa.
    //il problema è che this.page potrebbe essere ancora undefined 
    //(perchè poi? visto che viene settato sia da alunniPage che da classiDahsboard su ngOnInit come prima cosa?)


    //ngOnChanges serve perchè quando listAlunni è child di classiDashboard gli viene passato il valore di idClasse
    // e devo "sentire" in questo modo che deve refreshare

    //if (this.page == 'classiDashboard'  ) {

      //lanciamo loadData SOLO una volta che sia arrivata la this.page.
      //this.page non arriva, nel caso in cui page = ClassiDashboard
      //fintanto che la @Input idClasse non è stata settata
      //se non mettessimo questa if la loadData partirebbe una volta con this.page = undefined
      //e POI una seconda volta quando idClasse è stato settato e quindi anche this.page: non andrebbe bene

          // this._navigationService.getPage().subscribe(val=>{
          //   this.page = val;
          //   this.loadData(); 
          //   this.toggleChecks = false;
          //   this.resetSelections();
          // })

      if (this.dove != ''){
        this.loadData();
        this.toggleChecks = false;
        this.resetSelections();
      }

    //}
  }
  
  ngOnInit () {

    //in ngOnInit mettiamo SOLO le displayedColumn e l'estrazione del Genitore che,
    // qualora ci fosse nel caso alunniList, va caricato solo su ngOnInit, una sola volta
    if (this.dove == "alunni-page") {
    //if (this.page == "alunniPage") {
        

        this._navigationService.getGenitore().subscribe(
          val=>{
          if (val!= '') {
            this.passedGenitore = val;
            this.toggleDrawer.emit();
            this.alunniFilterComponent.nomeCognomeGenitoreFilter.setValue(val);
            this.loadData(); 
          }
        });
    }

    if (this.dove == "genitore-edit-famiglia" || this.dove == "genitore-edit-list") {
      this.showPageTitle = false;
    }
    if (this.dove == "genitore-edit-famiglia") {  
      this.showTableRibbon = false;
    }

    switch(this.dove) {
      case 'alunni-page': this.displayedColumns =  this.displayedColumnsAlunniList;; break;
      case 'genitore-edit-famiglia': this.displayedColumns = this.displayedColumnsGenitoreEditFamiglia; break;
      default: this.displayedColumns =  this.displayedColumnsClassiDashboard;
    }


  }

  loadData () {
    let obsAlunni$: Observable<ALU_Alunno[]>;
    if (this.dove == "classi-dashboard" && this.idClasse != undefined) {
      obsAlunni$= this.svcAlunni.loadByClasse(this.idClasse);
      const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);

      loadAlunni$.subscribe(val => 
        {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.matDataSource.sort = this.sort; 
        }
      );
    } 
    
    //if (this.page == "alunniPage") {
    if (this.dove =="alunni-page") {
      if(this.swSoloAttivi){
        obsAlunni$= this.svcAlunni.loadWithParents()
          .pipe(map(res=> res.filter((x) => x.ckAttivo == true)));
      }
      else {
        obsAlunni$= this.svcAlunni.loadWithParents();
      }

      const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);

      loadAlunni$.subscribe(val => 
        {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.matDataSource.sort = this.sort; 
          this.storedFilterPredicate = this.matDataSource.filterPredicate;
          this.matDataSource.filterPredicate = this.createFilter();
        }
      );
    }

    if (this.dove == "genitore-edit-famiglia") {
      obsAlunni$= this.svcAlunni.loadByGenitore(this.genitoreId);
      const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);

      loadAlunni$.subscribe(val => 
        {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.matDataSource.sort = this.sort; 
        }
      );
    }


  }

  createFilter(): (data: any, filter: string) => boolean {
    //la stringa che cerco è 'filter'

    let filterFunction = function(data: any, filter: any): boolean {
    
     // console.log("filter: " , filter);

      //JSON.parse normalizza la stringa e la trasforma in un oggetto javascript
      let searchTerms = JSON.parse(filter);
      //data è uno a uno rappresentato dai record del matDataSource
     //viene ritornato un boolean che è la AND di tutte le ricerche, su ogni singolo campo
     //infatti data.nome.toLowerCase().indexOf(searchTerms.nome) !== -1 ritorna truese search.Terms.nome viene trovato nel campo nome di data

      let foundGenitore : boolean = false;
      if (Object.values(searchTerms).every(x => x === null || x === '')) 
        foundGenitore = true;
      else {    
        data._Genitori?.forEach((val: { genitore: { nome: any; cognome: any}; })=>  {   
            const foundCognomeNome = foundGenitore || String(val.genitore.cognome+" "+val.genitore.nome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1;
            const foundNomeCognome = foundGenitore || String(val.genitore.nome+" "+val.genitore.cognome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1; 
            foundGenitore = foundCognomeNome || foundNomeCognome;
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
        && foundGenitore;
    }
    return filterFunction;
  }

  //NON DOVREBBE SERVIRE, ELIINARE
  concatenaFindGenitori(data: any, searchTerms: any): boolean{
    let found : boolean;
    //per ogni genitore trovato vado a concatenare la || di true. Quelli non trovati fanno la || di false quindi non aggiungono niente
    data._Genitori?.forEach((val: { genitore: { nome: any; }; })=>    (   
        found = found || String(val.genitore.nome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore)  !== -1   ))
    
    //alla fine found conterrà true se almeno un genitore viene trovato e false altrimenti
    return found!;
  }

  addRecord(){
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
  }

  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: id
    };

    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
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
      this.alunniFilterComponent.resetAllInputs();
    }
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
                      "ckAttivo"];
  }

  onRightClick(event: MouseEvent, element: ALU_Alunno) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  openGenitori(item: ALU_Alunno) {
    this._navigationService.passAlunno(item.nome+" "+item.cognome);
    this.router.navigateByUrl("/genitori");
  }

  openPagamenti(alunnoID: number){

    let anno = 1; //TODO questa sarà un default da mettere nei parametri
    const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '850px',
        height: '680px',
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
    if (!row) 
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    else
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  //seleziona/deseleziona tutti i record
  masterToggle() {
    this.toggleChecks = !this.toggleChecks;

    if (this.toggleChecks) 
      this.selection.select(...this.matDataSource.data);
    else 
      this.resetSelections();
  }

  resetSelections() {
    this.selection.clear();
    this.matDataSource.data.forEach(row => this.selection.deselect(row));
  }
  selectedRow(element: ALU_Alunno) {
    this.selection.toggle(element);
    console.log("alunni-list.component.ts - selectedRow: this.getChecked=", this.getChecked());
  }

  getChecked() {
    return this.selection.selected;
  }

  toggleAttivi(){
    this.swSoloAttivi = !this.swSoloAttivi;
    this.loadData();
  }
}

