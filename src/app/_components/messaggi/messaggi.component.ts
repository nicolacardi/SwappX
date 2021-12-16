import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';


//services
import { LoadingService } from '../utilities/loading/loading.service';
import { MessaggiService } from './messaggi.service';

//models
import { _UT_Message } from 'src/app/_models/_UT_Message';
import { User } from 'src/app/_user/Users';


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
displayedColumns: string[] = [
  //"actionsColumn",
  "userID"
  //"message"
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
    //this.displayedColumns = this.displayedColumns;
    
    
    console.log("DEBUG messaggi - DisplayedColumns:", this.displayedColumns);
    console.log("DEBUG messaggi - this.currUser.userID:", this.currUser.userID);
    

    let obsNews$: Observable<_UT_Message[]>;
    obsNews$ = this.svcMessages.loadByUserID(this.currUser.userID);
    const loadNews$ =this._loadingService.showLoaderUntilCompleted(obsNews$);

    loadNews$.subscribe(val => {
      this.matDataSource.data = val;

      console.log("messaggi: ", this.matDataSource.data);

      }
    );

  }
}
