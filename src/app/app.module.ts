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
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import listPlugin from '@fullcalendar/list'; // a plugin!
import timegridPlugin from '@fullcalendar/timegrid'; // a plugin!


import interactionPlugin from '@fullcalendar/interaction'; // a plugin!

import { AuthInterceptor } from './_user/auth/auth.interceptor';
import { ErrorInterceptor } from './_user/auth/error.interceptor';

import { HomeComponent } from './_components/home/home.component';
import { ClassiSezioniAnniSummaryComponent } from './_components/classi/classi-sezioni-anni-summary/classi-sezioni-anni-summary.component';
import { RettepagamentiSummaryComponent } from './_components/pagamenti/rettepagamenti-summary/rettepagamenti-summary.component';

import { AlunniPageComponent } from './_components/alunni/alunni-page/alunni-page.component';
import { AlunniListComponent } from './_components/alunni/alunni-list/alunni-list.component';
import { AlunnoEditComponent } from './_components/alunni/alunno-edit/alunno-edit.component';
import { AlunniFilterComponent } from './_components/alunni/alunni-filter/alunni-filter.component';

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

import { IscrizioniAddComponent } from './_components/classi/iscrizioni-add/iscrizioni-add.component';
import { IscrizioniClasseListComponent } from './_components/classi/iscrizioni-classe-list/iscrizioni-classe-list.component';
import { IscrizioniPageComponent } from './_components/classi/iscrizioni-page/iscrizioni-page.component';
import { IscrizioniListComponent } from './_components/classi/iscrizioni-list/iscrizioni-list.component';
import { IscrizioniFilterComponent } from './_components/classi/iscrizioni-filter/iscrizioni-filter.component';
import { IscrizioniClasseCalcoloComponent } from './_components/classi/iscrizioni-classe-calcolo/iscrizioni-classe-calcolo.component';
import { IscrizioniAlunnoListComponent } from './_components/classi/iscrizioni-alunno-list/iscrizioni-alunno-list.component';

import { DocenzeListComponent } from './_components/classi/docenze/docenze-list/docenze-list.component';

import { PagamentiPageComponent } from './_components/pagamenti/pagamenti-page/pagamenti-page.component';
import { PagamentiListComponent } from './_components/pagamenti/pagamenti-list/pagamenti-list.component';
import { PagamentiFilterComponent } from './_components/pagamenti/pagamenti-filter/pagamenti-filter.component';

import { RettePageComponent } from './_components/pagamenti/rette-page/rette-page.component';
import { RetteListComponent } from './_components/pagamenti/rette-list/rette-list.component';
import { RettaEditComponent } from './_components/pagamenti/retta-edit/retta-edit.component';
import { RettameseEditComponent } from './_components/pagamenti/rettamese-edit/rettamese-edit.component';
import { RettapagamentoEditComponent } from './_components/pagamenti/rettapagamento-edit/rettapagamento-edit.component';
import { RettaCalcoloAlunnoComponent } from './_components/pagamenti/retta-calcolo-alunno/retta-calcolo-alunno.component';
import { RettaCalcoloComponent } from './_components/pagamenti/retta-calcolo/retta-calcolo.component';
import { RettaannoEditComponent } from './_components/pagamenti/rettaanno-edit/rettaanno-edit.component';


import { MaterieListComponent } from './_components/materie/materie-list/materie-list.component';
import { MateriePageComponent } from './_components/materie/materie-page/materie-page.component';
import { MateriaEditComponent } from './_components/materie/materia-edit/materia-edit.component';

import { ObiettiviPageComponent } from './_components/obiettivi/obiettivi-page/obiettivi-page.component';
import { ObiettiviListComponent } from './_components/obiettivi/obiettivi-list/obiettivi-list.component';

import { PagellaEditComponent } from './_components/pagelle/pagella-edit/pagella-edit.component';

import { LezioniCalendarioComponent } from './_components/lezioni/lezioni-calendario/lezioni-calendario.component';
import { LezioneComponent } from './_components/lezioni/lezione-edit/lezione.component';
import { LezioniUtilsComponent } from './_components/lezioni/lezioni-utils/lezioni-utils.component';

import { DocenzeAddComponent } from './_components/classi/docenze/docenze-add/docenze-add.component';
import { DocenzaEditComponent } from './_components/classi/docenze/docenza-edit/docenza-edit.component';



