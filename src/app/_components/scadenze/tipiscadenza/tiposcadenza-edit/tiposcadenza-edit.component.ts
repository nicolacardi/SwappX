import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../../utilities/dialog-yes-no/dialog-yes-no.component';
import { ColorPickerComponent }                 from '../../../color-picker/color-picker.component';

//services
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { TipiScadenzaService }                  from '../../tipiscadenza.service';

//classes
import { CAL_TipoScadenza }                     from 'src/app/_models/CAL_TipoScadenza';


@Component({
  selector: 'app-tiposcadenza-edit',
  templateUrl: './tiposcadenza-edit.component.html',
  styleUrls: ['../../scadenze.css']
})
export class TipoScadenzaEditComponent implements OnInit {

//#region ----- Variabili -------

  tiposcadenza$!:                                    Observable<CAL_TipoScadenza>;

  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

  constructor(
    public _dialogRef: MatDialogRef<TipoScadenzaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public tiposcadenzaID: number,
    private svcTipiScadenza:                    TipiScadenzaService,
    private _loadingService :                   LoadingService,
    private fb:                                 UntypedFormBuilder, 
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    
  ) { 
    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      id:                         [null],
      descrizione:                ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      color:                      [''],
      ckNota:                     ['']
    });

  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    if (this.tiposcadenzaID && this.tiposcadenzaID + '' != "0") {

      const obsTiposcadenza$: Observable<CAL_TipoScadenza> = this.svcTipiScadenza.get(this.tiposcadenzaID);
      const loadTiposcadenza$ = this._loadingService.showLoaderUntilCompleted(obsTiposcadenza$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.tiposcadenza$ = loadTiposcadenza$
      .pipe(
          tap(
            tiposcadenza => {
              console.log(tiposcadenza);
              this.form.patchValue(tiposcadenza)
            }
          )
      );
    } else {
      this.emptyForm = true
    }

  }
//#endregion

//#region ----- Operazioni CRUD -------

  save(){

    if (this.form.controls['id'].value == null) 
      this.svcTipiScadenza.post(this.form.value)
        .subscribe(res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
    );
    else 
      this.svcTipiScadenza.put(this.form.value)
        .subscribe(res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
    );
  }

  delete(){

    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          this.svcTipiScadenza.delete(Number(this.tiposcadenzaID)).subscribe(
            res=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          );
        }
    });
  }

  openColorPicker() {
    console.log( "passo", this.form.controls.color.value);
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '405px',
      height: '460px',
      data: {ascRGB: this.form.controls.color.value},
    };
    const dialogRef = this._dialog.open(ColorPickerComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => { 
        //devo valorizzare il campo color
        if (result) this.form.controls.color.setValue(result);
        //this.loadData(); 
      }
    );
  }
//#endregion


}
