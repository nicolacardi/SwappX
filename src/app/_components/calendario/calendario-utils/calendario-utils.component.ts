import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-calendario-utils',
  templateUrl: './calendario-utils.component.html',
  styleUrls: ['./calendario-utils.component.css']
})
export class CalendarioUtilsComponent implements OnInit {

  constructor(
    public _dialogRef: MatDialogRef<CalendarioUtilsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
  ) {
    _dialogRef.disableClose = true;
   }

  ngOnInit(): void {
  }

}
