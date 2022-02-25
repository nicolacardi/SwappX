import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-docenti-list',
  templateUrl: './docenti-list.component.html',
  styleUrls: ['../persone.css']
})
export class DocentiListComponent implements OnInit {


  @Input() idClasse!:                                         number;

  constructor() { }

  ngOnInit(): void {
  }

}
