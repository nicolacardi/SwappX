import { Component, OnInit, ViewChild } from '@angular/core';
import { RetteListComponent } from '../rette-list/rette-list.component';

@Component({
  selector: 'app-rette',
  templateUrl: './rette-page.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RettePageComponent implements OnInit {

  @ViewChild(RetteListComponent) retteList!: RetteListComponent; 


  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.retteList.addRecord()
  }
  
}
