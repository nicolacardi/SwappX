import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlunniListComponent } from './_components/alunni/alunni-list/alunni-list.component';
import { AlunnoDetailsComponent } from './_components/alunni/alunno-details/alunno-details.component';
import { GenitoriListComponent } from './_components/genitori/genitori-list/genitori-list.component';
import { GenitoreDetailsComponent } from './_components/genitori/genitore-details/genitore-details.component';

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

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
