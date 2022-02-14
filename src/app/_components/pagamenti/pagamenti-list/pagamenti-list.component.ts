import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';

//components
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { RettaEditComponent } from '../retta-edit/retta-edit.component';
import { PagamentiFilterComponent } from '../pagamenti-filter/pagamenti-filter.component';

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { PagamentiService } from '../pagamenti.service';

//models
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';

@Component({
  selector: 'app-pagamenti-list',
  templateUrl: './pagamenti-list.component.html',
  styleUrls: ['../pagamenti.css']
})

export class PagamentiListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<PAG_Pagamento>();
  pagamentoEmitter = new EventEmitter<number>();

  obsAnni$!:                Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  form:                     FormGroup;            //form fatto della sola combo anno scolastico

  show: boolean = true;
 
  displayedColumns: string[] =  [];
  displayedColumnsList: string[] = [
                                  "actionsColumn", 
                                  "dtPagamento", 
                                  "importo", 
                                  //"tipoPagamentoID", 
                                  "tipoPagamento.descrizione",
                                  //"causaleID", 
                                  "causale.descrizione",
                                  //"rettaID", 
                                  "retta.quotaConcordata",
                                  "retta.meseRetta",
                                  //"alunnoID", 
                                  "alunno.cognome",
                                  "alunno.nome",
                                  //"genitoreID",
                                  "note"];

  displayedColumnsListRettaEdit: string[] = [
                                  "dtPagamento", 
                                  "importo", 
                                  "tipoPagamento.descrizione",
                                  "causale.descrizione",
                                  "retta.meseRetta",
                                  "delete" ];

  menuTopLeftPosition =  {x: '0', y: '0'} 
  matMenuTrigger: any;

  filterValue = '';       //Filtro semplice

  filterValues = {
    tipoPagamento: '',
    causale: '',
    importoPiuDi: '',
    importo: '',
    importoMenoDi: '',
    nome: '',
    cognome: '',
    dataDal: '',
    dataAl: '',
    filtrosx: ''
  };

  public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2).toLocaleString('it-IT', {month: 'short'}).toUpperCase());

//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:    MatPaginator;
  @ViewChild(MatSort) sort!:              MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;

  @Input() dove!:           string;
  @Input() alunnoID!:       number;
  @Input() annoID!:         number;
  @Input() pagamentiFilterComponent!: PagamentiFilterComponent;

  //@Output('hoverPagamento');

