import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterieListComponent } from '../materie-list/materie-list.component';

@Component({
  selector: 'app-materie-page',
  templateUrl: './materie-page.component.html',
  styleUrls: ['../materie.css']
})
export class MateriePageComponent implements OnInit {


  @ViewChild(MaterieListComponent) materieList!: MaterieListComponent; 

  
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.materieList.addRecord()
  }

}
