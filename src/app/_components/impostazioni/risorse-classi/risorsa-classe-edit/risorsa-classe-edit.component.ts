//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';
// import { CustomOption, QuillEditorComponent }   from 'ngx-quill'
// import 'quill-mention'

//components
import { SnackbarComponent }                    from '../../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { RisorseClassiService }                 from 'src/app/_components/impostazioni/risorse-classi/risorse-classi.service';

//models
import { DialogDataRisorsaClasseEdit }          from 'src/app/_models/DialogData';
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';
import { CLS_RisorsaClasse } from 'src/app/_models/CLS_RisorsaClasse';


@Component({
  selector: 'app-risorsa-classe-edit',
  templateUrl: './risorsa-classe-edit.component.html',
  styleUrls: ['../risorse-classi.css']
})
export class RisorsaClasseEditComponent {

//#region ----- Variabili ----------------------

  risorsaClasse$!:                              Observable<CLS_RisorsaClasse>;
  obsRisorseClassi$!:                           Observable<CLS_RisorsaClasse[]>;
  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  modules:                                      any = {};
  ckCheckBoxes=                                 false;

  //#endregion

  //#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<RisorsaClasseEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data:       DialogDataRisorsaClasseEdit,
              private svcRisorseClassi:         RisorseClassiService,

              private _loadingService :         LoadingService,
              private fb:                       UntypedFormBuilder, 
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar ) { 
    
    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      id:                                       [null],
      parName:                                  ['', { validators:[ Validators.required]}],
      parValue:                                 ['', { validators:[ Validators.required]}],
      parDescr:                                 ['', { validators:[ Validators.required]}],
      ckSetupPage:                              [''],
      ckCheckBox:                               [''],
      seq:                                      ['']
    });

    
  }

  //#endregion

  //#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData() {

    if (this.data.risorsaClasseID && this.data.risorsaClasseID + '' != "0") {

      const obsRisorsaClasse$: Observable<CLS_RisorsaClasse> = this.svcRisorseClassi.get(this.data.risorsaClasseID);
      const loadRisorsaClasse$ = this._loadingService.showLoaderUntilCompleted(obsRisorsaClasse$);
      this.risorsaClasse$ = loadRisorsaClasse$
      .pipe(
          tap(
            risorsaClasse => {
              this.form.patchValue(risorsaClasse)

              //se si tratta di checkbox inserisco un controllo che si chiama 'ck_n' per ciascun valore
              
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
      //this.form.controls.seq.setValue(this.data.maxSeq +1);
      this.svcRisorseClassi.post(this.form.value).subscribe({
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
      this.svcRisorseClassi.put(this.form.value).subscribe({
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
          this.svcRisorseClassi.delete(Number(this.data.risorsaClasseID)).subscribe({
            next: () =>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              //this.svcRisorseClassi.renumberSeq().subscribe();
              this._dialogRef.close();
            },
            error: err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }

//#endregion

}
