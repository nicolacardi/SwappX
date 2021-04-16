import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlunniListComponent } from './alunni/alunni-list/alunni-list.component';
import { AlunnoDetailsComponent } from './alunni/alunno-details/alunno-details/alunno-details.component';
import { GenitoriListComponent } from './genitori/genitori-list/genitori-list.component';

const routes: Routes = [
  {
    path: "alunni",
    component: AlunniListComponent
  },
  {
    path: "alunnoDetails",
    component: AlunnoDetailsComponent
  },
  {path: 'alunni/:id',
    component: AlunnoDetailsComponent},
  {
    path: "genitoriList",
    component: GenitoriListComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
