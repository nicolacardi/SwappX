import { Component, OnInit } from '@angular/core';

import { User } from 'src/app/_models/Users';
import { UserService } from 'src/app/_user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  user!:                  User;
  userFullName!:          string;


  constructor( private svcUser:       UserService) {

  }


  ngOnInit(): void {
  
    //console.log("ANDREA: ",this.svcUser);
    //this.userFullName= this.svcUser.currUser.fullname;

  }

}
