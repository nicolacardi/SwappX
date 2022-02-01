import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { User } from './_user/Users';

//services
import { UserService } from './_user/user.service';
import { EventEmitterService } from './_services/event-emitter.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

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
    this.svcUser.getFotoByUserID(this.currUser.userID).subscribe(
      val=> {
        this.imgAccount = val.foto; }
    );
    
    let obj = localStorage.getItem('currentUser');
    const tokenUser = JSON.parse(obj!) as User;
    this.userFullName = tokenUser.fullname;  //TODO non si aggiorna se canactivate attivo

  }
  
  logOut(){

    //this.currUser = null;
    this.svcUser.Logout();

    //this.svcUser.changeLoggedIn(false);
    this.router.navigate(['/user/login']);

  }

  savePDF() {
    
  }


}
