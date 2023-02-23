import { Component, OnInit }                    from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { Router }                               from '@angular/router';
import {MatLegacySnackBar as MatSnackBar}                            from '@angular/material/legacy-snack-bar';

import { UserService }                          from '../user.service';
import { ParametriService }                     from 'src/app/_services/parametri.service';

import { MatLegacyDialog as MatDialog }                            from '@angular/material/legacy-dialog';
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';
import { LoadingService }                       from 'src/app/_components/utilities/loading/loading.service';
import { EventEmitterService }                  from 'src/app/_services/event-emitter.service';
import { Utility }                              from  '../../_components/utilities/utility.component';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../user.css']
})

/* ++++++++ DA FINIRE +++++++

*/
export class ResetPasswordComponent implements OnInit {
  loading = false;
  form! :                     UntypedFormGroup;
  
  constructor( private svcUser:        UserService,
               private svcParametri:   ParametriService, 
               private router:         Router,
               private fb:             UntypedFormBuilder,
               private eventEmitterService:  EventEmitterService,
               public _dialog:         MatDialog,
               private _loadingService:  LoadingService,
               private _snackBar:      MatSnackBar  )  {
                
    this.form = this.fb.group(
      {
        Password:                  ['', { validators:[ Validators.required, Validators.minLength(4), Validators.maxLength(19)]}],
        ConfirmPassword:           ['', { validators:[ Validators.required, Validators.minLength(4), Validators.maxLength(19)]}]
      },
      {
        validators: Utility.matchingPasswords('Password', 'ConfirmPassword')
      }
    )
  }

  ngOnInit() {
  }

  onSubmit(){
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
  }
  
}

