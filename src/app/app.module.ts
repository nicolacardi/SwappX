import { NgModule }                             from '@angular/core';
import { DatePipe }                             from '@angular/common';
import { BrowserModule }                        from '@angular/platform-browser';

import { AppRoutingModule }                     from './app-routing.module';
import { AppComponent }                         from './app.component';

import { HttpClientModule, HTTP_INTERCEPTORS }  from "@angular/common/http";
import { BrowserAnimationsModule }              from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule }     from '@angular/forms';
import { MAT_DATE_LOCALE }                      from '@angular/material/core';
import { DragDropModule}                        from '@angular/cdk/drag-drop';
import { MaterialModule }                       from './_material/material.module';
import { MatPaginatorIntl }                     from '@angular/material/paginator';

import { MAT_SNACK_BAR_DEFAULT_OPTIONS }        from '@angular/material/snack-bar';
import { STEPPER_GLOBAL_OPTIONS }               from '@angular/cdk/stepper';


//Fullcalendar
import { FullCalendarModule }                   from '@fullcalendar/angular'; // Va prima dei plugin di FullCalendar
// import dayGridPlugin                            from '@fullcalendar/daygrid';
// import listPlugin                               from '@fullcalendar/list';
// import timegridPlugin                           from '@fullcalendar/timegrid';
// import interactionPlugin                         from '@fullcalendar/interaction';

//Auth
import { AuthInterceptor }                      from './_user/auth/auth.interceptor';

//Home Page
import { HomeComponent }                        from './_components/home/home.component';
import { ClassiSezioniAnniSummaryComponent }    from './_components/classi/classi-sezioni-anni-summary/classi-sezioni-anni-summary.component';
import { RettepagamentiSummaryComponent }       from './_components/pagamenti/rettepagamenti-summary/rettepagamenti-summary.component';

//Alunni
import { AlunniPageComponent }                  from './_components/alunni/alunni-page/alunni-page.component';
import { AlunniListComponent }                  from './_components/alunni/alunni-list/alunni-list.component';
import { AlunnoEditComponent }                  from './_components/alunni/alunno-edit/alunno-edit.component';
import { AlunniFilterComponent }                from './_components/alunni/alunni-filter/alunni-filter.component';

//Genitori
import { GenitoriPageComponent }                from './_components/genitori/genitori-page/genitori-page.component';
import { GenitoriListComponent }                from './_components/genitori/genitori-list/genitori-list.component';
import { GenitoreEditComponent }                from './_components/genitori/genitore-edit/genitore-edit.component';
import { GenitoriFilterComponent }              from './_components/genitori/genitori-filter/genitori-filter.component';

//Persone
import { PersonePageComponent }                 from './_components/persone/persone-page/persone-page.component';
import { PersoneListComponent }                 from './_components/persone/persone-list/persone-list.component';
import { PersonaEditComponent }                 from './_components/persone/persona-edit/persona-edit.component';
import { PersoneFilterComponent }               from './_components/persone/persone-filter/persone-filter.component';
import { PersonaFormComponent }                 from './_components/persone/persona-form/persona-form.component';

//Classi-ClassiSezioniAnni
import { ClassiDashboardComponent }             from './_components/classi/classi-dashboard/classi-dashboard.component';
import { ClassiPageComponent }                  from './_components/classi/classi-sezioni-anni-page/classi-sezioni-anni-page.component';
import { ClasseSezioneAnnoEditComponent }       from './_components/classi/classe-sezione-anno-edit/classe-sezione-anno-edit.component';
import { ClassiSezioniAnniFilterComponent }     from './_components/classi/classi-sezioni-anni-filter/classi-sezioni-anni-filter.component';
import { ClassiSezioniAnniListComponent }       from './_components/classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';

//Iscrizioni
import { IscrizioniAddComponent }               from './_components/iscrizioni/iscrizioni-add/iscrizioni-add.component';
import { IscrizioniClasseListComponent }        from './_components/iscrizioni/iscrizioni-classe-list/iscrizioni-classe-list.component';
import { IscrizioniPageComponent }              from './_components/iscrizioni/iscrizioni-page/iscrizioni-page.component';
import { IscrizioniListComponent }              from './_components/iscrizioni/iscrizioni-list/iscrizioni-list.component';
import { IscrizioniFilterComponent }            from './_components/iscrizioni/iscrizioni-filter/iscrizioni-filter.component';
import { IscrizioniClasseCalcoloComponent }     from './_components/iscrizioni/iscrizioni-classe-calcolo/iscrizioni-classe-calcolo.component';
import { IscrizioniAlunnoListComponent }        from './_components/iscrizioni/iscrizioni-alunno-list/iscrizioni-alunno-list.component';

