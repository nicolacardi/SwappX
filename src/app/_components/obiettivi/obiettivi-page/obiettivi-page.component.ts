import { Component, OnInit, ViewChild } from '@angular/core';
import { ObiettiviListComponent } from '../obiettivi-list/obiettivi-list.component';

@Component({
  selector: 'app-obiettivi-page',
  templateUrl: './obiettivi-page.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettiviPageComponent implements OnInit {

  @ViewChild(ObiettiviListComponent) obiettiviList!: ObiettiviListComponent; 

  
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.obiettiviList.addRecord()
  }

}
