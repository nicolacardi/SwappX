import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlunniPageComponent } from './_components/alunni/alunni-page/alunni-page.component';
import { AlunnoEditComponent } from './_components/alunni/alunno-edit/alunno-edit.component';

import { GenitoriPageComponent } from './_components/genitori/genitori-page/genitori-page.component';
import { GenitoreEditComponent } from './_components/genitori/genitore-edit/genitore-edit.component';

import { PersonePageComponent } from './_components/persone/persone-page/persone-page.component';
import { PersonaEditComponent } from './_components/persone/persona-edit/persona-edit.component';

import { ClassiDashboardComponent } from './_components/classi/classi-dashboard/classi-dashboard.component';

import { RettePageComponent } from './_components/pagamenti/rette-page/rette-page.component';
import { PagamentiPageComponent } from './_components/pagamenti/pagamenti-page/pagamenti-page.component';
import { AppComponent } from './app.component';
import { AuthGuard } from './_user/auth/auth.guard';
import { UserComponent } from './_user/user.component';
import { RegisterComponent } from './_user/register/register.component';
import { LoginComponent } from './_user/login/login.component';
import { HomeComponent } from './_components/home/home.component';


const routes: Routes = [

  //{ path:'home', component: HomeComponent, canActivate:[AuthGuard]  },
  { path:'home', component: HomeComponent  },

  { path: "alunni",component: AlunniPageComponent},
  // {
  //   path: 'alunni/:id',
  //   component: AlunnoEditComponent
  // },
  { path: "genitori", component: GenitoriPageComponent },
  // {
  //   path: 'genitori/:id',
  //   component: GenitoreEditComponent
  // },
  { path: "persone", component: PersonePageComponent },
  { path: 'persone/:id', component: PersonaEditComponent },
  { path: "classi-dashboard", component: ClassiDashboardComponent },

  {
    path: "pagamenti",
    component: PagamentiPageComponent
  },
  {
    path: "rette",
    component: RettePageComponent
  },

  { 
    path:'' , redirectTo: 'user/login', pathMatch: 'full' 
  },

  { 
    path:'user', component: UserComponent,
    children:[
    {path:'registration', component: RegisterComponent },
    {path:'login', component: LoginComponent }
    ]
  }

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