//Docenti
import { DocentiDashboardComponent }            from './_components/docenti/docenti-dashboard/docenti-dashboard.component';

//Docenze
import { DocenzeListComponent }                 from './_components/classi/docenze/docenze-list/docenze-list.component';
import { DocenzeAddComponent }                  from './_components/classi/docenze/docenze-add/docenze-add.component';
import { DocenzaEditComponent }                 from './_components/classi/docenze/docenza-edit/docenza-edit.component';

//Pagamenti
import { PagamentiPageComponent }               from './_components/pagamenti/pagamenti-page/pagamenti-page.component';
import { PagamentiListComponent }               from './_components/pagamenti/pagamenti-list/pagamenti-list.component';
import { PagamentiFilterComponent }             from './_components/pagamenti/pagamenti-filter/pagamenti-filter.component';

//Rette
import { RettePageComponent }                   from './_components/pagamenti/rette-page/rette-page.component';
import { RetteListComponent }                   from './_components/pagamenti/rette-list/rette-list.component';
import { RettaEditComponent }                   from './_components/pagamenti/retta-edit/retta-edit.component';
import { RettameseEditComponent }               from './_components/pagamenti/rettamese-edit/rettamese-edit.component';
import { RettapagamentoEditComponent }          from './_components/pagamenti/rettapagamento-edit/rettapagamento-edit.component';
import { RettaCalcoloAlunnoComponent }          from './_components/pagamenti/retta-calcolo-alunno/retta-calcolo-alunno.component';
import { RettaCalcoloComponent }                from './_components/pagamenti/retta-calcolo/retta-calcolo.component';
import { RettaannoEditComponent }               from './_components/pagamenti/rettaanno-edit/rettaanno-edit.component';

//Materie
import { MaterieListComponent }                 from './_components/materie/materie-list/materie-list.component';
import { MateriePageComponent }                 from './_components/materie/materie-page/materie-page.component';
import { MateriaEditComponent }                 from './_components/materie/materia-edit/materia-edit.component';

//Obiettivi e VotiObiettivi
import { ObiettiviPageComponent }               from './_components/obiettivi/obiettivi-page/obiettivi-page.component';
import { ObiettiviListComponent }               from './_components/obiettivi/obiettivi-list/obiettivi-list.component';
import { ObiettivoEditComponent }               from './_components/obiettivi/obiettivo-edit/obiettivo-edit.component';
import { ObiettiviFilterComponent }             from './_components/obiettivi/obiettivi-filter/obiettivi-filter.component';
import { ObiettiviDuplicaComponent }            from './_components/obiettivi/obiettivi-duplica/obiettivi-duplica.component';
import { VotiObiettiviEditComponent }           from './_components/pagelle/voti-obiettivi-edit/voti-obiettivi-edit.component';

//Pagella
import { PagellaVotoEditComponent }             from './_components/pagelle/pagella-voto-edit/pagella-voto-edit.component';
import { PagellaEditComponent }                 from './_components/pagelle/pagelle-edit/pagelle-edit.component';

//Lezioni
import { OrarioPageComponent }                  from './_components/lezioni/orario-page/orario-page.component';
import { LezioniCalendarioComponent }           from './_components/lezioni/lezioni-calendario/lezioni-calendario.component';
import { LezioneComponent }                     from './_components/lezioni/lezione-edit/lezione.component';
import { LezioniUtilsComponent }                from './_components/lezioni/lezioni-utils/lezioni-utils.component';
import { OrarioDocentePageComponent }           from './_components/lezioni/orario-docente-page/orario-docente-page.component';


//Presenze
import { PresenzeListComponent }                from './_components/lezioni/presenze-list/presenze-list.component';
import { PresenzeAlunnoListComponent }          from './_components/lezioni/presenze-alunno-list/presenze-alunno-list.component';

//Note
import { NotePageComponent }                    from './_components/note/note-page/note-page.component';
import { NoteListComponent }                    from './_components/note/note-list/note-list.component';
import { NotaEditComponent }                    from './_components/note/nota-edit/nota-edit.component';
import { NoteFilterComponent }                  from './_components/note/note-filter/note-filter.component';


