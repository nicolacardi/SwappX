import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DragDropModule} from '@angular/cdk/drag-drop';

import { MaterialModule } from './_material/material.module';

import { DialogYesNoComponent } from './_components/utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from './_components/utilities/snackbar/snackbar.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { LoadingComponent } from './_components/utilities/loading/loading.component';
import { FiltriComponent } from './_components/utilities/filtri/filtri.component';

import { AlunniListComponent } from './_components/alunni/alunni-list/alunni-list.component';
import { AlunnoDetailsComponent } from './_components/alunni/alunno-details/alunno-details.component';
import { AlunnoDashboardComponent } from './_components/alunni/alunno-dashboard/alunno-dashboard.component';
//import { AlunnoHeaderComponent } from './_components/alunni/alunno-header/alunno-header.component';

import { GenitoriListComponent } from './_components/genitori/genitori-list/genitori-list.component';
import { GenitoreDetailsComponent } from './_components/genitori/genitore-details/genitore-details.component';

import { ClassiListComponent } from './_components/classi/classi-list/classi-list.component';
import { ClasseDetailsComponent } from './_components/classi/classe-details/classe-details.component';

@NgModule({
  declarations: [
    AppComponent,
    AlunniListComponent,
    AlunnoDetailsComponent,
    AlunnoDashboardComponent,

    GenitoriListComponent,
    GenitoreDetailsComponent,
    
    ClassiListComponent,
    ClasseDetailsComponent,

    DialogYesNoComponent,
    SnackbarComponent,
    LoadingComponent,
    //AlunnoHeaderComponent,
    FiltriComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    DragDropModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
