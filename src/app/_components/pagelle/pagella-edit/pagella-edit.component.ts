import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-pagella-edit',
  templateUrl: './pagella-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class PagellaEditComponent implements OnInit  {

  
//#region ----- ViewChild Input Output -------

@Input('idIscrizione') idIscrizione!:                             number;


//#endregion


  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {

   // console.log();
  }
}