//User e Profilo
import { UserService }                          from './_user/user.service';
import { UserComponent }                        from './_user/user.component';
import { LoginComponent }                       from './_user/login/login.component';
import { UsersPageComponent }                   from './_components/users/users-page/users-page.component';
import { UsersListComponent }                   from './_components/users/users-list/users-list.component';
import { UsersFilterComponent }                 from './_components/users/users-filter/users-filter.component';
import { UserEditComponent }                    from './_components/users/user-edit/user-edit.component';
import { ProfiloComponent }                     from './_user/profilo/profilo.component';
import { ChangePswComponent }                   from './_user/change-psw/change-psw.component';
import { ChangePswExtComponent }                from './_user/change-psw-ext/change-psw-ext.component';

import { ResetPswComponent }                    from './_user/reset-psw/reset-psw.component';
import { ClipboardModule }                      from '@angular/cdk/clipboard';

//Messaggi
import { MessaggiComponent }                    from './_components/messaggi/messaggi.component';

//Utilities
import { ToolbarComponent }                     from './_components/utilities/toolbar/toolbar.component';
import { SceltaColonneComponent }               from './_components/utilities/toolbar/scelta-colonne/scelta-colonne.component';

import { DialogYesNoComponent }                 from './_components/utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent }                    from './_components/utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                    from './_components/utilities/snackbar/snackbar.component';
import { LoadingComponent }                     from './_components/utilities/loading/loading.component';
import { HighlightPipe }                        from './_components/utilities/highlight/highlight.pipe';
import { HighlightDatePipe }                    from './_components/utilities/highlight/highlightDate.pipe';
import { PhotocropComponent }                   from './_components/utilities/photocrop/photocrop.component';
import { EventEmitterService }                  from './_services/event-emitter.service';
import { ImpostazioniComponent }                from './_components/impostazioni/impostazioni.component';
import { CustomMatPaginatorIntl }               from './_components/utilities/paginator-custom/custom-mat-paginator-int';

import { ResizeColumnDirective }                from './_components/utilities/resize-column/resize-column.directive';
import { ColorPickerModule }                    from './color-picker/color-picker.module';

//ClassiAnniMaterie
import { ClassiAnniMaterieListComponent }       from './_components/classi/classi-anni-materie/classi-anni-materie-list/classi-anni-materie-list.component';
import { ClassiAnniMateriePageComponent }       from './_components/classi/classi-anni-materie/classi-anni-materie-page/classi-anni-materie-page.component';
import { ClasseAnnoMateriaEditComponent }       from './_components/classi/classi-anni-materie/classe-anno-materia-edit/classe-anno-materia-edit.component';
import { ClassiAnniMaterieDuplicaComponent }    from './_components/classi/classi-anni-materie/classi-anni-materie-duplica/classi-anni-materie-duplica.component';

//Compiti e Voti
import { CompitiListComponent }                 from './_components/lezioni/compiti-list/compiti-list.component';
import { CompitoEditComponent }                 from './_components/lezioni/compito-edit/compito-edit.component';

import { VotiCompitoPageComponent }             from './_components/lezioni/voti-compito-page/voti-compito-page.component';
import { VotiCompitoListComponent }             from './_components/lezioni/voti-compito-list/voti-compito-list.component';

import { VotiInterrListComponent }              from './_components/lezioni/voti-interr-list/voti-interr-list.component';
import { VotoInterrEditComponent }                 from './_components/lezioni/voto-interr-edit/voto-interr-edit.component';

//Scadenze
import { ScadenzeCalendarioComponent }          from './_components/scadenze/scadenze-calendario/scadenze-calendario.component';
import { ScadenzaEditComponent }                from './_components/scadenze/scadenza-edit/scadenza-edit.component';
import { MieScadenzeComponent }                 from './_components/scadenze/miescadenze/miescadenze.component';

import { TipiScadenzaListComponent }            from './_components/scadenze/tipiscadenza/tipiscadenza-list/tipiscadenza-list.component';
import { TipiScadenzaPageComponent }            from './_components/scadenze/tipiscadenza/tipiscadenza-page/tipiscadenza-page.component';
import { TipoScadenzaEditComponent }            from './_components/scadenze/tipiscadenza/tiposcadenza-edit/tiposcadenza-edit.component';

//Verbali
import { VerbaliListComponent }                 from './_components/verbali/verbali-list/verbali-list.component';
import { VerbaleEditComponent }                 from './_components/verbali/verbale-edit/verbale-edit.component';
import { VerbaliPageComponent }                 from './_components/verbali/verbali-page/verbali-page.component';
import { VerbaliFilterComponent }               from './_components/verbali/verbali-filter/verbali-filter.component';


import { ProceduraIscrizioneComponent }         from './_components/procedura-iscrizione/procedura-iscrizione.component';

