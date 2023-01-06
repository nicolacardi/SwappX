import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './_user/auth/auth.guard';
import { UserComponent } from './_user/user.component';
//import { UserRole } from './_user/Users';
import { RegisterComponent } from './_user/register/register.component';
import { LoginComponent } from './_user/login/login.component';

import { ProfiloComponent } from './_user/profilo/profilo.component';
import { ChangePswComponent } from './_user/change-psw/change-psw.component';
import { ImpostazioniComponent } from './_components/impostazioni/impostazioni.component';
import { ResetPasswordComponent } from './_user/reset-password/reset-password.component';

import { HomeComponent } from './_components/home/home.component';

import { AlunniPageComponent } from './_components/alunni/alunni-page/alunni-page.component';
import { GenitoriPageComponent } from './_components/genitori/genitori-page/genitori-page.component';
import { PersonePageComponent } from './_components/persone/persone-page/persone-page.component';
import { ClassiDashboardComponent } from './_components/classi/classi-dashboard/classi-dashboard.component';

import { RettePageComponent } from './_components/pagamenti/rette-page/rette-page.component';
import { PagamentiPageComponent } from './_components/pagamenti/pagamenti-page/pagamenti-page.component';
import { ClassiPageComponent } from './_components/classi/classi-sezioni-anni-page/classi-sezioni-anni-page.component';
import { UsersPageComponent } from './_components/users/users-page/users-page.component';
import { IscrizioniPageComponent } from './_components/iscrizioni/iscrizioni-page/iscrizioni-page.component';
import { LezioniCalendarioComponent } from './_components/lezioni/lezioni-calendario/lezioni-calendario.component';
import { MateriePageComponent } from './_components/materie/materie-page/materie-page.component';
import { ObiettiviPageComponent } from './_components/obiettivi/obiettivi-page/obiettivi-page.component';
import { ClassiAnniMateriePageComponent } from './_components/classi/classi-anni-materie/classi-anni-materie-page/classi-anni-materie-page.component';
import { NotePageComponent } from './_components/note/note-page/note-page.component';

const routes: Routes = [

   { path:'' , redirectTo: 'user/login', pathMatch: 'full' },
   { path:'user' , redirectTo: 'user/login', pathMatch: 'full' },
   { 
    path:'user',              component: UserComponent,
    children:[
      {path:'login', component: LoginComponent },
      {path:'registration', component: RegisterComponent },
      {path:'reset-password', component: ResetPasswordComponent }
    ]
   },

  { path:'home',              component: HomeComponent, canActivate:[AuthGuard]  },

  { path: "calendario",       component: LezioniCalendarioComponent, canActivate:[AuthGuard]},

  { path: "alunni",           component: AlunniPageComponent, canActivate:[AuthGuard]},

  { path: "iscrizioni",       component: IscrizioniPageComponent, canActivate:[AuthGuard]},

  { path: "genitori",         component: GenitoriPageComponent, canActivate:[AuthGuard]},

  { path: "persone",          component: PersonePageComponent,canActivate:[AuthGuard] },

  { path: "classi",           component: ClassiPageComponent,canActivate:[AuthGuard] },

  { path: "classi-dashboard", component: ClassiDashboardComponent,canActivate:[AuthGuard] },

  { path: "pagamenti",        component: PagamentiPageComponent,canActivate:[AuthGuard] },

  { path: "rette",            component: RettePageComponent,canActivate:[AuthGuard] },

  { path: "note",            component: NotePageComponent,canActivate:[AuthGuard] },

  //{ path:'users',             component: UsersPageComponent, canActivate:[AuthGuard], data: { roles: [UserRole.SysAdmin, UserRole.IT_Manager,UserRole.Segreteria ] } },
  { path:'users',             component: UsersPageComponent, canActivate:[AuthGuard], data: { roles: ['SysAdmin', 'Segreteria', 'Amministratore' ] } },

  //{ path: "impostazioni",     component: ImpostazioniComponent, canActivate:[AuthGuard],data: { roles: [UserRole.SysAdmin, UserRole.IT_Manager] }  },
  { path: "impostazioni",     component: ImpostazioniComponent, canActivate:[AuthGuard],data: { roles: ['SysAdmin', 'Segreteria', 'Amministratore' ] }  },

  { path: "profilo",          component: ProfiloComponent, canActivate:[AuthGuard] },

  { path: "change-psw",       component: ChangePswComponent, canActivate:[AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
