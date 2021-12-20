import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { User } from './_user/Users';
import { UserService } from './_user/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  //isLoggedIn?: boolean;

  public isLoggedIn?:  boolean = false;
  public currUser!: User;
  public userFullName: string = "";
  public imgAccount!: string;
  stringJson: any;
  stringObject: any;

  public mode = new FormControl('over');
  title = 'Stoody';



  @ViewChild('end') public rightSidenav!: MatSidenav;
  
  constructor(private svcUser:        UserService,
              private router: Router) {}

  ngOnChange() {

  }
  ngOnInit () {

    this.svcUser.obscurrentUser.subscribe(val => {
      this.currUser = val;

      if(this.currUser){
        this.userFullName = this.currUser.fullname;
        this.isLoggedIn = this.currUser.isLoggedIn;
      }
    })

    this.svcUser.getUserFoto(this.currUser.userID).subscribe(val=> {this.imgAccount = val.foto;});


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
