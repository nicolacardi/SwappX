import {Component, Inject} from '@angular/core';
import {MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { DialogData } from 'src/app/_models/DialogData';
@Component({
  selector: 'app-dialog-yes-no',
  templateUrl: './dialog-yes-no.component.html',
  styleUrls: ['./dialog-yes-no.component.css']
})

export class DialogYesNoComponent   {

  constructor( public dialogRef: MatDialogRef<DialogYesNoComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {

    }
}
