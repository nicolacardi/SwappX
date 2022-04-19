import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ColorPickerComponent } from '../_components/color-picker/color-picker.component';
import { ColorSliderComponent } from '../_components/color-picker/color-slider/color-slider.component'
import { ColorPaletteComponent } from '../_components/color-picker/color-palette/color-palette.component';
import { MaterialModule } from '../_material/material.module';


@NgModule({
  declarations: [
    ColorPickerComponent,
    ColorSliderComponent,
    ColorPaletteComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    

  ]
})
export class ColorPickerModule { }