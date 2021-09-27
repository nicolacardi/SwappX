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
  
  constructor(private uService:       UserService, 
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
      this.router.navigateByUrl('/default');
    }
  }

  onSubmit(){
    this.loading = true;
    //console.log("Login: " + this.formModel.UserName);

    this.uService.Login(this.form.value).subscribe(
      (res: any) => {

        this.uService.changeLoggedIn(true);
        //this.ShowMessage("Login Corretta", "Benvenuto " + this.uService.currUser.fullname, false);
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: 'Benvenuto!', panelClass: ['green-snackbar']
        });
        //Forse fa schifo ma funziona
        //this.sidebar.ngOnInit();

        this.router.navigateByUrl('/default');
      },
      err=> {
        this.loading = false;

        this.uService.changeLoggedIn(false);
        if(err.status== 400) {
          //this.ShowMessage("Utente o Password errati", "Riprova",true);
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Utente o Password errati! - Riprova!', panelClass: ['green-snackbar']
          });
        }
        else {
          console.log(err);
          //this.ShowMessage("Server Error: ", "Time-out" ,true);
          //this.ShowMessage(err,"" , true);
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

  // ShowMessage(msg: string, title?: string, hasErrors: boolean= false ) {
  //   let config = new MatSnackBarConfig();
  //   config.verticalPosition  = 'bottom';
  //   config.horizontalPosition = 'center';
  //   config.duration = 2000;

  //   if(hasErrors){
  //     config.panelClass =  ['error-class'];
  //     console.log("ShowMessage: hasErrors");
  //   }
  //   //else
  //   //  config.panelClass =  ['ng-deep'];

  //   if(title != null)
  //     this.snackBar.open(msg, title, config);
  //   else
  //     this.snackBar.open(msg,"", config);
  // }

}

