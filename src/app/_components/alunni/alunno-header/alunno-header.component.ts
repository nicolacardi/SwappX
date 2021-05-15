import { Component, Input, OnInit } from '@angular/core';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

@Component({
  selector: 'app-alunno-header',
  templateUrl: './alunno-header.component.html',
  styleUrls: ['./alunno-header.component.css']
})
export class AlunnoHeaderComponent implements OnInit {

@Input()
//ID!: number;
alunno!: ALU_Alunno;

  constructor() { }


  ngOnInit(): void {
  }

}
