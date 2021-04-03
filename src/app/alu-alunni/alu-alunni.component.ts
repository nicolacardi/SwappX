import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ALU_Alunno } from 'src/models/ALU_Alunno';
import { ALU_AlunniService } from '../services/alu-alunni.service';
import { AlunniDataSource } from './datasource';

@Component({
  selector: 'app-alu-alunni',
  templateUrl: './alu-alunni.component.html',
  styleUrls: ['./alu-alunni.component.css']
})
export class ALUAlunniComponent implements OnInit {
  dataSource2$!: Observable<ALU_Alunno[]>;
  dataSource!: AlunniDataSource;
  //obs_ALU_Alunni$! : Observable<ALU_Alunno[]>;
  displayedColumns = ["nome", "cognome", "dtNascita"];
  constructor(private svcALU_Alunni: ALU_AlunniService) {}

  ngOnInit () {
    //this.obs_ALU_Alunni$ = this.svcALU_Alunni.loadAlunni();
    this.dataSource = new AlunniDataSource(this.svcALU_Alunni);
    this.dataSource.loadAlunni();
    this.dataSource2$ = this.svcALU_Alunni.loadAlunni();
  }

  onRowClicked(row: any) {
    console.log('Row clicked: ', row);
  }

}
