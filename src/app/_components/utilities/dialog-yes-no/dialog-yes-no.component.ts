import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  titolo: string;
  sottoTitolo: string;
  idAnno: number;
  idClasse: number;
  idAlunno: number;
}

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
