import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

import { AlunniPageComponent } from './_components/alunni/alunni-page/alunni-page.component';
import { AlunnoEditComponent } from './_components/alunni/alunno-edit/alunno-edit.component';

import { GenitoriPageComponent } from './_components/genitori/genitori-page/genitori-page.component';
import { GenitoreEditComponent } from './_components/genitori/genitore-edit/genitore-edit.component';

import { PersonePageComponent } from './_components/persone/persone-page/persone-page.component';
import { PersonaEditComponent } from './_components/persone/persona-edit/persona-edit.component';

import { ClassiDashboardComponent } from './_components/classi/classi-dashboard/classi-dashboard.component';

import { RettePageComponent } from './_components/pagamenti/rette-page/rette-page.component';
import { PagamentiPageComponent } from './_components/pagamenti/pagamenti-page/pagamenti-page.component';

import { AuthGuard } from './_user/auth/auth.guard';
import { UserComponent } from './_user/user.component';
import { RegisterComponent } from './_user/register/register.component';
import { LoginComponent } from './_user/login/login.component';
import { HomeComponent } from './_components/home/home.component';
import { ClassiPageComponent } from './_components/classi/classi-page/classi-page.component';
import { UsersPageComponent } from './_components/users/users-page/users-page.component';

import { UserRole } from './_user/Users';
import { ProfiloComponent } from './_components/account/profilo/profilo.component';
import { ChangePswComponent } from './_components/account/change-psw/change-psw.component';
import { ImpostazioniComponent } from './_components/impostazioni/impostazioni.component';


const routes: Routes = [

  { path:'' , redirectTo: 'user/login', pathMatch: 'full' },

  { 
    path:'user',              component: UserComponent,
    children:[
    {path:'registration', component: RegisterComponent },
    {path:'login', component: LoginComponent }
    ]
  },

  { path:'home',              component: HomeComponent, canActivate:[AuthGuard]  },



  { path: "alunni",           component: AlunniPageComponent, canActivate:[AuthGuard]},

  { path: "genitori",         component: GenitoriPageComponent, canActivate:[AuthGuard]},

  { path: "persone",          component: PersonePageComponent },

  { path: "classi",           component: ClassiPageComponent,canActivate:[AuthGuard] },

  { path: "classi-dashboard", component: ClassiDashboardComponent },

  { path: "pagamenti",        component: PagamentiPageComponent },

  { path: "rette",            component: RettePageComponent },

  { path:'users',             component: UsersPageComponent, canActivate:[AuthGuard], data: { roles: [UserRole.Admin] } },
  
  { path: "impostazioni",     component: ImpostazioniComponent, canActivate:[AuthGuard],data: { roles: [UserRole.Admin, UserRole.Segreteria] }  },


  { path: "profilo",          component: ProfiloComponent, canActivate:[AuthGuard] },

  { path: "change-psw",       component: ChangePswComponent, canActivate:[AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
