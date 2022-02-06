import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, pipe } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

//components
import { ClasseSezioneAnnoEditComponent } from '../classe-sezione-anno-edit/classe-sezione-anno-edit.component';
import { ClassiSezioniAnniFilterComponent } from '../classi-sezioni-anni-filter/classi-sezioni-anni-filter.component';

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { IscrizioniService } from '../iscrizioni.service';

//classes
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';




@Component({
  selector: 'app-classi-sezioni-anni-list',
  templateUrl: './classi-sezioni-anni-list.component.html',
  styleUrls: ['./../classi.css']
})
export class ClassiSezioniAnniListComponent implements OnInit, OnChanges {

//#region ----- Variabili -------
  matDataSourceIscrizioni = new MatTableDataSource<CLS_ClasseSezioneAnno>();
  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnnoGroup>();

  displayedColumns: string[] =  [];

  displayedColumnsClassiDashboard: string[] =  [
    "descrizione",
    "sezione",
    "numAlunni"
  ];

  displayedColumnsClassiPage: string[] =  [
    "actionsColumn",
    //"annoscolastico",
    //"seq",
    "descrizione",
    "sezione",
    "numAlunni",
    "descrizioneAnnoSuccessivo",
    "sezioneAnnoSuccessivo"
  ];

  displayedColumnsAlunnoEditList: string[] =  [
    "descrizione",
    "sezione",
    "addToAttended"
  ];

  displayedColumnsAlunnoEditAttended: string[] =  [
    "descrizioneCSAA",
    "sezioneCSAA",
    "annoscolasticoCSAA",
    "removeFromAttended"
  ];


  displayedColumnsRettaCalcolo: string[] =  [
    "descrizione",
    "sezione",
    "numAlunni",
    "importo",
    "importo2",
    "select",
  ];


  selection = new SelectionModel<CLS_ClasseSezioneAnnoGroup>(true, []);   //rappresenta la selezione delle checkbox
  
  toggleChecks:                       boolean = false;
  public swSoloAttivi :               boolean = true;

  idAnnoInput!:                       string; //Da routing
  idClasseInput!:                     string; //Da routing
  public idAnnoScolastico!:           number;
  showSelect:                         boolean = true;
  showPageTitle:                      boolean = true;
  showTableRibbon:                    boolean = true;
  obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  form! :                             FormGroup;
  public showProgress=                false;
  selectedRowIndex = -1;

  filterValue = '';       //Filtro semplice

  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    classe: '',
    sezione: '',
    filtrosx: ''
  };
    
//#endregion

//#region ----- ViewChild Input Output -------

  @Input('dove') dove! :                                          string;
  @Input('alunnoId') alunnoId! :                                  number;
  @Input() classiSezioniAnniFilterComponent!:                     ClassiSezioniAnniFilterComponent;

  @ViewChild(MatPaginator) paginator!:                            MatPaginator;
  @ViewChild(MatSort) sort!:                                      MatSort;
  @ViewChild("filterInput") filterInput!:                         ElementRef;  
  @ViewChild('selectAnnoScolastico') selectAnnoScolastico!:       MatSelect; 
  @ViewChildren("endedIcons", { read: ElementRef }) endedIcons!:  QueryList<ElementRef>   //elenco delle icone di fine procedura
  
  @Output('annoId') annoIdEmitter = new EventEmitter<number>(); //annoId viene EMESSO quando si seleziona un anno dalla select
  @Output('classeId') classeIdEmitter = new EventEmitter<number>(); //classeId viene EMESSO quando si clicca su una classe
  @Output('addToAttended') addToAttended = new EventEmitter<CLS_ClasseSezioneAnno>(); //EMESSO quando si clicca sul (+) di aggiunta alle classi frequentate
  @Output('removeFromAttended') removeFromAttended = new EventEmitter<CLS_ClasseSezioneAnno>(); //EMESSO quando si clicca sul (-) del rimuovi da classi frequentate

//#endregion

