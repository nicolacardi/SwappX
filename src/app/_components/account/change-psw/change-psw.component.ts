import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/_user/user.service';
import { User } from 'src/app/_user/Users';

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
      newPassword:     ['', [Validators.required, Validators.minLength(4)]],
      repeatPassword:  ['', Validators.required]
    });
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

    this.svcUser.ChangePassword(formData).subscribe();
  }
}
