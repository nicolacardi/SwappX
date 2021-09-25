import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Router } from '@angular/router';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
//import { SidebarComponent } from '../../shared/sidebar/sidebar.component'

import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../user.css']
})

export class LoginComponent implements OnInit {
  loading = false;
  formModel={
    UserName:'',
    Password:''
  };

  constructor(private uService: UserService, private router:Router, private snackBar : MatSnackBar) {
  }

  ngOnInit() {
    if(localStorage.getItem('token') != null){

      this.router.navigateByUrl('/default');
    }
  }

  onSubmit(form:NgForm){
    this.loading = true;
    //console.log("Login: " + this.formModel.UserName);

    this.uService.Login(form.value).subscribe(
      (res: any) => {

        this.uService.changeLoggedIn(true);
        this.ShowMessage("Login Corretta", "Benvenuto " + this.uService.currUser.fullname, false);

        //Forse fa schifo ma funziona
        //this.sidebar.ngOnInit();

        this.router.navigateByUrl('/default');
      },
      err=> {
        this.loading = false;

        this.uService.changeLoggedIn(false);
        if(err.status== 400) {
          this.ShowMessage("Utente o Password errati", "Riprova",true);
        }
        else {
          console.log(err);
          this.ShowMessage("Server Error: ", "Time-out" ,true);
          //this.ShowMessage(err,"" , true);
        }
      }
    );
  }


  ShowMessage(msg: string, title?: string, hasErrors: boolean= false ) {
    let config = new MatSnackBarConfig();
    config.verticalPosition  = 'bottom';
    config.horizontalPosition = 'center';
    config.duration = 2000;

    if(hasErrors){
      config.panelClass =  ['error-class'];
      console.log("ShowMessage: hasErrors");
    }
    //else
    //  config.panelClass =  ['ng-deep'];

    if(title != null)
      this.snackBar.open(msg, title, config);
    else
      this.snackBar.open(msg,"", config);
  }

}

