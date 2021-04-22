import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DragDropModule} from '@angular/cdk/drag-drop';

import { MaterialModule } from './_material/material.module';

import { AlunniListComponent } from './alunni/alunni-list/alunni-list.component';
import { AlunnoDetailsComponent } from './alunni/alunno-details/alunno-details.component';

import { GenitoriListComponent } from './genitori/genitori-list/genitori-list.component';
import { GenitoreDetailsComponent } from './genitori/genitore-details/genitore-details.component';



@NgModule({
  declarations: [
    AppComponent,
    AlunniListComponent,
    GenitoriListComponent,
    AlunnoDetailsComponent,
    GenitoreDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    DragDropModule,
    ReactiveFormsModule,
  ],
  providers: [

    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' }
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
