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
import { DialogOkComponent } from './_components/utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent } from './_components/utilities/snackbar/snackbar.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { LoadingComponent } from './_components/utilities/loading/loading.component';


import { AlunniListComponent } from './_components/alunni/alunni-list/alunni-list.component';
import { AlunnoEditComponent } from './_components/alunni/alunno-edit/alunno-edit.component';

import { GenitoriListComponent } from './_components/genitori/genitori-list/genitori-list.component';
import { GenitoreEditComponent } from './_components/genitori/genitore-edit/genitore-edit.component';


import { ClassiSezioniAnniListComponent } from './_components/classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { ClasseSezioneAnnoDetailComponent } from './_components/classi/classe-sezione-anno-detail/classe-sezione-anno-detail.component';
import { ClassiDashboardComponent } from './_components/classi/classi-dashboard/classi-dashboard.component';
import { DialogAddComponent } from './_components/classi/dialog-add/dialog-add.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from './_components/utilities/paginator-custom/custom-mat-paginator-int';
import { AlunniPageComponent } from './_components/alunni/alunni-page/alunni-page.component';
import { RettePageComponent } from './_components/pagamenti/rette-page/rette-page.component';
import { PagamentiListComponent } from './_components/pagamenti/pagamenti-list/pagamenti-list.component';
import { PagamentiPageComponent } from './_components/pagamenti/pagamenti-page/pagamenti-page.component';
import { RetteListComponent } from './_components/pagamenti/rette-list/rette-list.component';
import { RettaEditComponent } from './_components/pagamenti/retta-edit/retta-edit.component';
import { RettameseEditComponent } from './_components/pagamenti/rettamese-edit/rettamese-edit.component';
import { RettapagamentoEditComponent } from './_components/pagamenti/rettapagamento-edit/rettapagamento-edit.component';
import { AlunniFilterComponent } from './_components/alunni/alunni-filter/alunni-filter.component';
import { ToolbarComponent } from './_components/alunni/toolbar/toolbar.component';
import { GenitoriPageComponent } from './_components/genitori/genitori-page/genitori-page.component';
import { GenitoriFilterComponent } from './_components/genitori/genitori-filter/genitori-filter.component';


@NgModule({
  declarations: [
    AppComponent,
    
    AlunniPageComponent,
    AlunniListComponent,
    AlunnoEditComponent,
    AlunniFilterComponent,

    GenitoriPageComponent,
    GenitoriListComponent,
    GenitoreEditComponent,
    GenitoriFilterComponent,


    ClassiSezioniAnniListComponent,
    ClasseSezioneAnnoDetailComponent,
    ClassiDashboardComponent,
    
    
    RettePageComponent,
    PagamentiListComponent,
    PagamentiPageComponent,
    RetteListComponent,
    RettaEditComponent,
    RettameseEditComponent,
    RettapagamentoEditComponent,
    
    ToolbarComponent,

    DialogAddComponent,
    DialogYesNoComponent,
    DialogOkComponent,
    SnackbarComponent,
    LoadingComponent,

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
