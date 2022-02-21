import { Component, OnInit } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { concatMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';

import { UserService } from '../user.service';
import { ParametriService } from 'src/app/_services/parametri.service';

import { DialogOkComponent } from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarComponent } from 'src/app/_components/utilities/snackbar/snackbar.component';
import { LoadingService } from 'src/app/_components/utilities/loading/loading.service';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';
import { Utility } from  '../../_components/utilities/utility.component';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../user.css']
})

export class ResetPasswordComponent implements OnInit {
  loading = false;
  form! :                     FormGroup;
  
  constructor(
    private svcUser:        UserService,
    private svcParametri:   ParametriService, 
    private router:         Router,
    private fb:             FormBuilder,
    private eventEmitterService:  EventEmitterService,
    public _dialog:         MatDialog,
    private _loadingService:  LoadingService,
    private _snackBar:      MatSnackBar  ) 
  {
    this.form = this.fb.group(
      {
        Password:                  ['', { validators:[ Validators.required, Validators.minLength(4), Validators.maxLength(19)]}],
        ConfirmPassword:           ['', { validators:[ Validators.required, Validators.minLength(4), Validators.maxLength(19)]}]
      },
      {
        //validators: Utility.matchingPasswords('Password', 'ConfirmPassword')
        validators: Utility.matchingPasswords()
      }
    )
  }

  ngOnInit() {
  }

  onSubmit(){
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
  }
  
}

