import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlunniListComponent } from './_components/alunni/alunni-list/alunni-list.component';
import { AlunnoEditComponent } from './_components/alunni/alunno-edit/alunno-edit.component';

import { GenitoriListComponent } from './_components/genitori/genitori-list/genitori-list.component';
import { GenitoreEditComponent } from './_components/genitori/genitore-edit/genitore-edit.component';

import { ClassiSezioniAnniListComponent } from './_components/classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { ClassiDashboardComponent } from './_components/classi/classi-dashboard/classi-dashboard.component';
import { AlunniPageComponent } from './_components/alunni/alunni-page/alunni-page.component';
import { AlunnoDashboardComponent } from './_components/alunni/alunno-dashboard/alunno-dashboard.component';
import { AlunnoDashboardNewComponent } from './_components/alunni/alunno-dashboard-new/alunno-dashboard-new.component';

import { RetteComponent } from './_components/pagamenti/rette/rette.component';
import { PagamentiPageComponent } from './_components/pagamenti/pagamenti-page/pagamenti-page.component';

const routes: Routes = [
  {
    path: "alunni",
    component: AlunniPageComponent
  },
  {
    path: 'alunni/:id',
    component: AlunnoEditComponent
  },
  {
    path: "alunno-dashboard",
    component: AlunnoDashboardComponent
  },
  {
    path: "alunno-dashboardNew",
    component: AlunnoDashboardNewComponent
  },
  {
    path: "genitori",
    component: GenitoriListComponent
  },
  {
    path: 'genitori/:id',
    component: GenitoreEditComponent
  },
  {
    path: "classi",
    component: ClassiSezioniAnniListComponent
  },
  {
    path: "classi-dashboard",
    component: ClassiDashboardComponent
  },

  {
    path: "pagamenti",
    component: PagamentiPageComponent
  },
  {
    path: "rette",
    component: RetteComponent
  }




];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
