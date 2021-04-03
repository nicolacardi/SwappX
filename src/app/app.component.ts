import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ALU_Alunno } from 'src/models/ALU_Alunno';
import { ALU_AlunniService } from './services/alu-alunni.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'SwappX';

  obs_ALU_Alunni$! : Observable<ALU_Alunno[]>;
  
  constructor(private svcALU_Alunni: ALU_AlunniService) {}

  ngOnInit () {
    this.obs_ALU_Alunni$ = this.svcALU_Alunni.loadAlunni();
  }


}
