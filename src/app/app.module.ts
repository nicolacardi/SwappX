import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './_material/material.module';
import { AlunniListComponent } from './alunni/alunni-list/alunni-list.component';
import { GenitoriListComponent } from './genitori/genitori-list/genitori-list.component';

@NgModule({
  declarations: [
    AppComponent,
    AlunniListComponent,
    GenitoriListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