//#endregion

  constructor(
    private svcPagamenti:     PagamentiService,
    private svcAnni:          AnniScolasticiService,
    private fb:               FormBuilder, 
    public _dialog:           MatDialog, 
    private _snackBar:        MatSnackBar,
    private _loadingService:  LoadingService
  ) {
   
    let obj = localStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    })
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    this.loadData();
  }

  ngOnInit(): void {
    
    if (this.dove == 'retta-edit') {
      this.show = false;
      this.displayedColumns =  this.displayedColumnsListRettaEdit;
    } else {
      this.show = true;
      this.displayedColumns =  this.displayedColumnsList;
    }
    this.loadData();
  }

  updateList() {
    this.annoID = this.form.controls['selectAnnoScolastico'].value;
    this.loadData();
  }

  loadData () {

    this.obsAnni$= this.svcAnni.list();
    let obsPagamenti$: Observable<PAG_Pagamento[]>;

    if (this.alunnoID == 0 ) return;
    if (this.alunnoID) {
      obsPagamenti$= this.svcPagamenti.loadByAlunnoAnno(this.alunnoID, this.annoID);
    } else {
      if (!this.annoID) this.annoID = this.form.controls['selectAnnoScolastico'].value;
      obsPagamenti$= this.svcPagamenti.loadByAnno(this.annoID);
    }
    const loadPagamenti$ =this._loadingService.showLoaderUntilCompleted(obsPagamenti$);

    loadPagamenti$.subscribe(val => 
      {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        
        this.sortCustom(); 
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
    //this.pagamentiFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {

    let filterFunction = function(data: any, filter: any): boolean {
    
      let searchTerms = JSON.parse(filter);

      let foundTipoPagamento = (String(data.tipoPagamentoID).indexOf(searchTerms.tipoPagamento) !== -1);
      if (searchTerms.tipoPagamento == null) foundTipoPagamento = true;
      
      let foundCausale = (String(data.causaleID).indexOf(searchTerms.causale) !== -1);
      if (searchTerms.causale == null) foundCausale = true; //true significa che deve ignorare il filtro: deve rispondere come se trovasse sempre il valore

      let cfrImportoPiuDi = true;
      let cfrImportoMenoDi = true;
      let cfrImporti = true;
      if (searchTerms.importo  == '') {
        if (searchTerms.importoPiuDi > data.importo) { cfrImportoPiuDi = false }
        if (searchTerms.importoMenoDi < data.importo && searchTerms.importoMenoDi != '') { cfrImportoMenoDi = false }

         cfrImporti = cfrImportoPiuDi && cfrImportoMenoDi;
      } else {
         cfrImporti = (data.importo == searchTerms.importo) 
      }

      let cfrDataDal = true;
      let cfrDataAl = true;
      let cfrDate = true;
      if (searchTerms.dataDal != '') {cfrDataDal = (data.dtPagamento > searchTerms.dataDal)}
      if (searchTerms.dataAl != '') {cfrDataAl = (data.dtPagamento < searchTerms.dataAl)}
      cfrDate = cfrDataDal && cfrDataAl;

      let dArr = data.dtPagamento.split("-");
      const dtPagamentoddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];
      console.log (data);

      let boolSx = String(data.alunno.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
            || String(dtPagamentoddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
            || String(data.importo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
            || String(data.alunno.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

      let boolDx = foundTipoPagamento
            && foundCausale
            && cfrImporti 
            && String(data.alunno.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
            && String(data.alunno.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
            && cfrDate;

      return boolSx && boolDx;
    }
    return filterFunction;
  }




  // filterPredicateCustom(){
  //   //questa funzione consente il filtro ANCHE sugli oggetti della classe
  //   //https://stackoverflow.com/questions/49833315/angular-material-2-datasource-filter-with-nested-object/49833467
  //   this.matDataSource.filterPredicate = (data, filter: string)  => {
  //     const accumulator = (currentTerm: any, key: any) => { //Key è il campo in cui cerco

  //       switch(key) { 
  //         case "tipoPagamento": { 
  //           return currentTerm + data.tipoPagamento.descrizione; 
  //            break; 
  //         } 
  //         case "causale": { 
  //           return currentTerm + data.Causale.descrizione; 
  //            break; 
  //         } 
  //         case "alunno": { 
  //           return currentTerm + data.alunno.nome + data.alunno.cognome; 
  //            break; 
  //         } 
  //         default: { 
  //           return currentTerm + data.importo + data.dtPagamento; 
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
        case 'tipoPagamento.descrizione':   return item.tipoPagamento.descrizione;
        case 'causale.descrizione':         return item.causale.descrizione;
        case 'alunno.nome':                 return item.alunno.nome;
        case 'alunno.cognome':              return item.alunno.cognome;
        case 'importo':                     return item.importo;
        //case 'retta.meseRetta':             return item.retta.meseRetta;      
        //case 'retta.quotaConcordata':       return item.retta.quotaConcordata;    //NON FUNZIONA PERCHE' CI SONO 'ANCHE' RECORD SENZA retta
        
        case 'dtPagamento':                 return parseInt(item.dtPagamento.toString());
        default: return item[property]
        //default: return item.alunno.cognome;
        //default: return Number(item.dtPagamento.toString());
        //default: return Number(item.dtPagamento);
        //default: return item.dtPagamento;
        //default: return item.dtPagamento.toString();
        //default: return item.alunno.cognome
      }
    };
  }

//#endregion

//#region ----- Add Edit Drop -------

  addRecord(){
    this.editRecord(0);
  }

  editRecord(alunnoID: number){

    let anno = this.annoID;
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click -------

  onRightClick(event: MouseEvent, element: PAG_Pagamento) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion

//#region ----- Add Delete Edit Drop -------
  delete(idPagamento: number){

    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result){
        this.svcPagamenti.delete(Number(idPagamento))
        //.pipe (
        //  finalize(()=>this.router.navigate(['/alunni']))
        //)
        .subscribe(
          res=>{
            this._snackBar.openFromComponent(SnackbarComponent,
              {data: 'Record cancellato', panelClass: ['red-snackbar']}
            );
            //this._dialogRef.close();
            this.loadData();
            //AS: attenzione: se non faccio refresh la griglia non si aggiorna: perchè ???
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          )
        );
      }
    });
    
  }
//#endregion

//#region ----- Altri metodi -------
  hoverRow(id: number) {
    //console.log(id);
    this.pagamentoEmitter.emit(id);
  }

  hoverLeave() {
    this.pagamentoEmitter.emit(0);
  }
//#endregion



}
