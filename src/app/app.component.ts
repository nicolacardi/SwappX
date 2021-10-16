import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { UserService } from './_user/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  public isLoggedIn!: boolean;
  public mode = new FormControl('over');
  title = 'SwappX';



  @ViewChild('end') public rightSidenav!: MatSidenav;
  
  constructor(private svcUser:        UserService,
              private router: Router) {}

  ngOnInit () {
    this.svcUser.obsLoggedIn.subscribe(val => {
      this.isLoggedIn = val;
      console.log ("this.isLoggedIn", this.isLoggedIn);
    })
   
  }

  logOut(){

    //this.currUser = null;
    this.svcUser.Logout();

    this.svcUser.changeLoggedIn(false);
    this.router.navigate(['/user/login']);

  }

  savePDF() {
    
  }


}