//Templates
import { TemplateComponent }                    from './_components/templates/template/template.component';
import { PaginaComponent }                      from './_components/templates/pagina/pagina.component';
import { BloccoComponent }                      from './_components/templates/blocco/blocco.component';
import { BloccoEditComponent }                  from './_components/templates/blocco-edit/blocco-edit.component';

import { ClickDoubleDirective }                 from './_components/utilities/clickdouble/clickdouble.directive';

import { QuillModule }                          from 'ngx-quill';
import { TableComponent }                       from './_components/templates/table/table.component';
import { TableShowComponent }                   from './_components/templates/tableshow/tableshow.component';
import { PagelleClasseEditComponent }           from './_components/pagelle/pagelle-classe-edit/pagelle-classe-edit.component';
import { FileuploadsComponent } from './_components/impostazioni/fileuploads/fileuploads.component';
import { HttpErrorInterceptor } from './_user/auth/httperror.interceptor';




// FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  //dayGridPlugin, NC 16/02/23
  //listPlugin, NC 16/02/23
  //timegridPlugin, NS 16/02/23
  //interactionPlugin NC 16/02/23
// ]);

@NgModule({
  declarations: [
    AppComponent,
    

    HighlightPipe,
    HighlightDatePipe,

    DialogYesNoComponent,
    DialogOkComponent,
    LoadingComponent,
    SnackbarComponent,

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
    PersonaFormComponent,

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
    IscrizioniFilterComponent,
    IscrizioniClasseCalcoloComponent,
    IscrizioniAlunnoListComponent,

    OrarioPageComponent,
    LezioniCalendarioComponent,
    LezioneComponent,

    ScadenzeCalendarioComponent,
    ScadenzaEditComponent,
    MieScadenzeComponent,
    LezioniUtilsComponent,
    OrarioDocentePageComponent,

    TipiScadenzaListComponent,
    TipiScadenzaPageComponent,
    TipoScadenzaEditComponent,

    PresenzeListComponent,
    PresenzeAlunnoListComponent,
    VotiCompitoListComponent,
    CompitiListComponent,
    CompitoEditComponent,
    VotiCompitoPageComponent,
    VotiInterrListComponent,
    VotoInterrEditComponent,
    
    PagamentiListComponent,
    PagamentiPageComponent,
    PagamentiFilterComponent,
    
    RettePageComponent,
    RetteListComponent,
    RettaEditComponent,
    RettameseEditComponent,
    RettapagamentoEditComponent,
    RettaCalcoloComponent,
    RettaCalcoloAlunnoComponent,
    RettaannoEditComponent,

    ToolbarComponent,
    SceltaColonneComponent,

    LoginComponent,
    UserComponent,
    UsersPageComponent,
    UsersListComponent,
    UsersFilterComponent,
    UserEditComponent,
    ProfiloComponent,

    MessaggiComponent,

    PhotocropComponent,
    ChangePswComponent,
    ChangePswExtComponent,

    ImpostazioniComponent,
    ResizeColumnDirective,
    ClickDoubleDirective,

    DocenzeAddComponent,


    PagellaVotoEditComponent,
    DocenzaEditComponent,

    MaterieListComponent,
    MateriePageComponent,
    MateriaEditComponent,

    ObiettiviListComponent,
    ObiettiviPageComponent,
    ObiettivoEditComponent,
    VotiObiettiviEditComponent,

    ClassiAnniMaterieListComponent,
    ClassiAnniMateriePageComponent,
    ClasseAnnoMateriaEditComponent,
    ClassiAnniMaterieDuplicaComponent,

    ObiettiviFilterComponent,
    ObiettiviDuplicaComponent,

    PagellaEditComponent,

    NoteListComponent,
    NotaEditComponent,
    NotePageComponent,
    NoteFilterComponent,

    VerbaliListComponent,
    VerbaleEditComponent,
    VerbaliPageComponent,
    VerbaliFilterComponent,

    DocentiDashboardComponent,
      ProceduraIscrizioneComponent,
      TemplateComponent,
      PaginaComponent,
      BloccoComponent,
      BloccoEditComponent,
      TableComponent,
      TableShowComponent,
      PagelleClasseEditComponent,
      ResetPswComponent,
      FileuploadsComponent,
 
    

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
    FullCalendarModule,
    ColorPickerModule,
    QuillModule.forRoot(),
    ClipboardModule,


  ],


  providers: [
    UserService,
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    //{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 3000}},
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
    { provide: EventEmitterService},
    {provide: STEPPER_GLOBAL_OPTIONS,
    useValue: { showError: true }}

    



  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
