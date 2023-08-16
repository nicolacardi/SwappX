//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { ConsensiService }                      from '../consensi.service';
import { FilesService }                         from '../../fileuploads/file.service';

//classes
import { _UT_Consenso }                         from 'src/app/_models/_UT_Consenso';
import { DialogDataConsensoEdit }               from 'src/app/_models/DialogData';
import { _UT_File } from 'src/app/_models/_UT_File';

//#endregion

@Component({
  selector: 'app-consenso-edit',
  templateUrl: './consenso-edit.component.html',
  styleUrls: ['../consensi.css']
})
export class ConsensoEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  consenso$!:                                   Observable<_UT_Consenso>;
  obsFiles$!:                                      Observable<_UT_File[]>;
  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<ConsensoEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data:       DialogDataConsensoEdit,
              private svcConsensi:              ConsensiService,
              private svcFile:                  FilesService,

              private _loadingService :         LoadingService,
              private fb:                       UntypedFormBuilder, 
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar ) { 
    
    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      id:                                       [null],
      domanda:                                  ['', { validators:[ Validators.required]}],
      numOpzioni:                               [{ value: '' }, { validators:[ Validators.required]}],
      testo1:                                   [''],
      testo2:                                   [''],
      testo3:                                   [''],
      testo4:                                   [''],
      testo5:                                   [''],
      seq:                                      [''],
      fileID:                                   ['']
    });

    this.obsFiles$ = this.svcFile.list();

    
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    if (this.data.consensoID && this.data.consensoID + '' != "0") {

      const obsConsenso$: Observable<_UT_Consenso> = this.svcConsensi.get(this.data.consensoID);
      const loadConsenso$ = this._loadingService.showLoaderUntilCompleted(obsConsenso$);
      this.consenso$ = loadConsenso$
      .pipe(
          tap(
            consenso => {
              this.form.patchValue(consenso)
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

    let testo = [];

    testo[0] = this.form.controls['testo1'];
    testo[1] = this.form.controls['testo2'];
    testo[2] = this.form.controls['testo3'];
    testo[3] = this.form.controls['testo4'];
    testo[4] = this.form.controls['testo5'];

    let testoreordered = []
    let n = 0;
    for (let i = 0; i < 5; i++) { 
      if (testo[i].value != '' && testo[i].value != null) { 
        testoreordered[n] = testo[i].value;
        n++;
      }
    }

    for (let j = 0; j < testoreordered.length; j++) testo[j].setValue(testoreordered[j]);
    
    for (let j = testoreordered.length; j < 5; j++) testo[j].setValue('');
    
    this.form.controls.numOpzioni.setValue(n);

    if (this.form.controls['id'].value == null) {
      this.form.controls.seq.setValue(this.data.maxSeq +1);
      this.svcConsensi.post(this.form.value).subscribe({
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
      this.svcConsensi.put(this.form.value).subscribe({
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
          this.svcConsensi.delete(Number(this.data.consensoID)).subscribe({
            next: res=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this.svcConsensi.renumberSeq().subscribe();
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }

  
//#endregion


}
