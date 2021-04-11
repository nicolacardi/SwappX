import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlunniListComponent } from './alunni/alunni-list/alunni-list.component';
import { GenitoriListComponent } from './genitori/genitori-list/genitori-list.component';

const routes: Routes = [
  {
    path: "alunniList",
    component: AlunniListComponent
  },
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
