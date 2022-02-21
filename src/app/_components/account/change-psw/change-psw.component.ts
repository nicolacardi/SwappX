import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/_user/user.service';
import { User } from 'src/app/_user/Users';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { Utility } from '../../utilities/utility.component';

@Component({
  selector: 'app-change-psw',
  templateUrl: './change-psw.component.html',
  styleUrls: ['../account.component.css']
})

export class ChangePswComponent implements OnInit {

  form! :              FormGroup;
  public currUser!:    User;

  constructor(private fb:                   FormBuilder, 
              private svcUser:              UserService,
              private _snackBar:            MatSnackBar
    ) { 

    this.form = this.fb.group({
      password:        ['', [Validators.required, Validators.minLength(4)]],
      newPassword:     ['', [Validators.required, Validators.minLength(4), Validators.maxLength(19)]],
      confirmPassword: ['', Validators.required]
    },
    {
      validators: [
        Utility.matchingPasswords ('newPassword', 'confirmPassword'),
        Utility.checkIfChangedPasswords('password', 'newPassword') ]
    });
  }


  ngOnInit(): void {
    this.currUser = Utility.getCurrentUser();
  }

  save(){
    
    var formData = {
      userID:       this.currUser.userID,
      currPassword:  this.form.controls.password.value,
      newPassword:  this.form.controls.newPassword.value
    };

    this.svcUser.ChangePassword(formData).subscribe(res =>  {
      if(res.succeeded == false){
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password attuale non corretta', panelClass: ['red-snackbar']});
      }
      else
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
    },
    err=>{
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio della password', panelClass: ['red-snackbar']});
    });
  }
}
