import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
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
  
  constructor(private svcUser:        UserService) {}

  ngOnInit () {
    this.svcUser.obsLoggedIn.subscribe(val => {
      this.isLoggedIn = val;
      console.log ("this.isLoggedIn", this.isLoggedIn);
    })
   
  }

  savePDF() {
    
  }


}
