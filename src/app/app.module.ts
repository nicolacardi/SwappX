import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './_material/material.module';
import { AlunniListComponent } from './alunni/alunni-list/alunni-list.component';
import { GenitoriListComponent } from './genitori/genitori-list/genitori-list.component';
import { DragDropModule} from '@angular/cdk/drag-drop';
import { AlunnoDetailsComponent } from './alunni/alunno-details/alunno-details/alunno-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';

//import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import { InMemDataService } from './_services/in-mem-data.service';


@NgModule({
  declarations: [
    AppComponent,
    AlunniListComponent,
    GenitoriListComponent,
    AlunnoDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    DragDropModule,
    ReactiveFormsModule,
    // HttpClientInMemoryWebApiModule.forRoot(
    //   InMemDataService, { dataEncapsulation: false, delay: 1000 }),
    // ]
  ],
  providers: [

    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' }
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
