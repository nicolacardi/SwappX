import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

//components
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';


//services
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';


//classes
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';


@Component({
  selector: 'app-obiettivi-duplica',
  templateUrl: './obiettivi-duplica.component.html',
  styleUrls: ['./../obiettivi.css']
})
export class ObiettiviDuplicaComponent implements OnInit {
  obsAnni$!:            Observable<ASC_AnnoScolastico[]>
  form!:                FormGroup;

  constructor(
    public _dialogRef: MatDialogRef<ObiettiviDuplicaComponent>,
    private svcAnni: AnniScolasticiService,
    private fb: FormBuilder,
    public _dialog: MatDialog,
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

    this._dialogRef.close();
  }

}
