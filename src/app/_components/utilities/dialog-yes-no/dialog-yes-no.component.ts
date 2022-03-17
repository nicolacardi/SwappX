import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  titolo:               string;
  sottoTitolo:          string;
  idAnno:               number;
  idClasse:             number;
  idAlunno:             number;
}

export interface DialogDataLezione {
  idLezione:            number;
  start:                string;
  end:                  string;
  idClasseSezioneAnno:  number;
}

export interface DialogDataCalendarioUtils {
  start:                Date;
  idClasseSezioneAnno:  number;
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
