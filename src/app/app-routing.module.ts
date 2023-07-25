import { NgModule }                             from '@angular/core';
import { RouterModule, Routes }                 from '@angular/router';

import { AuthGuard }                            from './_user/auth/auth.guard';
import { UserComponent }                        from './_user/user.component';
import { RegisterComponent }                    from './_user/register/register.component';
import { LoginComponent }                       from './_user/login/login.component';

import { ProfiloComponent }                     from './_user/profilo/profilo.component';
import { ChangePswComponent }                   from './_user/change-psw/change-psw.component';
import { ImpostazioniComponent }                from './_components/impostazioni/impostazioni.component';
import { ResetPasswordComponent }               from './_user/reset-password/reset-password.component';

import { HomeComponent }                        from './_components/home/home.component';
import { AlunniPageComponent }                  from './_components/alunni/alunni-page/alunni-page.component';
import { GenitoriPageComponent }                from './_components/genitori/genitori-page/genitori-page.component';
import { PersonePageComponent }                 from './_components/persone/persone-page/persone-page.component';
import { ClassiDashboardComponent }             from './_components/classi/classi-dashboard/classi-dashboard.component';
import { RettePageComponent }                   from './_components/pagamenti/rette-page/rette-page.component';
import { PagamentiPageComponent }               from './_components/pagamenti/pagamenti-page/pagamenti-page.component';
import { ClassiPageComponent }                  from './_components/classi/classi-sezioni-anni-page/classi-sezioni-anni-page.component';
import { UsersPageComponent }                   from './_components/users/users-page/users-page.component';
import { IscrizioniPageComponent }              from './_components/iscrizioni/iscrizioni-page/iscrizioni-page.component';
import { DocentiDashboardComponent }            from './_components/docenti/docenti-dashboard/docenti-dashboard.component';
import { OrarioDocentePageComponent }           from './_components/lezioni/orario-docente-page/orario-docente-page.component';
import { ScadenzeCalendarioComponent }          from './_components/scadenze/scadenze-calendario/scadenze-calendario.component';
import { VerbaliPageComponent }                 from './_components/verbali/verbali-page/verbali-page.component';
import { OrarioPageComponent }                  from './_components/lezioni/orario-page/orario-page.component';
import { ProceduraIscrizioneComponent }         from './_components/procedura-iscrizione/procedura-iscrizione.component';
import { TemplateComponent }                    from './_components/templates/template/template.component';
import { SendMailComponent }                    from './_user/send-mail/send-mail.component';

const routes: Routes = [

  { path: '', redirectTo: 'user/login', pathMatch: 'full' }, //questo indica che un route vuoto viene tradotto in user/login
  {
    path: 'user',                               //user ha due children, login e send-mail
    component: UserComponent,
    children: [
      { path: 'login', component:               LoginComponent },
      { path: 'send-mail', component:           SendMailComponent }
    ]
  },


  //  { path:'' , redirectTo: 'user/login', pathMatch: 'full' },
  //  { path:'user' , redirectTo: 'user/login', pathMatch: 'full' },
  //  { 
  //   path:'user',                                component: UserComponent,
  //   children:[
  //     {path:'login',                            component: LoginComponent },
  //     {path:'registration',                     component: RegisterComponent },
  //     {path:'reset-password',                   component: ResetPasswordComponent },
  //     {path:'send-mail',                        component: SendMailComponent }

  //   ]
  //  },

  { path:'home',                                component: HomeComponent, canActivate:[AuthGuard]  },

  { path: "calendario",                         component: ScadenzeCalendarioComponent, canActivate:[AuthGuard]},

  { path: "orario-page",                        component: OrarioPageComponent, canActivate:[AuthGuard]},

  { path: "alunni",                             component: AlunniPageComponent, canActivate:[AuthGuard]},

  { path: "iscrizioni",                         component: IscrizioniPageComponent, canActivate:[AuthGuard]},

  { path: "genitori",                           component: GenitoriPageComponent, canActivate:[AuthGuard]},

  { path: "persone",                            component: PersonePageComponent,canActivate:[AuthGuard] },

  { path: "classi",                             component: ClassiPageComponent,canActivate:[AuthGuard] },

  { path: "classi-dashboard",                   component: ClassiDashboardComponent,canActivate:[AuthGuard] },

  { path: "docenti-dashboard",                  component: DocentiDashboardComponent,canActivate:[AuthGuard],data: { roles: ['SysAdmin', 'Segreteria', 'Amministratore', 'Maestro' ] }  },

  { path: "calendario-docente",                 component: OrarioDocentePageComponent,canActivate:[AuthGuard],data: { roles: ['SysAdmin', 'Segreteria', 'Amministratore', 'Maestro' ] } },

  { path: "pagamenti",                          component: PagamentiPageComponent,canActivate:[AuthGuard] },

  { path: "rette",                              component: RettePageComponent,canActivate:[AuthGuard] },

  //{ path:'users',                             component: UsersPageComponent, canActivate:[AuthGuard], data: { roles: [UserRole.SysAdmin, UserRole.IT_Manager,UserRole.Segreteria ] } },
  { path:'users',                               component: UsersPageComponent, canActivate:[AuthGuard], data: { roles: ['SysAdmin', 'Segreteria', 'Amministratore' ] } },

  { path: "verbali",                            component: VerbaliPageComponent,canActivate:[AuthGuard] },
 
  { path: "template",                           component: TemplateComponent,canActivate:[AuthGuard] },

  { path: "impostazioni",                       component: ImpostazioniComponent, canActivate:[AuthGuard],data: { roles: ['SysAdmin', 'Segreteria', 'Amministratore' ] }  },

  { path: "procedura-iscrizione",               component: ProceduraIscrizioneComponent, canActivate:[AuthGuard] },

  { path: "profilo",                            component: ProfiloComponent, canActivate:[AuthGuard] },

  { path: "change-psw",                         component: ChangePswComponent, canActivate:[AuthGuard] },


];

@NgModule({
  //imports: [RouterModule.forRoot(routes)],
  imports: [RouterModule.forRoot(routes, { useHash: true })], //NC 02/02 https://stackoverflow.com/questions/60527776/uncaught-in-promise-error-cannot-match-any-routes-angular8

  exports: [RouterModule]
})
export class AppRoutingModule { }
