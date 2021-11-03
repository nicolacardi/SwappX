import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { AlunniService } from '../alunni.service';

//classes
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno'; 

@Component({
  selector: 'app-alunni-summary',
  templateUrl: './alunni-summary.component.html',
  styleUrls: ['../alunni.css']
})
export class AlunniSummaryComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<ALU_Alunno>();
  displayedColumns: string[] =  [];
  displayedColumnsAlunniSummary: string[] = [
      "classe",
      "numeroAlunni",
      "numeroMaschi",
      "numeroFemmine"
  ];
//#endregion
  constructor(private svcAlunni:        AlunniService,
              private _loadingService:  LoadingService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.displayedColumns = this.displayedColumnsAlunniSummary;


    let obsAlunniSummary$: Observable<ALU_Alunno[]>;

    
    obsAlunniSummary$= this.svcAlunni.loadWithParents();
    const loadAlunniSummary$ =this._loadingService.showLoaderUntilCompleted(obsAlunniSummary$);

    loadAlunniSummary$.subscribe(val => 
      {
        this.matDataSource.data = val;
      }
    );
    
  }

}
