import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

//services
import { UserService } from './_user/user.service';
import { EventEmitterService } from './_services/event-emitter.service';
import { Utility } from  './_components/utilities/utility.component';

//models
import { User } from './_user/Users';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  isPinned = false;
  isExpanded = false;
//#region ----- Variabili -------
  //isLoggedIn?: boolean;
  public isLoggedIn?:  boolean = false;
  public currUser!: User;
  public userFullName: string = "";
  public imgAccount = "";
  stringJson: any;
  stringObject: any;

  public mode = new FormControl('over');
  title = 'Stoody';
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('end') public rightSidenav!: MatSidenav;

  @ViewChild('expansion1') public expansion1!: MatExpansionPanel;
  @ViewChild('expansion2') public expansion2!: MatExpansionPanel;

//#endregion
  constructor(private svcUser:              UserService,
              private router:               Router,
              private eventEmitterService:  EventEmitterService 
              ) {
  }

  ngOnInit () {

    this.svcUser.obscurrentUser.subscribe(val => {
      this.currUser = val;

      if(this.currUser){
        this.userFullName = this.currUser.fullname;
        this.isLoggedIn = this.currUser.isLoggedIn;
      }
    })

    this.refreshUserData();

    //Carico i dati e l'immagine dell'utente tramite un eventEmitter
    if (this.eventEmitterService.subsVar==undefined) {    
    
      this.eventEmitterService.subsVar = this.eventEmitterService.invokeAppComponentRefreshFoto.subscribe(
        (name:string) => {     //Questo è il modo per tipizzare una lambda expression  
          this.refreshUserData();    
      });    
    } 
  }

  refreshUserData () {
    if(!this.currUser) return;

    this.svcUser.getFotoByUserID(this.currUser.userID).subscribe(
      val=> {
        this.imgAccount = val.foto; }
    );
    
    let currUser = Utility.getCurrentUser();
    this.userFullName = currUser.fullname;
  }
  
  logOut(){

    this.svcUser.Logout();
    this.router.navigate(['/user/login']);
  }

  expandExpansion1() {
    console.log ("apro");
    setTimeout(() => this.expansion1.expanded = true, 10);
  }

  expandExpansion2() {
    console.log ("apro");
    setTimeout(() => this.expansion2.expanded = true, 10);
  }


}
