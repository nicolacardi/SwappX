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
import { Pipe, PipeTransform } from '@angular/core';

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
import { IscrizioniFilterComponent } from '../iscrizioni-filter/iscrizioni-filter.component';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';

@Component({
  selector:     'app-iscrizioni-list',
  templateUrl:  './iscrizioni-list.component.html',
  styleUrls:    ['../classi.css']
})


export class IscrizioniListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<CLS_Iscrizione>();
 
  obsAnni$!:                    Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  form:                         FormGroup;            //form fatto della sola combo anno scolastico
  
  storedFilterPredicate!:       any;
  

  displayedColumns: string[] = [
      //"select",
      "actionsColumn", 
      "nome", 
      "cognome", 
      "classe",
      "sezione",
      "stato",    //Stato Iscrizione
      "cf",
      "email", 
      "telefono",
      "dtNascita", 
      "indirizzo", 
      "comune", 
      //"cap", 
      "prov"
  ];

  selection = new SelectionModel<CLS_Iscrizione>(true, []);   //rappresenta la selezione delle checkbox

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

  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    nome: '',
    cognome: '',
    classe: '',
    sezione: '',
    stato: '',
    cf: '',
    email: '',
    telefono: '',
    dtNascita: '',
    indirizzo: '',
    comune: '',
    prov: ''
  };
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() annoID!:                                           number;
  @Input() iscrizioniFilterComponent!:                        IscrizioniFilterComponent;
  @Input('context') context! :                                string;

  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();

//#endregion

  constructor(private svcIscrizioni:    IscrizioniService,
    private svcAnni:          AnniScolasticiService,
    private fb:               FormBuilder, 
    private router:           Router,
    public _dialog:           MatDialog, 
    private _loadingService:  LoadingService,
    private _navigationService:   NavigationService
    ) {

    let obj = localStorage.getItem('AnnoCorrente');

    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    })
  }
  

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    //this.loadData();
  }
  
  ngOnInit () {
    this.loadData();
  }

  loadLayout(){
      //chiamata al WS dei layout con nome utente e nome griglia e contesto (variabile 'context')
      //se trovato, update colonne griglia
      //this.displayedColumns =  this.displayedColumnsAlunniList;
  }

  updateList() {
    this.loadData();
  }

  loadData () {
    this.obsAnni$= this.svcAnni.load();
    let obsIscrizioni$: Observable<CLS_Iscrizione[]>;

    this.annoID = this.form.controls['selectAnnoScolastico'].value;
    if (this.annoID != undefined && this.annoID > 0 ) {
      obsIscrizioni$= this.svcIscrizioni.listByAnno(this.annoID);
      const loadIscrizioni$ =this._loadingService.showLoaderUntilCompleted(obsIscrizioni$);

      loadIscrizioni$.subscribe(val =>  {

          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;          
          
          this.sortCustom();
          this.matDataSource.sort = this.sort; 
          
          //applico il filterPredicateCustom (si tratta del filtro Main).
          this.filterPredicateCustom();
          //conservo l'attuale filterPredicate in storedFilterPredicate
          this.storedFilterPredicate = this.matDataSource.filterPredicate;
          //applico il filterPredicate del RightPanel...? Perchè?
          this.matDataSource.filterPredicate = this.filterRightPanel();
        }
      );
    } 
  }

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'nome':                        return item.alunno.nome;
        case 'cognome':                     return item.alunno.cognome;
        case 'classe':                      return item.classeSezioneAnno.classeSezione.classe.descrizioneBreve;
        case 'sezione':                     return item.classeSezioneAnno.classeSezione.sezione;

        case 'cf':                          return item.alunno.cf;
        case 'email':                       return item.alunno.email;
        case 'telefono':                    return item.alunno.telefono;
        case 'dtNascita':                   return item.alunno.dtNascita;
        case 'stato':                       return item.stato.descrizione;
        case 'indirizzo':                   return item.alunno.indirizzo;
        case 'comune':                      return item.alunno.comune;
        case 'prov':                        return item.alunno.prov;

        default: return item[property]
      }
    };
  }

//#endregion

