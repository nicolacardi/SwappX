//#region ----- IMPORTS ------------------------

import { Component, OnInit }                    from '@angular/core';
import { Observable }                           from 'rxjs';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef }              from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//services
import { AnniScolasticiService }                from 'src/app/_components/anniScolastici/anni-scolastici.service';
import { ClasseAnnoMateriaService }             from '../classe-anno-materia.service';

//components
import { DialogOkComponent }                    from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';

//models
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';

//#endregion
@Component({
  selector: 'app-classi-anni-materie-duplica',
  templateUrl: './classi-anni-materie-duplica.component.html',
  styleUrls: ['../classi-anni-materie.css']
})
export class ClassiAnniMaterieDuplicaComponent implements OnInit {

//#region ----- Variabili ----------------------

  obsAnni$!:          Observable<ASC_AnnoScolastico[]>
  form!:              UntypedFormGroup;
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef:            MatDialogRef<ClassiAnniMaterieDuplicaComponent>,
              private svcAnni:              AnniScolasticiService,
              private svcClassiAnniMaterie: ClasseAnnoMateriaService,
              private fb:                   UntypedFormBuilder,
              public _dialog:               MatDialog,
              private _snackBar:            MatSnackBar ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      selectAnnoFrom: [null],
      selectAnnoTo: [null],
    })
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.obsAnni$ = this.svcAnni.list();
  }

//#endregion

//#region ----- Altri metodi --------------------
  
  duplica() {
    if (this.form.controls.selectAnnoFrom.value == this.form.controls.selectAnnoTo.value) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: { titolo: "ATTENZIONE!", sottoTitolo: "L'anno di origine e destinazione coincidono" }
      });
      return;
    };

    this.svcClassiAnniMaterie.duplicaClassiAnniMaterie(this.form.controls.selectAnnoFrom.value, this.form.controls.selectAnnoTo.value).subscribe(
      res => {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record duplicati', panelClass: ['green-snackbar']});
      }
    );
    
  }
//#endregion
}
