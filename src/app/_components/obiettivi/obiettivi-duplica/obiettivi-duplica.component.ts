import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//components
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { ObiettiviService } from '../obiettivi.service';

//classes
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';


@Component({
  selector: 'app-obiettivi-duplica',
  templateUrl: './obiettivi-duplica.component.html',
  styleUrls: ['./../obiettivi.css']
})
export class ObiettiviDuplicaComponent implements OnInit {
  obsAnni$!:            Observable<ASC_AnnoScolastico[]>
  form!:                UntypedFormGroup;

  constructor(
    public _dialogRef:                      MatDialogRef<ObiettiviDuplicaComponent>,
    private svcAnni:                        AnniScolasticiService,
    private svcObiettivi:                   ObiettiviService,
    private fb:                             UntypedFormBuilder,
    public _dialog:                         MatDialog,
    private _snackBar:                      MatSnackBar

  ) {
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
    this.svcObiettivi.duplicaObiettivi(this.form.controls.selectAnnoFrom.value, this.form.controls.selectAnnoTo.value).subscribe(
      res => {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record duplicati', panelClass: ['green-snackbar']});
      }
    );
  }

}
