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

import { GenitoriListComponent } from './_components/genitori/genitori-list/genitori-list.component';
import { GenitoreDetailsComponent } from './_components/genitori/genitore-details/genitore-details.component';


import { ClassiSezioniAnniListComponent } from './_components/classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { ClasseSezioneAnnoDetailComponent } from './_components/classi/classe-sezione-anno-detail/classe-sezione-anno-detail.component';
import { ClassiDashboardComponent } from './_components/classi/classi-dashboard/classi-dashboard.component';
import { DialogAddComponent } from './_components/classi/dialog-add/dialog-add.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from './_components/utilities/paginator-custom/custom-mat-paginator-int';
import { AlunniPageComponent } from './_components/alunni/alunni-page/alunni-page.component';
import { AlunnoDashboardNewComponent } from './_components/alunni/alunno-dashboard-new/alunno-dashboard-new.component';
import { ClassiSezioniAnniAlunnoComponent } from './_components/classi/classi-sezioni-anni-alunno/classi-sezioni-anni-alunno.component';


@NgModule({
  declarations: [
    AppComponent,
    AlunniListComponent,
    AlunnoDetailsComponent,
    AlunnoDashboardComponent,

    GenitoriListComponent,
    GenitoreDetailsComponent,

    DialogYesNoComponent,
    SnackbarComponent,
    LoadingComponent,
    FiltriComponent,
    ClassiSezioniAnniListComponent,
    ClasseSezioneAnnoDetailComponent,
    ClassiDashboardComponent,
    DialogAddComponent,
    AlunniPageComponent,
    AlunnoDashboardNewComponent,
    ClassiSezioniAnniAlunnoComponent


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
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    {
      provide: MatPaginatorIntl, 
      useClass: CustomMatPaginatorIntl
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
