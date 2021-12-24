import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/_user/user.service';
import { User } from 'src/app/_user/Users';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

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
      repeatPassword:  ['', Validators.required]
    },
    {
      validator: this.checkIfMatchingPasswords('newPassword', 'repeatPassword'),
      validator1: this.checkIfChangedPasswords('password', 'newPassword')       //NON FUNZIONA!!!!!!
    });
  }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
        let passwordInput = group.controls[passwordKey],
            passwordConfirmationInput = group.controls[passwordConfirmationKey];
        if (passwordInput.value !== passwordConfirmationInput.value) 
          return passwordConfirmationInput.setErrors({notEquivalent: true})
        else
          return passwordConfirmationInput.setErrors(null);
    }
  }
  checkIfChangedPasswords(oldPassword: string, newPassword: string) {
    return (group: FormGroup) => {
        let pass1 = group.controls[oldPassword];
        let pass2 = group.controls[newPassword];

        if (pass1.value == pass2.value) 
          return pass2.setErrors({Equivalent: true})
        else
          return pass2.setErrors(null);
    }
  }

  ngOnInit(): void {
    let obj = localStorage.getItem('currentUser');
    this.currUser = JSON.parse(obj!) as User;

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
