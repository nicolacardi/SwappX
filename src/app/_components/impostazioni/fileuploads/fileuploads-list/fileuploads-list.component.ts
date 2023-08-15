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
            private sanitizer:                  DomSanitizer
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
    dialogRef.afterClosed().subscribe(() => {() => this.loadData();
    });
  }

  openDetail(fileID:any){
    //TODO DEVE SOLO MOSTRARE IL FILE
    // const dialogConfig : MatDialogConfig = {
    //   panelClass: 'add-DetailDialog',
    //   width: '600px',
    //   height: '430px',
    //   data: { fileID: fileID }
    // };
    // const dialogRef = this._dialog.open(FileuploadEditComponent, dialogConfig);
    // dialogRef.afterClosed().subscribe(() => this.loadData());
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


  //   openFileLink(base64Data: string): void {
  //     //NON FUNZIONA AL MOMENTO
  //     const pdfData = atob(base64Data);
  //     const blob = new Blob([pdfData], { type: 'application/pdf' });
  //     const pdfUrl = URL.createObjectURL(blob);
  
  //     const sanitizedPdfUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
  
  //     window.open(sanitizedPdfUrl.toString(), '_blank');
  // }

//#endregion

}
