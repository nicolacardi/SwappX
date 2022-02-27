import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';

//components
import { AlunnoEditComponent } from '../alunno-edit/alunno-edit.component';
import { AlunniFilterComponent } from '../alunni-filter/alunni-filter.component';
import { RettaEditComponent } from '../../pagamenti/retta-edit/retta-edit.component';

//services
import { AlunniService } from '../alunni.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';

//classes
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

@Component({
  selector:     'app-alunni-list',
  templateUrl:  './alunni-list.component.html',
  styleUrls:    ['../alunni.css']
})

export class AlunniListComponent implements OnInit {

//#region ----- Variabili -------
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
      "ckAttivo"
  ];

  displayedColumnsGenitoreEditFamiglia: string[] = [
    "actionsColumn", 
    "nome", 
    "cognome", 
    "dtNascita", 
    "email", 
    "telefono", 
    "removeFromFam"
  ];

  displayedColumnsGenitoreEditList: string[] = [
    "actionsColumn", 
    "nome", 
    "cognome", 
    "dtNascita", 
    "email", 
    "telefono", 
    "addToFam"
  ];

  rptTitle = 'Lista Alunni';
  rptFileName = 'ListaAlunni';
  rptFieldsToKeep  = [
    "nome", 
    "cognome", 
    "dtNascita", 
    "indirizzo", 
    "comune", 
    "cap", 
    "prov", 
    "email", 
    "telefono", ];

  rptColumnsNames  = [
    "nome", 
    "cognome", 
    "nato il", 
    "indirizzo", 
    "comune", 
    "cap", 
    "prov", 
    "email", 
    "telefono", ];

  selection = new SelectionModel<ALU_Alunno>(true, []);   //rappresenta la selezione delle checkbox

  public passedGenitore!:       string;
  public page!:                 string;

  menuTopLeftPosition =  {x: '0', y: '0'} 
  idAlunniChecked:              number[] = [];
  
  toggleChecks:                 boolean = false;

  showPageTitle:                boolean = true;
  showTableRibbon:              boolean = true;
  public swSoloAttivi :         boolean = true;

  filterValue = '';       //Filtro semplice

  filterValues = {
    nome: '',
    cognome: '',
    dtNascita: '',
    indirizzo: '',
    comune: '',
    prov: '',
    email: '',
    telefono: '',
    nomeCognomeGenitore: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() idClasse!:                                         number;
  @Input() alunniFilterComponent!:                            AlunniFilterComponent;
  @Input('context') context! :                                string;
  @Input('genitoreId') genitoreId! :                          number;

  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
  @Output('addToFamily') addToFamily = new EventEmitter<ALU_Alunno>();
  @Output('removeFromFamily') removeFromFamily = new EventEmitter<ALU_Alunno>();

//#endregion

  constructor(
    private svcAlunni:        AlunniService,
    private router:           Router,
    public _dialog:           MatDialog, 
    private _loadingService:  LoadingService,
    private _navigationService:   NavigationService
  ) {}
  

//#region ----- LifeCycle Hooks e simili-------
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

      if (this.context != ''){
        this.loadData();
        this.toggleChecks = false;
        this.resetSelections();
      }
    //}
  }
  
  ngOnInit () {
    switch(this.context) {
      case 'alunni-page': 
        this.displayedColumns =  this.displayedColumnsAlunniList;
        this._navigationService.getGenitore().subscribe(
          val=>{
          if (val!= '') {
            this.passedGenitore = val;
            this.toggleDrawer.emit();
            this.alunniFilterComponent.nomeCognomeGenitoreFilter.setValue(val);
            this.loadData(); 
          }
        });
      break;
      case 'genitore-edit-famiglia':
        this.displayedColumns = this.displayedColumnsGenitoreEditFamiglia;
        this.showPageTitle = false;
        this.showTableRibbon = false;
      break;
      case 'genitore-edit-list':
        this.displayedColumns = this.displayedColumnsGenitoreEditList;
        this.showPageTitle = false;
      break;
      default: 
        this.displayedColumns =  this.displayedColumnsAlunniList;
    }
  }

  loadLayout(){
      //chiamata al WS dei layout con nome utente e nome griglia e contesto (variabile 'context')

      
      //se trovato, update colonne griglia
      //this.displayedColumns =  this.displayedColumnsAlunniList;

  }

  loadData () {
    let obsAlunni$: Observable<ALU_Alunno[]>;
    
    if (this.context =="alunni-page") {
      if(this.swSoloAttivi){
        obsAlunni$= this.svcAlunni.listWithParents()
          .pipe(map(res=> res.filter((x) => x.ckAttivo == true)));
      }
      else {
        obsAlunni$= this.svcAlunni.listWithParents();
      }

      const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);

      loadAlunni$.subscribe(val =>   {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
        }
      );
    }

    if (this.context == "genitore-edit-list") {
      obsAlunni$= this.svcAlunni.listWithParents();
      const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);
      loadAlunni$.subscribe(val => 
        {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
        }
      );
    }

    if (this.context == "genitore-edit-famiglia") {
      obsAlunni$= this.svcAlunni.listByGenitore(this.genitoreId);
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
//#endregion

//#region ----- Filtri & Sort -------
  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    //if (this.context == "alunni-page") this.alunniFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {

      let searchTerms = JSON.parse(filter);
      let foundGenitore : boolean = false;

      // if (Object.values(searchTerms).every(x => x === null || x === '')) 
      if (data._Genitori.length == 0) //restituiva false se i Genitori non c'erano: sbagliato
        foundGenitore = true;
      else {
        data._Genitori?.forEach((val: { genitore: { nome: any; cognome: any}; })=>  {   
            const foundCognomeNome = foundGenitore || String(val.genitore.cognome+" "+val.genitore.nome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1;
            const foundNomeCognome = foundGenitore || String(val.genitore.nome+" "+val.genitore.cognome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1; 
            foundGenitore = foundCognomeNome || foundNomeCognome;
        })
      }

      let dArr = data.dtNascita.split("-");
      const dtNascitaddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];


      let boolSx = String(data.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(dtNascitaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                || String(data.indirizzo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.comune).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.prov).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.telefono).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;
      
      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && String(dtNascitaddmmyyyy).indexOf(searchTerms.dtNascita) !== -1
                && String(data.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
                && String(data.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
                && String(data.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
                && String(data.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
                && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1
                && foundGenitore;

                // console.log(data, searchTerms, boolSx, boolDx);
                // console.log("nome",String(data.nome).toLowerCase().indexOf(searchTerms.nome));
                // console.log("cognome",String(data.cognome).toLowerCase().indexOf(searchTerms.cognome));
                // console.log("dtNacsita",String(dtNascitaddmmyyyy).indexOf(searchTerms.dtNascita));
                // console.log("indirizzo",String(data.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo));
                // console.log("comune", String(data.comune).toLowerCase().indexOf(searchTerms.comune));
                // console.log("prov",String(data.prov).toLowerCase().indexOf(searchTerms.prov));
                // console.log("telefono",String(data.telefono).toLowerCase().indexOf(searchTerms.telefono));
                // console.log("email",String(data.email).toLowerCase().indexOf(searchTerms.email));
                //console.log("cognome", data.cognome, "foundGenitore",foundGenitore);

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
      height: '650px',
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
      height: '650px',
      data: id
    };
    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => { 
        this.loadData(); 
      }
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click -------
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
        height: '700px',
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
//#endregion

//#region ----- Emit per alunno-edit -------
addToFamilyEmit(item: ALU_Alunno) {
  this.addToFamily.emit(item);
}

removeFromFamilyEmit(item: ALU_Alunno) {
  this.removeFromFamily.emit(item);
}

//#endregion

//#region ----- Gestione Campo Checkbox -------
  selectedRow(element: ALU_Alunno) {
    this.selection.toggle(element);
  }

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

  toggleAttivi(){
    this.swSoloAttivi = !this.swSoloAttivi;
    this.loadData();
  }

  getChecked() {
    //funzione usata da classi-dahsboard
    return this.selection.selected;
  }

    //non so se serva questo metodo: genera un valore per l'aria-label...
  //forse serve per poi pescare i valori selezionati?
  checkboxLabel(row?: ALU_Alunno): string {
    if (!row) 
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    else
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  //questo metodo ritorna un booleano che dice se sono selezionati tutti i record o no
  //per ora non lo utilizzo
  isAllSelected() {
    const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
    const numRows = this.matDataSource.data.length;       //conta il numero di elementi del matDataSource
    return numSelected === numRows;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
  }
//#endregion

//#region ----- Altri metodi -------
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
//#endregion

// test () {
//   let timeoutId = setTimeout(this.myfunction, 2000, 'Nicola');

//   setTimeout (function run() {
//     console.log('Hello')
//     setTimeout(run, 100)
//   }, 100)
//   clearTimeout(timeoutId);
// }




// greet (name: string) {
//   console.log ('Hello $(name)')
// }

// higherOrderFunction(callback: any) {
//   const name = "Nicola"
//   callback(name)
// }

// myfunction () {
//   this.higherOrderFunction (this.greet);

//   const promise = new Promise<string>((resolve, reject) => {
//     setTimeout (() => { resolve('Hey sto portando le patatine') }, 5000)
//   })

//   const onFulfillment = (result: string) => {
//     console.log (result)
//     console.log ("preparo la tavola");
//   }
  
//   const onRejection = (error: string) => {
//     console.log (error)
//     console.log ("butto la pasta");
//   }

//   promise.then (onFulfillment);
//   promise.catch(onRejection);

// }







  //NON DOVREBBE SERVIRE, ELIMINARE
  // concatenaFindGenitori(data: any, searchTerms: any): boolean{
  //   let found : boolean;
  //   //per ogni genitore trovato vado a concatenare la || di true. Quelli non trovati fanno la || di false quindi non aggiungono niente
  //   data._Genitori?.forEach((val: { genitore: { nome: any; }; })=>    (   
  //       found = found || String(val.genitore.nome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore)  !== -1   ))
    
  //   //alla fine found conterrà true se almeno un genitore viene trovato e false altrimenti
  //   return found!;
  // }

}