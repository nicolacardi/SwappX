//#region ----- IMPORTS ------------------------
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable, tap }                      from 'rxjs';

//components
import { DialogYesNoComponent }                 from 'src/app/_components/utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';
import { DialogDataFileEdit }                   from 'src/app/_models/DialogData';
import { DialogOkComponent }                    from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';

//services
import { FileDropDirective }                    from 'src/app/_components/utilities/appfiledrop/appfiledrop.directive';
import { LoadingService }                       from 'src/app/_components/utilities/loading/loading.service';
import { FilesService }                         from '../file.service';

//models
import { _UT_File }                             from 'src/app/_models/_UT_File';
import { User }                                 from 'src/app/_user/Users';
import { Utility } from 'src/app/_components/utilities/utility.component';

//#endregion

@Component({
  selector: 'app-fileupload-edit',
  templateUrl: './fileupload-edit.component.html',
  styleUrls: ['../fileuploads.css']
})
export class FileuploadEditComponent {

//#region ----- Variabili ----------------------
  currUser:                                     User;
  file$!:                                       Observable<_UT_File>;
  nomeFile!:                                    string;
  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  fileDropped: boolean = false;
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(FileDropDirective) fileDropDirective!: FileDropDirective;
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<FileuploadEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogDataFileEdit,
              private svcFiles:                 FilesService,
              private _loadingService :         LoadingService,
              private fb:                       UntypedFormBuilder, 
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar ) { 

  this.currUser = Utility.getCurrentUser();

  _dialogRef.disableClose = true;

  this.form = this.fb.group({
    id:                                       [null],
    nomeFile:                                   [''],
    tipoFile:                                   [''],
    base64:                                     [''],
    dtIns:                                      [''],
    userIns:                                    ['']
  });
  }


//#endregion


//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    if (this.data.fileID && this.data.fileID + '' != "0") {

      const obsFile$: Observable<_UT_File> = this.svcFiles.getLight(this.data.fileID);
      const loadFile$ = this._loadingService.showLoaderUntilCompleted(obsFile$);
      this.file$ = loadFile$
      .pipe(
          tap(
            file => {
              console.log ("fileupload-edit - loadData - file ", file);
              this.form.patchValue(file)
            }
          )
      );
    }
    else 
      this.emptyForm = true
  }

//#endregion


//#region ----- Operazioni CRUD ----------------

  save(){
    this.form.controls.userIns.setValue(this.currUser.personaID);
    console.log ("fileupload-edit- save - this.form", this.form.value);
    if (this.form.controls['id'].value == null) {
      this.svcFiles.post(this.form.value).subscribe({
        next: res=> {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          this._dialogRef.close();
        },
        error: err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      });
    }
    // else {
    //   this.svcFiles.put(this.form.value).subscribe({
    //       next: res=> {
    //         this._dialogRef.close();
    //         this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
    //       },
    //       error: err=> (
    //         this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    //       )
    //     });
    // }
  }

  delete(){

    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          this.svcFiles.delete(Number(this.data.fileID)).subscribe({
            next: res=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }


//#endregion

  onImageSelect (e: any) {
    this.onImageChange(e.files[0])
  }

  onImageDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileDropped = true;
      this.onImageChange(files[0]);
    }
  }


  onImageChange(file: File) {

    if (file.size > 200000) {
      this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: { titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)" }
      });
      return;
    } 

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      this.nomeFile = file.name;
      this.form.controls.base64.setValue(reader.result);
    };
  }
  



}
