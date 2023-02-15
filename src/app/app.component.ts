import { Component, OnInit, ViewChild }         from '@angular/core';
import { UntypedFormControl }                          from '@angular/forms';
import { MatSidenav }                           from '@angular/material/sidenav';
import { Router }                               from '@angular/router';

//services
import { UserService }                          from './_user/user.service';
import { EventEmitterService }                  from './_services/event-emitter.service';
import { Utility }                              from  './_components/utilities/utility.component';

//models
import { User }                                 from './_user/Users';
import { MatExpansionPanel }                    from '@angular/material/expansion';
import { PER_Persona }                          from './_models/PER_Persone';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

//#region ----- Variabili -------
  //isLoggedIn?: boolean;
  public isLoggedIn?:                           boolean = false;
  public currUser!:                             User;
  public currPersona!:                          PER_Persona;

  public userFullName:                          string = "";
  public imgAccount =                           "";
  stringJson:                                   any;
  stringObject:                                 any;

  isPinned =                                    false;
  isExpanded =                                  false;

  public mode = new UntypedFormControl('over');
  title = 'Stoody';
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('start') public leftSidenav!: MatSidenav;
  @ViewChild('end') public rightSidenav!: MatSidenav;
  @ViewChild('expansionClassi') public expansionClassi!: MatExpansionPanel;
  @ViewChild('expansionPagamenti') public expansionPagamenti!: MatExpansionPanel;
  @ViewChild('expansionDocenti') public expansionDocenti!: MatExpansionPanel;

//#endregion
  constructor(
    private svcUser:                            UserService,
    private router:                             Router,
    private eventEmitterService:                EventEmitterService
  ) {
  }

  ngOnInit () {

    //TODO non andrebbe preso da Utility?
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
        () => this.refreshUserData()
      );    
    } 
  }

  refreshUserData () {
    if(!this.currUser) return;

    this.svcUser.getFotoByUserID(this.currUser.userID).subscribe(
      res => this.imgAccount = res.foto
    );
    
    let currUser = Utility.getCurrentUser();
    this.userFullName = currUser.fullname;
  }
  
  logOut() {
    this.svcUser.Logout();
    this.router.navigate(['/user/login']);
  }

  expandClassi() {
    setTimeout(() => this.expansionClassi.expanded = true, 10);
  }

  expandPagamenti() {
    setTimeout(() => this.expansionPagamenti.expanded = true, 10);
  }

  expandDocenti() {
    setTimeout(() => this.expansionDocenti.expanded = true, 10);
  }

  clickMenuItem() {
    if (!this.isPinned) {
      this.isExpanded = false
      this.leftSidenav.mode = "side";
    }
  }

  clickHamburger() {
    if (!this.isPinned) 
      this.isExpanded = !this.isExpanded
    
    if(this.isExpanded) 
      this.leftSidenav.mode = "over";
    else 
      this.leftSidenav.mode = "side";
  }

  clickPin() {
    this.isPinned = true
    this.leftSidenav.mode = "side";
  }

  clikUnPin() {
    this.isPinned = false; 
    this.isExpanded = false;
    this.leftSidenav.mode = "side";
  }
}
