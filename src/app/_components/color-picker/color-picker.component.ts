import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {

  public hue!: string
  public color!: string

  constructor(
    public _dialogRef: MatDialogRef<ColorPickerComponent>,
  ) { }

  ngOnInit(): void {
  }

  colorSliderEmitted(e: any) {
    console.log (e)
    this.hue = e;
  }


}