constructor(
    private svcClassiSezioniAnni:         ClassiSezioniAnniService,
    private svcIscrizioni:                IscrizioniService,
    private svcAnni:                      AnniScolasticiService,
    private _loadingService:              LoadingService,
    private fb:                           FormBuilder, 
    public _dialog:                       MatDialog, 
    private actRoute:                     ActivatedRoute,
    private _snackBar:                    MatSnackBar,
    ) { 

    let obj = localStorage.getItem('AnnoCorrente');

    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    });
  }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
    // let arrEndedIcons = this.endedIcons.toArray();
    // console.log ("endedIcons", arrEndedIcons);
    this.actRoute.queryParams.subscribe(
      params => {
          this.idAnnoInput = params['idAnno'];     
          this.idClasseInput = params['idClasseSezioneAnno'];  
    });

    this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(val => {
      this.loadData();
      this.annoIdEmitter.emit(val);
      //vanno resettate le selezioni delle checkbox
      this.resetSelections();
    })

    this.obsAnni$ = this.svcAnni.load()
      .pipe(
        finalize( () => {
          if (this.idAnnoInput) { //se arrivo da home
            this.form.controls.selectAnnoScolastico.setValue(parseInt(this.idAnnoInput));
          }
        }),
      );

    this.annoIdEmitter.emit(this.form.controls["selectAnnoScolastico"].value);

    this.loadData();
    
    switch(this.dove) {
      case 'alunno-edit-list':
        this.displayedColumns = this.displayedColumnsAlunnoEditList;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        break;
      case 'alunno-edit-attended': 
        this.displayedColumns = this.displayedColumnsAlunnoEditAttended;
        this.showSelect = false;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        break;
      case 'classi-dashboard':
        this.displayedColumns = this.displayedColumnsClassiDashboard;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        // this.matDataSource.sort = this.sort; TODO
        break;
      case 'classi-page':
          this.displayedColumns = this.displayedColumnsClassiPage;
          this.matDataSource.sort = this.sort;
          break;
      case 'retta-calcolo':
          this.displayedColumns = this.displayedColumnsRettaCalcolo;
          this.showPageTitle = false;
          this.showTableRibbon = false;
          //this.matDataSource.sort = this.sort; TODO
          break;
      default: this.displayedColumns = this.displayedColumnsClassiDashboard;
    }
  }

  ngOnChanges() {

  }


  loadData ( ) {
   
    let idAnno: number;
    idAnno = this.form.controls["selectAnnoScolastico"].value;

    
    if (this.dove == "alunno-edit-attended") {
      let obsIscrizioni$: Observable<CLS_ClasseSezioneAnno[]>;
      obsIscrizioni$= this.svcIscrizioni.listByAlunno(this.alunnoId); //qui bisogna pescare byAlunno MA attenzione: il risultato è strutturalmente diverso

      const loadIscrizioni$ =this._loadingService.showLoaderUntilCompleted(obsIscrizioni$);

      loadIscrizioni$.subscribe(val =>   {
        console.log (val);
        this.matDataSourceIscrizioni.data = val;
        this.matDataSourceIscrizioni.paginator = this.paginator;

        if (this.dove == "classi-page") {
          this.sortCustom(); 
          this.matDataSourceIscrizioni.sort = this.sort; 
        }

        this.matDataSourceIscrizioni.filterPredicate = this.filterPredicate();
        
        if(this.matDataSourceIscrizioni.data.length >0)
          this.rowclicked(this.idClasseInput);  
        //this.rowclicked(this.matDataSourceIscrizioni.data[0].id.toString()); //seleziona per default la prima riga NON FUNZIONA SEMPRE... SERVE??
        else
          this.rowclicked(undefined);
      });
    }
    else{ 
      let obsClassi$: Observable<CLS_ClasseSezioneAnnoGroup[]>;
      obsClassi$= this.svcClassiSezioniAnni.listByAnnoGroupByClasse(idAnno);
      // pipe(
      // map(res=> {
      //   var ret = <CLS_ClasseSezioneAnno[]>res.json();
      //   ret.sort((a,b) => a.classeSezione.classe < b.classeSezione.classe ? -1 : 1);
      //   return ret;
      // })) ;

      const loadClassi$ =this._loadingService.showLoaderUntilCompleted(obsClassi$);

      loadClassi$.subscribe(val =>   {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
  
          if (this.dove == "classi-page") {
            this.sortCustom(); 
            this.matDataSource.sort = this.sort; 
          }
  
          this.matDataSource.filterPredicate = this.filterPredicate();
          
          if(this.matDataSource.data.length >0)
          this.rowclicked(this.idClasseInput);  
          //this.rowclicked(this.matDataSource.data[0].id.toString()); //seleziona per default la prima riga NON FUNZIONA SEMPRE... SERVE??
          else
            this.rowclicked(undefined);
        }
      );
    }
  }

  rowclicked(idClasseSezioneAnno?: string ){
    //console.log ("idClasseSezioneAnno", parseInt(idClasseSezioneAnno));
    //il click su una classe deve essere trasmesso su al parent
    if(idClasseSezioneAnno!= undefined && idClasseSezioneAnno != null)
      this.selectedRowIndex = parseInt(idClasseSezioneAnno);
    else 
      this.selectedRowIndex = this.matDataSource.data[0].id;

    this.classeIdEmitter.emit(this.selectedRowIndex);
  }