import { UserService } from './_user/user.service';
import { UserComponent } from './_user/user.component';
import { LoginComponent } from './_user/login/login.component';
import { RegisterComponent } from './_user/register/register.component';
import { UsersPageComponent } from './_components/users/users-page/users-page.component';
import { UsersListComponent } from './_components/users/users-list/users-list.component';
import { UsersFilterComponent } from './_components/users/users-filter/users-filter.component';
import { UserEditComponent } from './_components/users/user-edit/user-edit.component';


import { MessaggiComponent } from './_components/messaggi/messaggi.component';
import { ProfiloComponent } from './_components/account/profilo/profilo.component';
import { ChangePswComponent } from './_components/account/change-psw/change-psw.component';

import { ToolbarComponent } from './_components/utilities/toolbar/toolbar.component';
import { SceltaColonneComponent } from './_components/utilities/toolbar/scelta-colonne/scelta-colonne.component';

import { DialogYesNoComponent } from './_components/utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent } from './_components/utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent } from './_components/utilities/snackbar/snackbar.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { LoadingComponent } from './_components/utilities/loading/loading.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from './_components/utilities/paginator-custom/custom-mat-paginator-int';
import { HighlightPipe } from './_components/utilities/highlight/highlight.pipe';
import { HighlightDatePipe } from './_components/utilities/highlight/highlightDate.pipe';
import { PhotocropComponent } from './_components/utilities/photocrop/photocrop.component';
import { EventEmitterService } from './_services/event-emitter.service';
import { ImpostazioniComponent } from './_components/impostazioni/impostazioni.component';

import { ResizeColumnDirective } from './_components/utilities/resize-column/resize-column.directive';

import { ResetPasswordComponent } from './_user/reset-password/reset-password.component';
import { DatePipe } from '@angular/common';
import { ObiettivoEditComponent } from './_components/obiettivi/obiettivo-edit/obiettivo-edit.component';
import { VotiObiettiviEditComponent } from './_components/pagelle/voti-obiettivi-edit/voti-obiettivi-edit.component';
import { ClassiAnniMaterieListComponent } from './_components/classi/classi-anni-materie/classi-anni-materie-list/classi-anni-materie-list.component';
import { TipiVotoPageComponent } from './_components/classi/classi-anni-materie/tipi-voto-page/tipi-voto-page.component';
import { ClasseAnnoMateriaEditComponent } from './_components/classi/classi-anni-materie/classe-anno-materia-edit/classe-anno-materia-edit.component';
import { ObiettiviFilterComponent } from './_components/obiettivi/obiettivi-filter/obiettivi-filter.component';


FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  listPlugin,
  timegridPlugin,
  interactionPlugin
]);
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
    
    DocenzeListComponent,

    IscrizioniClasseListComponent,
    IscrizioniAddComponent,

    IscrizioniPageComponent,
    IscrizioniListComponent,
    //IscrizioniEditComponent,
    IscrizioniFilterComponent,

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

    HighlightDatePipe,
    DialogYesNoComponent,
    DialogOkComponent,
    LoadingComponent,
    SnackbarComponent,
    ProfiloComponent,
    PhotocropComponent,
    ChangePswComponent,
    ImpostazioniComponent,
    ResizeColumnDirective,
    RettaCalcoloComponent,
    IscrizioniClasseCalcoloComponent,
    IscrizioniAlunnoListComponent,
    UserEditComponent,
    ResetPasswordComponent,
    DocenzeAddComponent,
    LezioniCalendarioComponent,
    LezioneComponent,
    LezioniUtilsComponent,
    RettaCalcoloAlunnoComponent,
    RettaannoEditComponent,
    PagellaEditComponent,
    DocenzaEditComponent,
    MaterieListComponent,
    MateriePageComponent,
    MateriaEditComponent,
    ObiettiviListComponent,
    ObiettiviPageComponent,
    ObiettivoEditComponent,
    VotiObiettiviEditComponent,

    ClassiAnniMaterieListComponent,
    TipiVotoPageComponent,
    ClasseAnnoMateriaEditComponent,

    ObiettiviFilterComponent 

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    DragDropModule,
    ReactiveFormsModule,
    FormsModule,
    FullCalendarModule

  ],

  providers: [
    UserService,
    DatePipe,
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
