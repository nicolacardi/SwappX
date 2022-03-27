import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';

//components
//import { IscrizioneEditComponent } from '../iscrizione-edit/iscrizione-edit.component';           //TODO!!!
//import { IscrizioniFilterComponent } from '../iscrizioni-filter/iscrizioni-filter.component';     //TODO!!!
import { AlunnoEditComponent } from '../../alunni/alunno-edit/alunno-edit.component';
import { RettaEditComponent } from '../../pagamenti/retta-edit/retta-edit.component';


//models
import { IscrizioniService } from '../iscrizioni.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';

//classes
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';

@Component({
  selector:     'app-iscrizioni-classe-list',
  templateUrl:  './iscrizioni-classe-list.component.html',
  styleUrls:    ['../classi.css']
})


export class IscrizioniClasseListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<CLS_Iscrizione>();
  storedFilterPredicate!:       any;
  filterValue = '';
  classeSezioneAnno!:           CLS_ClasseSezioneAnno;
  
  displayedColumns: string[] = [
      "select",
      "actionsColumn", 
      "nome", 
      "cognome", 
      "email", 
      "telefono",
      "dtNascita", 
      "stato",    //Stato Iscrizione
      // "indirizzo", 
      // "comune", 
      // "cap", 
      // "prov"
  ];
  displayedColumnsPagella: string[] = [
      "select",
      "nome", 
      "cognome"
  ];

  selection = new SelectionModel<CLS_Iscrizione>(true, []);   //rappresenta la selezione delle checkbox
  selectedRowIndex=-1;

  matSortActive!:               string;
  matSortDirection!:            string;

  //public passedGenitore!:       string;
  public page!:                 string;

  menuTopLeftPosition =  {x: '0', y: '0'} 
  idAlunniChecked:              number[] = [];
  toggleChecks:                 boolean = false;
  showPageTitle:                boolean = true;
  showTableRibbon:              boolean = true;
  public swSoloAttivi :         boolean = true;

  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  /*
  filterValues = {
    nome: '',
    cognome: '',
    stato: '',
    annoNascita: '',
    indirizzo: '',
    comune: '',
    prov: '',
    email: '',
    telefono: '',
    nomeCognomeGenitore: ''
  };
  */
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() idClasse!:                                         number;
  //@Input() alunniFilterComponent!:                            IscrizioniFilterComponent;    //TODO!!!
  @Input('dove') dove! :                                string;


  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
  @Output('iscrizioneId') iscrizioneIdEmitter = new EventEmitter<number>();  
 

//#endregion

  constructor(private svcIscrizioni:          IscrizioniService,
              private svcClasseSezioneAnno:   ClassiSezioniAnniService,
              public _dialog:                 MatDialog, 
              private _loadingService:        LoadingService,
              private _navigationService:     NavigationService  ) {
  }
  

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {


      switch(this.dove) {
        case 'pagella':
          this.displayedColumns = this.displayedColumnsPagella;
          this.showPageTitle = true;
          this.loadData();         
          break;
        case 'lista-alunni':
          this.displayedColumns = this.displayedColumns;
          this.showPageTitle = true;

          this.loadData();
        // default:
        //   this.displayedColumns = this.displayedColumns;
        //   this.showPageTitle = true;

        //   this.loadData();
          break;  
        default:
          console.log ("passo di qua");

          break;
      }

      this.toggleChecks = false;
      this.showTableRibbon = false;
      this.resetSelections();
    
  }
  
  ngOnInit () {
    
  }

  loadLayout(){
      //chiamata al WS dei layout con nome utente e nome griglia e contesto (variabile 'context')
      //se trovato, update colonne griglia
      //this.displayedColumns =  this.displayedColumnsAlunniList;
  }

  loadData () {
    let obsIscrizioni$: Observable<CLS_Iscrizione[]>;

    //if (this.context == "classi-dashboard" && this.idClasse != undefined) {
    if (this.idClasse != undefined) {
      //parcheggio in classeSezioneAnno i dati della classe che servono a classi-dashboard (per il nome dell'export)
      this.svcClasseSezioneAnno.get(this.idClasse).subscribe(res => this.classeSezioneAnno = res)

      obsIscrizioni$= this.svcIscrizioni.listByClasseSezioneAnno(this.idClasse);
      const loadIscrizioni$ =this._loadingService.showLoaderUntilCompleted(obsIscrizioni$);

      loadIscrizioni$.subscribe(val =>  {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
          if (val.length != 0) {
            this.rowclicked(this.matDataSource.data[0]); 
          } else {
            this.iscrizioneIdEmitter.emit(0);
          }
          
        }
      );
    } 
  }

  rowclicked(Iscrizione: CLS_Iscrizione ){
    //il click su una riga deve essere trasmesso su al parent
    this.selectedRowIndex = Iscrizione.id;
    this.iscrizioneIdEmitter.emit(Iscrizione.id);
  }


  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'nome':                        return item.alunno.nome;
        case 'cognome':                     return item.alunno.cognome;
        case 'email':                       return item.alunno.email;
        case 'telefono':                    return item.alunno.telefono;
        case 'dtNascita':                   return item.alunno.dtNascita;
        case 'stato':                       return item.stato.descrizione;
        default: return item[property]
      }
    };
  }

//#endregion

//#region ----- Filtri & Sort -------

/*
  filterRightPanel(): (data: any, filter: string) => boolean {

    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      // let foundGenitore : boolean = false;
      // if (Object.values(searchTerms).every(x => x === null || x === '')) 
      //   foundGenitore = true;
      // else {    
      //   data._Genitori?.forEach((val: { genitore: { nome: any; cognome: any}; })=>  {   
      //       const foundCognomeNome = foundGenitore || String(val.genitore.cognome+" "+val.genitore.nome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1;
      //       const foundNomeCognome = foundGenitore || String(val.genitore.nome+" "+val.genitore.cognome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1; 
      //       foundGenitore = foundCognomeNome || foundNomeCognome;
      //   })
      // }

      return String(data.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
        && String(data.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
        && String(data.dtNascita).indexOf(searchTerms.annoNascita) !== -1
        && String(data.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
        && String(data.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
        && String(data.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
        //se trova dei valori NULL .toString() va in difficoltà (ce ne sono in telefono e email p.e.) per cui sono passato a String(...)
        && String(data.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
        && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1
        //&& foundGenitore
        ;
    }
    return filterFunction;
  }

  applyFilter(event: Event) {

    //TODO!!!!
    this.filterValue = (event.target as HTMLInputElement).value;
    if (this.filterValue.length == 1) {
      this.matDataSource.filterPredicate = this.storedFilterPredicate;
      if (this.context == "alunni-page") this.alunniFilterComponent.resetAllInputs();
    }
    this.matDataSource.filter = this.filterValue.trim().toLowerCase();
  }
*/
//#endregion

//#region ----- Add Edit Drop -------
  addRecord(){

    //TODO!!!
    /*
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
    */
  }

  openDetail(recordID:number){
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: recordID
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

  onRightClick(event: MouseEvent, element: CLS_Iscrizione) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
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

//#region ----- Gestione Campo Checkbox -------
  selectedRow(element: CLS_Iscrizione) {
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
  checkboxLabel(row?: CLS_Iscrizione): string {
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


}



