import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { MacroMaterieService } from '../macromaterie.service';
import { MaterieService } from '../materie.service';

//classes
import { MAT_MacroMateria } from 'src/app/_models/MAT_MacroMateria';
import { MAT_Materia } from 'src/app/_models/MAT_Materia';
import { ColorPickerComponent } from '../../color-picker/color-picker.component';


@Component({
  selector: 'app-materia-edit',
  templateUrl: './materia-edit.component.html',
  styleUrls: ['../materie.css']
})
export class MateriaEditComponent implements OnInit {

//#region ----- Variabili -------

  materia$!:                  Observable<MAT_Materia>;
  obsMacroMaterie$!:          Observable<MAT_MacroMateria[]>;

  form! :                     UntypedFormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
//#endregion

  constructor(
    public _dialogRef: MatDialogRef<MateriaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public materiaID: number,
    private svcMaterie:                     MaterieService,
    private _loadingService :               LoadingService,
    private fb:                             UntypedFormBuilder, 
    public _dialog:                         MatDialog,
    private _snackBar:                      MatSnackBar,
    private svcMacroMaterie:                MacroMaterieService,
    
  ) { 
    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      id:                         [null],
      descrizione:                ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      macroMateriaID:             [''],
      color:                      ['']
    });

  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    this.obsMacroMaterie$ = this.svcMacroMaterie.list()


    if (this.materiaID && this.materiaID + '' != "0") {

      const obsMateria$: Observable<MAT_Materia> = this.svcMaterie.get(this.materiaID);
      const loadMateria$ = this._loadingService.showLoaderUntilCompleted(obsMateria$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.materia$ = loadMateria$
      .pipe(
          tap(
            materia => {
              console.log(materia);
              this.form.patchValue(materia)
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
      this.svcMaterie.post(this.form.value)
        .subscribe(res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
    );
    else 
      this.svcMaterie.put(this.form.value)
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
          this.svcMaterie.delete(Number(this.materiaID)).subscribe(
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
