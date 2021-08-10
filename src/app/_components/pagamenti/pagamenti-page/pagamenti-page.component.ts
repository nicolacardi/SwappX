import { Component, OnInit, ViewChild } from '@angular/core';
import { PagamentiListComponent } from '../pagamenti-list/pagamenti-list.component';

@Component({
  selector: 'app-pagamenti-page',
  templateUrl: './pagamenti-page.component.html',
  styleUrls: ['../pagamenti.css']
})
export class PagamentiPageComponent implements OnInit {

  @ViewChild(PagamentiListComponent) pagamentiList!: PagamentiListComponent; 
  
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.pagamentiList.addRecord()
  }
}
