import { JitSummaryResolver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

import { PAG_RettePagamenti_Sum } from 'src/app/_models/PAG_Retta';
import { User } from 'src/app/_user/Users';
import { LoadingService } from '../utilities/loading/loading.service';

@Component({
  selector: 'app-messaggi',
  templateUrl: './messaggi.component.html',
  styleUrls: ['./messaggi.component.css']
})

export class MessaggiComponent implements OnInit {

  
//#region ----- Variabili -------

//public userID: string;
public currUser!: User;


matDataSource = new MatTableDataSource<PAG_RettePagamenti_Sum>();
displayedColumns: string[] =  [];
displayedColumnsNews: string[] = [
  "actionsColumn",
  "message"
];

//#endregion

  constructor(      
              private _loadingService:  LoadingService) {

    let obj = localStorage.getItem('currentUser');
    this.currUser = JSON.parse(obj!) as User;
   }

  ngOnInit(): void {
  }


  loadData(){
    this.displayedColumns = this.displayedColumnsNews;
    
    /*
    let obsNews$: Observable<PAG_RettePagamenti_Sum[]>;
    obsNews$= this.svcRette.loadSummary(this.form.controls['selectAnnoScolastico'].value);
    const loadSummary$ =this._loadingService.showLoaderUntilCompleted(obsSummary$);

    loadSummary$.subscribe(val => {
        this.matDataSource.data = val;
      }
    );
    */
  }
}
