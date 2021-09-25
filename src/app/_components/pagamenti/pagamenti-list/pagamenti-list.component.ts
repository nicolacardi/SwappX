import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LoadingService } from '../../utilities/loading/loading.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { PagamentiService } from '../pagamenti.service';


import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';
import { SELECT_ITEM_HEIGHT_EM } from '@angular/material/select/select';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RettaEditComponent } from '../retta-edit/retta-edit.component';
import { PagamentiFilterComponent } from '../pagamenti-filter/pagamenti-filter.component';

@Component({
  selector: 'app-pagamenti-list',
  templateUrl: './pagamenti-list.component.html',
  styleUrls: ['../pagamenti.css']
})

export class PagamentiListComponent implements OnInit {

  @Input() dove!:           string;
  @Input() alunnoID!:       number;
  @Input() annoID!:         number;

  @Output('hoverPagamento')
  pagamentoEmitter = new EventEmitter<number>();

  obsAnni$!:                Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  form:                     FormGroup;            //form fatto della sola combo anno scolastico

  show: boolean = true;
  matDataSource = new MatTableDataSource<PAG_Pagamento>();
  storedFilterPredicate!:       any;

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

  filterValues = {
    tipoPagamento: '',
    causale: '',
    importoPiuDi: '',
    importo: '',
    importoMenoDi: '',
    nome: '',
    cognome: '',
    dataDal: '',
    dataAl: ''
  };

  @ViewChild(MatPaginator) paginator!:    MatPaginator;
  @ViewChild(MatSort) sort!:              MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;

  @Input() pagamentiFilterComponent!: PagamentiFilterComponent;

  public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2).toLocaleString('it-IT', {month: 'short'}).toUpperCase());


  constructor(private pagamentiSvc:     PagamentiService,
              private svcAnni:          AnniScolasticiService,
              private fb:               FormBuilder, 
              public _dialog:           MatDialog, 
              private _snackBar:        MatSnackBar,
              private _loadingService:  LoadingService,
    ) 
  {
    //form composto della sola combo Anno Scolastico: così si riesce tra le altre cose a settare un valore di default
    this.form = this.fb.group({
      annoScolastico:      [1],
    });
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

  ngOnChanges() {
    this.loadData();
  }

  updateList() {
    this.annoID = this.form.controls['annoScolastico'].value;
    this.loadData();
  }

  loadData () {

    this.obsAnni$= this.svcAnni.load();

    let obsPagamenti$: Observable<PAG_Pagamento[]>;

    //console.log("annoID dalla combobox", this.form.controls['annoScolastico'].value);
    //console.log("this.alunnoID", this.alunnoID);

    if (this.alunnoID == 0 ) return;
    if (this.alunnoID) {
      obsPagamenti$= this.pagamentiSvc.loadByAlunnoAnno(this.alunnoID, this.annoID);
    } else {
      if (!this.annoID) this.annoID = this.form.controls['annoScolastico'].value;
      obsPagamenti$= this.pagamentiSvc.loadByAnno(this.annoID);
    }
    const loadPagamenti$ =this._loadingService.showLoaderUntilCompleted(obsPagamenti$);

    loadPagamenti$.subscribe(val => 
      {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        
        this.filterPredicateCustom();   //serve per rendere filtrabili anche i campi nested
        this.sortCustom(); 
        this.matDataSource.sort = this.sort;
        this.storedFilterPredicate = this.matDataSource.filterPredicate;
        this.matDataSource.filterPredicate = this.createFilter();
      }
    );
  }

  
  createFilter(): (data: any, filter: string) => boolean {

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

      return foundTipoPagamento
        && foundCausale
        && cfrImporti 
        && String(data.alunno.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
        && String(data.alunno.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
        && cfrDate
        ;
    }
    return filterFunction;
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
  
  onRightClick(event: MouseEvent, element: PAG_Pagamento) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  addRecord(){
    this.editRecord(0);
  }

  editRecord(alunnoID: number){

    let anno = this.annoID;
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

  delete(idPagamento: number){

    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result){
        this.pagamentiSvc.delete(Number(idPagamento))
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

  filterPredicateCustom(){ //NC
    //questa funzione consente il filtro ANCHE sugli oggetti della classe
    //https://stackoverflow.com/questions/49833315/angular-material-2-datasource-filter-with-nested-object/49833467
    this.matDataSource.filterPredicate = (data, filter: string)  => {
      const accumulator = (currentTerm: any, key: any) => { //Key è il campo in cui cerco

        switch(key) { 
          case "tipoPagamento": { 
            return currentTerm + data.tipoPagamento.descrizione; 
             break; 
          } 
          case "causale": { 
            return currentTerm + data.causale.descrizione; 
             break; 
          } 
          case "alunno": { 
            return currentTerm + data.alunno.nome + data.alunno.cognome; 
             break; 
          } 
          default: { 
            return currentTerm + data.importo + data.dtPagamento; 
             break; 
          } 
       } 
      };
      const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };
  }

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

  hoverRow(id: number) {
    //console.log(id);
    this.pagamentoEmitter.emit(id);
  }

  hoverLeave() {
    this.pagamentoEmitter.emit(0);
  }




}