//#region ----- Filtri & Sort -------


  filterRightPanel(): (data: any, filter: string) => boolean {

    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      // console.log ("searchterms", searchTerms);
      // console.log ("data", data);
      let foundEqualClass : boolean = false;
      if (Object.values(searchTerms).every(x => x === null || x === '')) 
        foundEqualClass = true;
      else {    
        if (String(data.classeSezioneAnno.classeSezione.classe.descrizioneBreve).toLowerCase() == searchTerms.classe) { 
          foundEqualClass = true;
        }
        // data._Genitori?.forEach((val: { genitore: { nome: any; cognome: any}; })=>  {   
        //     const foundCognomeNome = foundGenitore || String(val.genitore.cognome+" "+val.genitore.nome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1;
        //     const foundNomeCognome = foundGenitore || String(val.genitore.nome+" "+val.genitore.cognome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1; 
        //     foundGenitore = foundCognomeNome || foundNomeCognome;
        // })
      }
      console.log(foundEqualClass);
      return String(data.alunno.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
        && String(data.alunno.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
       
        && String(data.classeSezioneAnno.classeSezione.sezione).toLowerCase().indexOf(searchTerms.sezione) !== -1
        && foundEqualClass
       //&& String(data.classeSezioneAnno.classeSezione.classe.descrizioneBreve).toLowerCase().indexOf(searchTerms.classe) !== -1
        // && String(data.cf).toLowerCase().indexOf(searchTerms.cf) !== -1
        // && String(data.dtNascita).indexOf(searchTerms.annoNascita) !== -1
        // && String(data.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
        // && String(data.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
        // && String(data.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
        // && String(data.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
        // && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1
        //&& foundGenitore
        ;
    }
    return filterFunction;
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;

    if (this.filterValue.length == 1) {
      //console.log("primo giro");
      this.matDataSource.filterPredicate = this.storedFilterPredicate;

      this.iscrizioniFilterComponent.resetAllInputs();
    }
    //console.log(this.filterValue.trim().toLowerCase());

   this.matDataSource.filter = this.filterValue.trim().toLowerCase();
  }

  
filterPredicateCustom(){
  //questa funzione consente il filtro ANCHE sugli oggetti della classe
  this.matDataSource.filterPredicate = (data: CLS_Iscrizione, filter: string)  => {
    const accumulator = (currentTerm: any, key: any) => { //Key è il campo in cui cerco
    


      let toreturn =  '';

      switch(key) { 
          
          case "alunno":{
            toreturn = currentTerm   + 
            ((data.alunno.nome == null) ? "" : data.alunno.nome) +
            ((data.alunno.cognome == null) ? "" : data.alunno.cognome) +
            ((data.alunno.email == null) ? "" : data.alunno.email) +
            ((data.alunno.indirizzo == null) ? "" : data.alunno.indirizzo) +
            ((data.alunno.comune == null) ? "" : data.alunno.comune) +
            ((data.alunno.prov == null) ? "" : data.alunno.prov) +
            ((data.alunno.cf == null) ? "" : data.alunno.cf)  +
            ((data.alunno.telefono == null) ? "" : data.alunno.telefono) 
            // console.log("currentTerm: " , currentTerm);
            // console.log("Key: " , key);
            // console.log("data: " , data);
            // console.log("key:alunno->return: " , toreturn);
            return toreturn;
            break;
          }
          
          case "stato": { 
            toreturn = currentTerm   + 
            ((data.stato.descrizione == null) ? "" : data.stato.descrizione);
            return toreturn  ;
            break; 
          } 
          case "classeSezioneAnno": { 
            toreturn = currentTerm + 
            ((data.classeSezioneAnno.classeSezione.sezione == null) ? "" : data.classeSezioneAnno.classeSezione.sezione) + 
            ((data.classeSezioneAnno.classeSezione.classe.descrizioneBreve == null) ? "" : data.classeSezioneAnno.classeSezione.classe.descrizioneBreve);
            return toreturn  ;
            break; 
          } 

          default: { 
            return currentTerm;  //di qua non passerà mai
            break; 
          } 
      } 
    };

    
    const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
    const transformedFilter = filter.trim().toLowerCase();
    return dataStr.indexOf(transformedFilter) !== -1;
  };
}
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

  openDetail(alunnoID:number){
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: alunnoID
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
//#endregion

//#region ----- Emit per alunno-edit -------



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

  // toggleAttivi(){
  //   this.swSoloAttivi = !this.swSoloAttivi;
  //   this.loadData();
  // }

  // getChecked() {
  //   //funzione usata da classi-dahsboard
  //   return this.selection.selected;
  // }

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
    
  }
//#endregion

}

  
