import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlunniListComponent } from './_components/alunni/alunni-list/alunni-list.component';
import { AlunnoDetailsComponent } from './_components/alunni/alunno-details/alunno-details.component';
import { GenitoriListComponent } from './_components/genitori/genitori-list/genitori-list.component';
import { GenitoreDetailsComponent } from './_components/genitori/genitore-details/genitore-details.component';
import { ClassiListComponent } from './_components/classi/classi-list/classi-list.component';
import { ClasseDetailsComponent } from './_components/classi/classe-details/classe-details.component';

const routes: Routes = [
  {
    path: "alunni",
    component: AlunniListComponent
  },
  {
    path: 'alunni/:id',
    component: AlunnoDetailsComponent
  },
  {
    path: "genitori",
    component: GenitoriListComponent
  },
  {
    path: 'genitori/:id',
    component: GenitoreDetailsComponent
  },
  {
    path: "classi",
    component: ClassiListComponent
  },
  {
    path: 'classi/:id',
    component: ClasseDetailsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
