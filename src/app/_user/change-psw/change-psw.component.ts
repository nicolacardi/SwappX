import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../_components/utilities/snackbar/snackbar.component';

import { UserService } from 'src/app/_user/user.service';
import { User } from 'src/app/_user/Users';

import { Utility } from '../../_components/utilities/utility.component';

@Component({
  selector: 'app-change-psw',
  templateUrl: './change-psw.component.html',
  styleUrls: ['../user.css']
})

export class ChangePswComponent implements OnInit {

  form! :              UntypedFormGroup;
  public currUser!:    User;

  constructor( private fb:                   UntypedFormBuilder, 
               private svcUser:              UserService,
               private _snackBar:            MatSnackBar ) { 

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
    
    let formData = {
      userID:       this.currUser.userID,
      currPassword:  this.form.controls.password.value,
      newPassword:  this.form.controls.newPassword.value
    };

    this.svcUser.ChangePassword(formData).subscribe({
      next: res =>  {
        if(res.succeeded == false)
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password attuale non corretta', panelClass: ['red-snackbar']});
        else
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
      },
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio della password', panelClass: ['red-snackbar']})
    });
  }
}
