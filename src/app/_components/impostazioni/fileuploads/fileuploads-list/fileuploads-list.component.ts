//#region ----- IMPORTS ------------------------

import { Component, ViewChild }                 from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';

//components
import { FileuploadEditComponent }              from '../fileupload-edit/fileupload-edit.component';

//services
import { LoadingService }                       from 'src/app/_components/utilities/loading/loading.service';
import { FilesService }                         from '../file.service';

//models
import { _UT_File }                             from 'src/app/_models/_UT_File';
import { DomSanitizer, SafeResourceUrl }        from '@angular/platform-browser';
import { SnackbarComponent } from 'src/app/_components/utilities/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogYesNoComponent } from 'src/app/_components/utilities/dialog-yes-no/dialog-yes-no.component';

//#endregion

@Component({
  selector: 'app-fileuploads-list',
  templateUrl: './fileuploads-list.component.html',
  styleUrls: ['../fileuploads.css']
})
export class FileuploadsListComponent {

//#region ----- Variabili ----------------------


  matDataSource = new MatTableDataSource<_UT_File>();
  obsFileUploads$!:                             Observable<_UT_File[]>;
  
  displayedColumns: string[] = [
    "actionsColumn",
    "delete", 
    "nomeFile",
    "tipoFile"
  ];

  rptTitle = 'Lista File';
  rptFileName = 'ListaFile';
  rptFieldsToKeep  = [
    "nomeFile",
  ];

  rptColumnsNames  = [
    "nomeFile",
  ];

  filterValue = '';       //Filtro semplice

  filterValues = {
    nomeFile: '',
    filtrosx: ''
  }


//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatSort) sort!:                    MatSort;

//#endregion

//#region ----- Constructor --------------------
constructor(private svcFiles:                   FilesService,
            private _loadingService:            LoadingService,
            public _dialog:                     MatDialog,
            private _snackBar:                  MatSnackBar,

            ) {}


//#endregion

//#region ----- LifeCycle Hooks e simili--------
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.obsFileUploads$ = this.svcFiles.list();  
    const loadFileUploads$ =this._loadingService.showLoaderUntilCompleted(this.obsFileUploads$);

    loadFileUploads$.subscribe(
      val =>   {
        console.log ("fileuploads - loadData - val", val);
        this.matDataSource.data = val;
        // this.sortCustom(); 
        this.matDataSource.sort = this.sort; 
        // this.matDataSource.filterPredicate = this.filterPredicate(); //usiamo questo per uniformità con gli altri component nei quali c'è anche il filtro di destra, così volendo lo aggiungiamo velocemente
      }
    );
  }
//#endregion
//#region ----- Add Edit Drop ------------------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '600px',
      height: '430px',
      data: { fileID:  0}
    };
    const dialogRef = this._dialog.open(FileuploadEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe({
      next: res=>{
        this.loadData();
      }
    });
    
    (
      
      
      
      () => {() => this.loadData();});
  }

  download(fileID:number){

    this.svcFiles.get(fileID).subscribe(
      res=> {
        const pdfData = res.base64.split(',')[1]; // estrae la stringa dalla virgola in avanti

        // const blob = new Blob([pdfData], { type: 'application/pdf' });
        // console.log("blob", blob);              
        // const pdfUrl = URL.createObjectURL(blob);
        // console.log("pdfUrl", pdfUrl);
        // window.open(pdfUrl, '_blank'); // Open in a new tab or window NON FUNZIONA

        const source = `data:application/pdf;base64,${pdfData}`;
        const link = document.createElement("a");

        link.href = source;
        link.download = `${"download"}.pdf`
        link.click();

      }
    )

  }

  delete (fileID: number) {

    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del file ?"}
    });

    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcFiles.delete(fileID).subscribe({
          next: res=>{
            this._snackBar.openFromComponent(SnackbarComponent,{data: 'File cancellato', panelClass: ['red-snackbar']});
            this.loadData();
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
        });
      }
    });
  }

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

    // filterPredicate(): (data: any, filter: string) => boolean {
    //   let filterFunction = function(data: any, filter: any): boolean {
        
    //     let searchTerms = JSON.parse(filter);
    //     let boolSx = String(data.domanda).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
    //               || String(data.domanda).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
    //     return boolSx;
    //   }
    //   return filterFunction;
    // }

    drop(event: any){

    }




//#endregion

}
