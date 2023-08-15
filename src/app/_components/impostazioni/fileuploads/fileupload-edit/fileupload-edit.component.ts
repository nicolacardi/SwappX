//#region ----- IMPORTS ------------------------
import { Component, ElementRef, Inject, ViewChild }                    from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable, tap }                      from 'rxjs';

//components
import { DialogYesNoComponent }                 from 'src/app/_components/utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';

//services
import { LoadingService }                       from 'src/app/_components/utilities/loading/loading.service';

//models
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';
import { ParametriService }                     from 'src/app/_services/parametri.service';
import { DialogDataParametroEdit }              from 'src/app/_models/DialogData';
import { DialogOkComponent } from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';
import { FileDropDirective } from 'src/app/_components/utilities/appfiledrop/appfiledrop.directive';

//#endregion

@Component({
  selector: 'app-fileupload-edit',
  templateUrl: './fileupload-edit.component.html',
  styleUrls: ['../fileuploads.css']
})
export class FileuploadEditComponent {

//#region ----- Variabili ----------------------

  parametro$!:                                  Observable<_UT_Parametro>;
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
              @Inject(MAT_DIALOG_DATA) public data: DialogDataParametroEdit,
              private svcParametri:             ParametriService,
              private _loadingService :         LoadingService,
              private fb:                       UntypedFormBuilder, 
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar ) { 

  _dialogRef.disableClose = true;

  this.form = this.fb.group({
    id:                                       [null],
    parName:                                    [''],
    parValue:                                   [''],
    parDescr:                                   ['', { validators:[ Validators.required]}],
    ckFile:                                     ['']
  });
  }

//#endregion


//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    if (this.data.parametroID && this.data.parametroID + '' != "0") {

      const obsParametro$: Observable<_UT_Parametro> = this.svcParametri.get(this.data.parametroID);
      const loadParametro$ = this._loadingService.showLoaderUntilCompleted(obsParametro$);
      this.parametro$ = loadParametro$
      .pipe(
          tap(
            parametro => {
              this.form.patchValue(parametro)
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

    if (this.form.controls['id'].value == null) {
      this.svcParametri.post(this.form.value).subscribe({
        next: res=> {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          this._dialogRef.close();

        },
        error: err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      });
    }
    else {
      this.svcParametri.put(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
        });
    }
  }

  delete(){

    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          this.svcParametri.delete(Number(this.data.parametroID)).subscribe({
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
      if (this.form.controls['id'].value == null) this.form.controls.parName.setValue ('Documento');
      this.form.controls.parValue.setValue(reader.result);
      this.form.controls.ckFile.setValue(true);
    };
  }
  



}
