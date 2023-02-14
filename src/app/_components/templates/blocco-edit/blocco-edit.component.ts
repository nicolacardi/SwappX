import { Component, Inject, OnInit }            from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn }               from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { tooWideValidator, tooHighValidator}    from '../../utilities/crossfieldvalidators/tooWide';

//services
import { BlocchiService }                       from '../blocchi.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';
import { tap } from 'rxjs/operators';
import { ColorPickerComponent } from '../../color-picker/color-picker.component';





@Component({
  selector: 'app-blocco-edit',
  templateUrl: './blocco-edit.component.html',
  styleUrls: ['../templates.css']
})
export class BloccoEditComponent implements OnInit {
//#region ----- Variabili -------
  blocco$!:                                     Observable<TEM_Blocco>
  form! :                                       FormGroup;

//#endregion





  constructor(
    private svcBlocchi:                         BlocchiService,
    public _dialogRef:                          MatDialogRef<BloccoEditComponent>,
    @Inject(MAT_DIALOG_DATA) public bloccoID:   number,
    private fb:                                 FormBuilder, 


    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    private _loadingService :                   LoadingService,
    
  ) { 

    this.form = this.fb.group(
      {
        id:                                     [null],
        paginaID:                               [0],
        x:                                      [0],
        y:                                      [0],
        w:                                      [0],
        h:                                      [0],
        color:                                  [''],
        ckFill:                                 [false]
      }, { validators: [tooWideValidator, tooHighValidator]});


  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    if (this.bloccoID && this.bloccoID + '' != "0") {

      const obsBlocco$: Observable<TEM_Blocco> = this.svcBlocchi.get(this.bloccoID);
      const loadBlocco$ = this._loadingService.showLoaderUntilCompleted(obsBlocco$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.blocco$ = loadBlocco$
      .pipe(
          tap(
            blocco => {
              console.log (blocco);
              this.form.patchValue(blocco)
            }
          )
      );
    }

  }
//#endregion

save(){
  this.svcBlocchi.put(this.form.value)
    .subscribe(res=> {
      this._dialogRef.close(this.bloccoID);
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
    },
    err=> (
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    )
  );
}

  delete() {
    this.svcBlocchi.delete(this.bloccoID).subscribe(
      res=>{
        this._snackBar.openFromComponent(SnackbarComponent,
          {data: 'Blocco cancellato', panelClass: ['red-snackbar']}
        );
        this._dialogRef.close(this.bloccoID);
      },
      err=> (
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
      )
    );
  }

  openColorPicker() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '405px',
      height: '460px',
      data: {ascRGB: this.form.controls.color.value},
    };
    const dialogRef = this._dialog.open(ColorPickerComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => { 
        if (result) this.form.controls.color.setValue(result);
        //this.loadData(); 
      }
    );
  }
}