//#endregion

//#region ----- Emit per alunno-edit -------

  addToAttendedEmit(item: CLS_ClasseSezioneAnno) {
    this.addToAttended.emit(item);
  }

  removeFromAttendedEmit(item: any) {
    this.removeFromAttended.emit(item);
  }

//#endregion

//#region ----- Filtri & Sort -------

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    //if (this.dove == "classi-page") this.classiSezioniAnniFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      let boolSx = String(data.descrizione2).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.sezione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;;

      let boolDx = String(data.descrizione2).toLowerCase().indexOf(searchTerms.classe) !== -1
                && String(data.sezione).toLowerCase().indexOf(searchTerms.sezione) !== -1;

      return boolDx && boolSx;
    }
    return filterFunction;
  }


// filterPredicateCustom(){
//   //questa funzione consente il filtro ANCHE sugli oggetti della classe
//   //https://stackoverflow.com/questions/49833315/angular-material-2-datasource-filter-with-nested-object/49833467
//   this.matDataSource.filterPredicate = (data, filter: string)  => {
//     const accumulator = (currentTerm: any, key: any) => { //Key è il campo in cui cerco
//       switch(key) { 
//         case "classeSezione": { 
//           return currentTerm + data.classeSezione.sezione + data.classeSezione.classe.descrizione2 ; 
//            break; 
//         } 
//         case "classeSezioneAnnoSucc": { 

//           return currentTerm + 
//           ((data.ClasseSezioneAnnoSucc == null) ? "" : data.ClasseSezioneAnnoSucc.classeSezione.sezione) + 
//           ((data.ClasseSezioneAnnoSucc == null) ? "" : data.ClasseSezioneAnnoSucc.classeSezione.classe.descrizione2);
//            break; 
//         } 

//         default: { 
//         //   return currentTerm + data.importo + data.dtPagamento; 
//         return currentTerm;  //di qua non passerà mai
//            break; 
//         } 
//      } 
//     };
//     const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
//     const transformedFilter = filter.trim().toLowerCase();
//     return dataStr.indexOf(transformedFilter) !== -1;
//   };
// }

sortCustom() {
  this.matDataSource.sortingDataAccessor = (item:any, property) => {
    switch(property) {
      //case 'annoscolastico':              return item.annoScolastico;
      case 'sezione':                     return item.sezione;
      case 'descrizione':                 return item.descrizione2;
      case 'descrizioneBreve':            return item.descrizioneBreve;
      case 'numAlunni':                   return item.numAlunni;

      //case 'seq':                         return item.classeSezione.classe.seq;
      default: return item[property]
    }
  };
}
//#endregion

//#region ----- Add Edit Drop -------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '380px',
      height: '450px',
      data: 0
    };
    const dialogRef = this._dialog.open(ClasseSezioneAnnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
  }

  openDetail(id:any) {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '380px',
      height: '450px',
      data: id
    };

    const dialogRef = this._dialog.open(ClasseSezioneAnnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(() => { this.loadData(); //TODO: metto intanto un valore di default CABLATO DENTRO COMUNQUE NON FUNZIONA BENE!
    });
  }

  updateImporto(element: CLS_ClasseSezioneAnno, value: any) {

    element.classeSezione.classe.importo = parseFloat(value);

    this.svcClassiSezioniAnni.put(element).subscribe(
      res=> {
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Importo salvato', panelClass: ['green-snackbar']})  //MOSTRA ESITO OK MA NON SALVA
      },
      err=> (
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      )
    );  //NON VA
  }
//#endregion

//#region ----- Gestione Campo Checkbox -------
  selectedRow(element: CLS_ClasseSezioneAnnoGroup) {
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
  checkboxLabel(row?: CLS_ClasseSezioneAnnoGroup): string {
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

  isNoneSelected() {
    const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
    return numSelected === 0;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
  }
//#endregion


}
