import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../user.css']
})

export class RegisterComponent implements OnInit {

  form! :                     UntypedFormGroup;
  
  constructor(  private fb:             UntypedFormBuilder) {
    
    this.form = this.fb.group({
      UserName:                   ['user', Validators.required],
      Password:                   ['pass', { validators:[ Validators.required, Validators.maxLength(50)]}],
      PasswordRepeat:             ['pass', { validators:[ Validators.required, Validators.maxLength(50)]}],
      fullname:                   ['Nicola cardi', { validators:[ Validators.required, Validators.maxLength(50)]}],
      email:                      ['nicola.cardi@gmail.com', { validators:[ Validators.required, Validators.maxLength(50)]}]
    })
   }

  ngOnInit(): void {
  }

  onSubmit(){

  }

}
