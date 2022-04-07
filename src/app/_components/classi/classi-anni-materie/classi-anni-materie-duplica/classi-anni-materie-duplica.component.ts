import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';


//services
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { ClasseAnnoMateriaService } from '../classe-anno-materia.service';

//models
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';

//components
import { DialogOkComponent } from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent } from 'src/app/_components/utilities/snackbar/snackbar.component';


@Component({
  selector: 'app-classi-anni-materie-duplica',
  templateUrl: './classi-anni-materie-duplica.component.html',
  styleUrls: ['../classi-anni-materie.css']
})
export class ClassiAnniMaterieDuplicaComponent implements OnInit {

  obsAnni$!:          Observable<ASC_AnnoScolastico[]>
  form!:              FormGroup;

  constructor(public _dialogRef:            MatDialogRef<ClassiAnniMaterieDuplicaComponent>,
              private svcAnni:              AnniScolasticiService,
              private svcClassiAnniMaterie: ClasseAnnoMateriaService,
              private fb:                   FormBuilder,
              public _dialog:               MatDialog,
              private _snackBar:            MatSnackBar ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      selectAnnoFrom: [null],
      selectAnnoTo: [null],
    })
  }

  ngOnInit() {
    this.obsAnni$ = this.svcAnni.list();
  }

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
}
