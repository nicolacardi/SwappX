import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
//import { SidebarComponent } from '../../shared/sidebar/sidebar.component'

import { UserService } from '../user.service';
import { DialogOkComponent } from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarComponent } from 'src/app/_components/utilities/snackbar/snackbar.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../user.css']
})

export class LoginComponent implements OnInit {
  loading = false;
  // formModel={
  //   UserName:'',
  //   Password:''
  // };

  form! :                     FormGroup;
  
  constructor(private svcUser:       UserService, 
              private router:         Router,
              private snackBar :      MatSnackBar,
              private fb:             FormBuilder,
              public _dialog:         MatDialog,
              private _snackBar:      MatSnackBar,
              ) {
    this.form = this.fb.group({
      UserName:                   ['user', Validators.required],
      Password:                   ['pass', { validators:[ Validators.required, Validators.maxLength(50)]}]
    })
  }

  ngOnInit() {
    if(localStorage.getItem('token') != null){
      
      //console.log("Token: " , localStorage.getItem('token'));

      this.router.navigateByUrl('/home');
    }
  }

  onSubmit(){

    this.svcUser.Login(this.form.value).subscribe(
      (res: any) => {
        
        this.svcUser.changeLoggedIn(true);
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: 'Benvenuto!', panelClass: ['green-snackbar']
        });

        this.router.navigateByUrl('/home');
      },
      err=> {
        this.loading = false;

        this.svcUser.changeLoggedIn(false);
        if(err.status== 400) {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Utente o Password errati', panelClass: ['red-snackbar']
          });
        }
        else {
          console.log(err);
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Server Error: timeout!', panelClass: ['red-snackbar']
          });
        }
      }
    );
  }

  problemiLogin(){
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "HAI DIMENTICATO LA PASSWORD?", sottoTitolo: "Bravo mona!"}
    });
  }
}

