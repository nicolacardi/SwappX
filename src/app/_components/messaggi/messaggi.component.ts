import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';


//services
import { LoadingService } from '../utilities/loading/loading.service';
import { MessaggiService } from './messaggi.service';

//models
import { _UT_Message } from 'src/app/_models/_UT_Message';
import { User } from 'src/app/_user/Users';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../utilities/snackbar/snackbar.component';

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
  "message",
  "actionsColumn",
  "delete"
];

//#endregion

  constructor(private svcMessages:      MessaggiService,  
              private _loadingService:  LoadingService,
              private _snackBar:        MatSnackBar
              ) {

    let obj = localStorage.getItem('currentUser');
    this.currUser = JSON.parse(obj!) as User;
   }

  ngOnInit(){

    this.loadData();
  }

  loadData(){

    let obsNews$: Observable<_UT_Message[]>;

    obsNews$ = this.svcMessages.listByUserID(this.currUser.userID);

    const loadNews$ =this._loadingService.showLoaderUntilCompleted(obsNews$);

    loadNews$.subscribe(val => {
      this.matDataSource.data = val;

      }
    );

  }

  closeMsg(element: _UT_Message) {

    element.closed = !element.closed;

    this.svcMessages.put(element).subscribe(
      res=> {
        this.loadData();
      },
      err=>  {
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: 'Errore nella chuisura  del messaggio ', panelClass: ['red-snackbar']
        });
      }
    );
  }

  deleteMsg(id: number) {

    this.svcMessages.delete(id).subscribe(
      res=> {
        this.loadData();
      },
      err=>  {
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: 'Errore nella cancellazione  del messaggio ', panelClass: ['red-snackbar']
        });
      }
    );
  }
}
