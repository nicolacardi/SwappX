import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup } from '@angular/forms';

//components
import { IscrizioniFilterComponent } from '../iscrizioni-filter/iscrizioni-filter.component';
import { AlunnoEditComponent } from '../../alunni/alunno-edit/alunno-edit.component';
import { RettaEditComponent } from '../../pagamenti/retta-edit/retta-edit.component';

//models
import { IscrizioniService } from '../iscrizioni.service';
import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';

@Component({
  selector:     'app-iscrizioni-list',
  templateUrl:  './iscrizioni-list.component.html',
  styleUrls:    ['../classi.css']
})

export class IscrizioniListComponent implements OnInit {

//#region ----- Variabili -------

  matDataSource = new           MatTableDataSource<CLS_Iscrizione>();

  displayedColumns:             string[] = [
      "actionsColumn", 
      "nome", 
      "cognome", 
      "classe",
      "sezione",
      "stato",
      "cf",
      "email", 
      "telefono",
      "dtNascita", 
      "indirizzo", 
      "comune", 
      "prov"
  ];

  rptTitle = 'Lista Iscrizioni';
  rptFileName = 'ListaIscrizioni';
  rptFieldsToKeep  = [
      "alunno.nome", 
      "alunno.cognome", 
      "classeSezioneAnno.classeSezione.classe.descrizioneBreve",
      "classeSezioneAnno.classeSezione.sezione",
      "stato.descrizione",
      "alunno.email", 
      "alunno.telefono",
      "alunno.dtNascita", 
      "alunno.indirizzo", 
      "alunno.comune", 
      "alunno.prov"
  ];

  rptColumnsNames  = [
      "nome", 
      "cognome", 
      "classe",
      "sezione",
      "stato",
      "email", 
      "telefono",
      "nato il", 
      "indirizzo", 
      "comune", 
      "prov"
  ];

  selection = new               SelectionModel<CLS_Iscrizione>(true, []);   //rappresenta la selezione delle checkbox
  obsAnni$!:                    Observable<ASC_AnnoScolastico[]>;           //Serve per la combo anno scolastico
  form:                         FormGroup;                                  //form fatto della sola combo anno scolastico
  
  menuTopLeftPosition =  {x: '0', y: '0'} 

  toggleChecks:                 boolean = false;
  showPageTitle:                boolean = true;
  showTableRibbon:              boolean = true;


  filterValue = '';       //Filtro semplice

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
    prov: '',
    filtrosx: ''
  };

//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() annoID!:                                           number;
  @Input('alunnoID') alunnoID! :                              number;
  @Input() iscrizioniFilterComponent!:                        IscrizioniFilterComponent;
  @Input('dove') dove! :                                      string;

  @Output('openDrawer') toggleDrawer = new                    EventEmitter<number>();

//#endregion

  constructor(
    private svcIscrizioni:    IscrizioniService,
    private svcAnni:          AnniScolasticiService,
    private fb:               FormBuilder, 
    public _dialog:           MatDialog, 
    private _loadingService:  LoadingService 
  ) {

    let obj = localStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    });
  }

//#region ----- LifeCycle Hooks e simili-------
  
  ngOnInit () {
    this.loadData();
  }

  updateList() {
    this.loadData();
  }

  loadData () {
    this.obsAnni$= this.svcAnni.list();
    let obsIscrizioni$: Observable<CLS_Iscrizione[]>;

    this.annoID = this.form.controls['selectAnnoScolastico'].value;
    if (this.annoID != undefined && this.annoID > 0 ) {
      obsIscrizioni$= this.svcIscrizioni.listByAnno(this.annoID);
      let loadIscrizioni$ =this._loadingService.showLoaderUntilCompleted(obsIscrizioni$);

      loadIscrizioni$.subscribe(val =>  {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;          
          this.sortCustom();
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
        }
      );
    } 
  }
//#endregion

//#region ----- Filtri & Sort -------

  resetSearch(){
    this.filterInput.nativeElement.value = "";
    this.filterValue = "";
    this.filterValues.filtrosx = "";
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

  applyFilter(event: Event) {

    this.filterValue = (event.target as HTMLInputElement).value;

    //Reset dei filtri di destra
    //this.iscrizioniFilterComponent.resetAllInputs();
   
    //Inserimento del Main Filter in uno specifico (filtrosx) dei campi di filterValues
    if( this.filterValue != undefined && this.filterValue != ""){
      this.filterValues.filtrosx = this.filterValue.toLowerCase();
    }
    //applicazione del filtro
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {

    let filterFunction = function(data: any, filter: any): boolean {
      
      let searchTerms = JSON.parse(filter);
      //la Classe viene gestita separatamente in quanto solo per lei (nel filtro di dx) si trova la corrispondenza ESATTA
      let trovataClasseOVuota : boolean = false; 

      if (searchTerms.classe == null || searchTerms.classe == "") 
        trovataClasseOVuota = true;
      if (String(data.classeSezioneAnno.classeSezione.classe.descrizioneBreve).toLowerCase() == searchTerms.classe) 
        trovataClasseOVuota = true;
      
      let dArr = data.alunno.dtNascita.split("-");
      const dtNascitaddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];

      let boolSx = String(data.alunno.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.classeSezioneAnno.classeSezione.classe.descrizioneBreve).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.classeSezioneAnno.classeSezione.sezione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.cf).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.telefono).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(dtNascitaddmmyyyy).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.indirizzo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.comune).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.prov).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.alunno.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.alunno.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && String(data.classeSezioneAnno.classeSezione.sezione).toLowerCase().indexOf(searchTerms.sezione) !== -1
                && trovataClasseOVuota
                && String(data.alunno.cf).toLowerCase().indexOf(searchTerms.cf) !== -1
                && String(data.alunno.email).toLowerCase().indexOf(searchTerms.email) !== -1
                && String(data.alunno.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
                && String(dtNascitaddmmyyyy).toLowerCase().indexOf(searchTerms.dtNascita) !== -1
                && String(data.alunno.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
                && String(data.alunno.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
                && String(data.alunno.prov).toLowerCase().indexOf(searchTerms.prov) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }
//#endregion

//#region ----- Add Edit Drop -------

  addRecord(){

    //TODO!!!
    /*
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
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
      height: '580px',
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
    let annoID = 1; //TODO questa sarà un default da mettere nei parametri
    const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '850px',
        height: '580px',
        data: {
          alunnoID: alunnoID,
          annoID: annoID
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

  /*
  masterToggle() {
    this.toggleChecks = !this.toggleChecks;

    if (this.toggleChecks) 
      this.selection.select(...this.matDataSource.data);
    else 
      this.resetSelections();
  }
  */
  
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

}

  
