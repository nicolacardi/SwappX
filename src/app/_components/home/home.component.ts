import { Component, OnInit } from '@angular/core';

import { User } from 'src/app/_user/Users';
import { UserService } from 'src/app/_user/user.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  currUser!:              User;
  userFullName!:          string;


  constructor( private svcUser:       UserService) {

    this.currUser = svcUser.currentUser;
    //this.userFullName = this.user.fullname;
  }


  ngOnInit(): void {
      //this.userFullName= this.svcUser.currUser.fullname;
  }


}
