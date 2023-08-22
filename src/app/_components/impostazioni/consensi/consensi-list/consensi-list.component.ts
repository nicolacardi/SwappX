//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { MatSort }                              from '@angular/material/sort';

//components

//services
import { ConsensiService }                      from '../consensi.service';

//models
import { _UT_Consenso }                         from 'src/app/_models/_UT_Consenso';
import { ConsensoEditComponent } from '../consenso-edit/consenso-edit.component';
import { RisorseService } from '../../risorse/risorse.service';
import { SnackbarComponent } from 'src/app/_components/utilities/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
//#endregion

@Component({
  selector: 'app-consensi-list',
  templateUrl: './consensi-list.component.html',
  styleUrls: ['../consensi.css']
})
export class ConsensiListComponent implements OnInit{

//#region ----- Variabili ----------------------

  maxSeq!:                                       number;
  matDataSource = new MatTableDataSource<_UT_Consenso>();
  obsConsensi$!:                                Observable<_UT_Consenso[]>;
  
  displayedColumns: string[] = [

    "actionsColumn", 
    // "seq",
    "domanda", 
    "tipo",
    // "numOpzioni",
    "testo1",
    "testo2",
    "testo3",
    "testo4",
    "testo5",
    "testo6",
    "risorsa"
  ];

  rptTitle = 'Lista Consensi';
  rptFileName = 'ListaConsensi';
  rptFieldsToKeep  = [
    "domanda",
  ];

  rptColumnsNames  = [
    "domanda",
  ];

  filterValue = '';       //Filtro semplice

  filterValues = {
    descrizione: '',
    filtrosx: ''
  }

//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatSort) sort!:                    MatSort;
//#endregion

//#region ----- Constructor --------------------
  constructor(private svcConsensi:              ConsensiService,
              private svcRisorse:                 RisorseService,
              private _loadingService:          LoadingService,
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar
              ) {}
//#endregion

//#region ----- LifeCycle Hooks e simili--------
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.obsConsensi$ = this.svcConsensi.list();  
    const loadConsensi$ =this._loadingService.showLoaderUntilCompleted(this.obsConsensi$);

    loadConsensi$.subscribe(
      val =>   {
        console.log ("estraggo consensi list", val);
        this.matDataSource.data = val;
        this.sortCustom(); 
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate(); //usiamo questo per uniformità con gli altri component nei quali c'è anche il filtro di destra, così volendo lo aggiungiamo velocemente
      }
    );
  }
//#endregion

//#region ----- Add Edit Drop ------------------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '570px',
      data: { consensoID:  0}
    };
    const dialogRef = this._dialog.open(ConsensoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.svcConsensi.renumberSeq().subscribe(() => this.loadData());
    });
  }

  openDetail(consensoID:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '570px',
      data: { consensoID: consensoID }
    };
    const dialogRef = this._dialog.open(ConsensoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'domanda':                 return item.domanda;
        default: return item[property]
      }
    };
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      
      let searchTerms = JSON.parse(filter);
      let boolSx = String(data.domanda).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.tipo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
      return boolSx;
    }
    return filterFunction;
  }

  drop(event: any){
    this.svcConsensi.updateSeq(event.previousIndex+1, event.currentIndex+1 )
    .subscribe(res=> this.loadData());
  }

  download(risorsaID:number){
    if (risorsaID == null) return;

    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Richiesta download inviata...', panelClass: ['green-snackbar']});
    this.svcRisorse.get(risorsaID).subscribe(
      res=> {
        const pdfData = res.base64.split(',')[1]; // estrae la stringa dalla virgola in avanti

        // const blob = new Blob([pdfData], { type: 'application/pdf' });
        // console.log("blob", blob);              
        // const pdfUrl = URL.createObjectURL(blob);
        // console.log("pdfUrl", pdfUrl);
        // window.open(pdfUrl, '_blank'); // Open in a new tab or window NON FUNZIONA

        const source = `data:application/${res.tipoFile};base64,${pdfData}`;
        const link = document.createElement("a");

        link.href = source;
        link.download = `${res.nomeFile}.${res.tipoFile}`
        link.click();

      }
    )

  }
//#endregion
}
