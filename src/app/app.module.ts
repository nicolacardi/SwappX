import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DragDropModule} from '@angular/cdk/drag-drop';
import { MaterialModule } from './_material/material.module';


import { AuthInterceptor } from './_user/auth/auth.interceptor';
import { ErrorInterceptor } from './_user/auth/error.interceptor';

import { HomeComponent } from './_components/home/home.component';
import { ClassiSezioniAnniSummaryComponent } from './_components/classi/classi-sezioni-anni-summary/classi-sezioni-anni-summary.component';
import { RettepagamentiSummaryComponent } from './_components/pagamenti/rettepagamenti-summary/rettepagamenti-summary.component';

import { AlunniPageComponent } from './_components/alunni/alunni-page/alunni-page.component';
import { AlunniListComponent } from './_components/alunni/alunni-list/alunni-list.component';
import { AlunnoEditComponent } from './_components/alunni/alunno-edit/alunno-edit.component';
import { AlunniFilterComponent } from './_components/alunni/alunni-filter/alunni-filter.component';
import { AlunniToolbarComponent } from './_components/alunni/alunni-toolbar/alunni-toolbar.component';

import { GenitoriPageComponent } from './_components/genitori/genitori-page/genitori-page.component';
import { GenitoriListComponent } from './_components/genitori/genitori-list/genitori-list.component';
import { GenitoreEditComponent } from './_components/genitori/genitore-edit/genitore-edit.component';
import { GenitoriFilterComponent } from './_components/genitori/genitori-filter/genitori-filter.component';

import { PersoneListComponent } from './_components/persone/persone-list/persone-list.component';
import { PersonaEditComponent } from './_components/persone/persona-edit/persona-edit.component';
import { PersoneFilterComponent } from './_components/persone/persone-filter/persone-filter.component';
import { PersonePageComponent } from './_components/persone/persone-page/persone-page.component';

import { ClassiPageComponent } from './_components/classi/classi-page/classi-page.component';
import { ClasseSezioneAnnoEditComponent } from './_components/classi/classe-sezione-anno-edit/classe-sezione-anno-edit.component';
import { ClassiSezioniAnniFilterComponent } from './_components/classi/classi-sezioni-anni-filter/classi-sezioni-anni-filter.component';
import { ClassiSezioniAnniListComponent } from './_components/classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { ClassiDashboardComponent } from './_components/classi/classi-dashboard/classi-dashboard.component';
import { DialogAddComponent } from './_components/classi/dialog-add/dialog-add.component';

import { PagamentiPageComponent } from './_components/pagamenti/pagamenti-page/pagamenti-page.component';
import { PagamentiListComponent } from './_components/pagamenti/pagamenti-list/pagamenti-list.component';
import { PagamentiFilterComponent } from './_components/pagamenti/pagamenti-filter/pagamenti-filter.component';

import { RettePageComponent } from './_components/pagamenti/rette-page/rette-page.component';
import { RetteListComponent } from './_components/pagamenti/rette-list/rette-list.component';
import { RettaEditComponent } from './_components/pagamenti/retta-edit/retta-edit.component';
import { RettameseEditComponent } from './_components/pagamenti/rettamese-edit/rettamese-edit.component';
import { RettapagamentoEditComponent } from './_components/pagamenti/rettapagamento-edit/rettapagamento-edit.component';




import { UserService } from './_user/user.service';
import { UserComponent } from './_user/user.component';
import { LoginComponent } from './_user/login/login.component';
import { RegisterComponent } from './_user/register/register.component';
import { UsersPageComponent } from './_components/users/users-page/users-page.component';
import { UsersListComponent } from './_components/users/users-list/users-list.component';
import { UsersFilterComponent } from './_components/users/users-filter/users-filter.component';

import { MessaggiComponent } from './_components/messaggi/messaggi.component';

import { ToolbarComponent } from './_components/toolbar/toolbar.component';
import { SceltaColonneComponent } from './_components/toolbar/scelta-colonne/scelta-colonne.component';

import { DialogYesNoComponent } from './_components/utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent } from './_components/utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent } from './_components/utilities/snackbar/snackbar.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { LoadingComponent } from './_components/utilities/loading/loading.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from './_components/utilities/paginator-custom/custom-mat-paginator-int';
import { HighlightPipe } from './_components/utilities/highlight/highlight.pipe';
import { AccountComponent } from './_components/account/account.component';
import { PhotocropComponent } from './_components/utilities/photocrop/photocrop.component';
import { EventEmitterService } from './_services/event-emitter.service';



@NgModule({
  declarations: [
    AppComponent,
    
    HomeComponent,
   
    RettepagamentiSummaryComponent,
    ClassiSezioniAnniSummaryComponent,

    AlunniPageComponent,
    AlunniListComponent,
    AlunnoEditComponent,
    AlunniFilterComponent,
    AlunniToolbarComponent,

    GenitoriPageComponent,
    GenitoriListComponent,
    GenitoreEditComponent,
    GenitoriFilterComponent,

    PersonePageComponent,
    PersoneListComponent,
    PersonaEditComponent,
    PersoneFilterComponent,

    ClassiPageComponent,
    ClasseSezioneAnnoEditComponent,
    ClassiSezioniAnniFilterComponent,
    ClassiSezioniAnniListComponent,
    ClassiDashboardComponent,
    DialogAddComponent,
    
    PagamentiListComponent,
    PagamentiPageComponent,
    PagamentiFilterComponent,
    
    
    RettePageComponent,

    RetteListComponent,
    RettaEditComponent,
    RettameseEditComponent,
    RettapagamentoEditComponent,
    
    
    ToolbarComponent,
    SceltaColonneComponent,

    LoginComponent,
    RegisterComponent,

    UserComponent,
    UsersPageComponent,
    UsersListComponent,
    UsersFilterComponent,

    MessaggiComponent,
 
    HighlightPipe,
    DialogYesNoComponent,
    DialogOkComponent,
    LoadingComponent,
    SnackbarComponent,
    AccountComponent,
    PhotocropComponent,

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
    UserService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    //{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },      //Roles
    
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
    { provide: EventEmitterService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
