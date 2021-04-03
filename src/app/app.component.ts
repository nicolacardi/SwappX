import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from './_services/alunni.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'SwappX';


  
  constructor() {}

  ngOnInit () {

  }


}
