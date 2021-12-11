import { JitSummaryResolver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

import { PAG_RettePagamenti_Sum } from 'src/app/_models/PAG_Retta';
import { _UT_Message } from 'src/app/_models/_UT_Message';
import { UserService } from 'src/app/_user/user.service';
import { User } from 'src/app/_user/Users';
import { LoadingService } from '../utilities/loading/loading.service';
import { MessaggiService } from './messaggi.service';

@Component({
  selector: 'app-messaggi',
  templateUrl: './messaggi.component.html',
  styleUrls: ['./messaggi.component.css']
})

export class MessaggiComponent implements OnInit {

  
//#region ----- Variabili -------


//public userID: string;
public currUser!: User;

matDataSource = new MatTableDataSource<_UT_Message>();
displayedColumns: string[] =  [];
displayedColumnsNews: string[] = [
  "actionsColumn",
  "message"
];

//#endregion

  constructor(private svcMessages:      MessaggiService,  
               
              private _loadingService:  LoadingService) {

    let obj = localStorage.getItem('currentUser');
    this.currUser = JSON.parse(obj!) as User;
   }

  ngOnInit(): void {

    this.loadData();

  }


  loadData(){
    this.displayedColumns = this.displayedColumnsNews;
    
    let obsNews$: Observable<_UT_Message[]>;
    obsNews$ = this.svcMessages.loadByUserID(this.currUser.userID);
    const loadNews$ =this._loadingService.showLoaderUntilCompleted(obsNews$);

    loadNews$.subscribe(val => {
      this.matDataSource.data = val;
    }
  );

  }
}
