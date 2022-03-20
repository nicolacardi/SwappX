import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
              private svcParametri:   ParametriService, 
              private router:         Router,
              private fb:             FormBuilder,
              private eventEmitterService:  EventEmitterService,
              public _dialog:         MatDialog,
              private _loadingService:  LoadingService,
              private _snackBar:      MatSnackBar,
              ) {
    this.form = this.fb.group({
      UserName:                   ['a', Validators.required],
      Password:                   ['1234', { validators:[ Validators.required, Validators.maxLength(50)]}]
    })
  }

  ngOnInit() {
    if(localStorage.getItem('token') != null){
      this.router.navigateByUrl('/home');
    }
  }

  onSubmit(){
    let obsUser$= this.svcUser.Login(this.form.value);
    const loadUser$ =this._loadingService.showLoaderUntilCompleted(obsUser$);
    
    loadUser$.subscribe(
      (res: any) => {

        this.eventEmitterService.onAccountSaveProfile();

        //this.svcUser.changeLoggedIn(true);
        this._snackBar.openFromComponent(SnackbarComponent, {
          //data: 'Benvenuto ' + res.fullname , panelClass: ['green-snackbar']
          data: 'Benvenuto ' + res[0].fullname , panelClass: ['green-snackbar']
        });

        this.router.navigateByUrl('/home');
      },
      err=> {
        this.loading = false;

        this._snackBar.openFromComponent(SnackbarComponent, {
          data: err, panelClass: ['red-snackbar']
        });

        /*
        //this.svcUser.changeLoggedIn(false);
        if(err.status== 400) {
          this._snackBar.openFromComponent(SnackbarComponent, {
            //data: 'Utente o Password errati', panelClass: ['red-snackbar']
            data: err, panelClass: ['red-snackbar']
          });
        }
        else {
          console.log(err);

          this._snackBar.openFromComponent(SnackbarComponent, {
              //data: 'Server Error: timeout!', panelClass: ['red-snackbar']
              data: err, panelClass: ['red-snackbar']
          });
        }
        */
      }
    );
  }


  /*
  public forgotPassword1 = (route: string, body: ForgotPasswordDto) => {
    return this._http.post(this.createCompleteRoute(route, this._envUrl.urlAddress), body);
  }
  */

  
  forgotPassword(e: Event){

    e.preventDefault();

    //console.log(this.validateEmail(this.form.controls.UserName.value));
    if(!this.validateEmail(this.form.controls.UserName.value)){
      this._snackBar.openFromComponent(SnackbarComponent, {
        data: "Inserire una email valida"  , panelClass: ['red-snackbar']
      });
      return;
    }

    //invio mail di reset
    //TODO 
   
    this._snackBar.openFromComponent(SnackbarComponent, {
      data: "E' stata inviata una mail con un link di reset a " + this.form.controls.UserName.value , panelClass: ['green-snackbar']
    });
  }

  validateEmail(email: string) {
    const regularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regularExpression.test(String(email).toLowerCase());
   }
  /*
    /* WS REST
    https://code-maze.com/angular-password-reset-functionality-with-aspnet-identity/

    [HttpPost("ForgotPassword")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        if (!ModelState.IsValid)
            return BadRequest();
        let user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
        if (user == null)
            return BadRequest("Invalid Request");
        let token = await _userManager.GeneratePasswordResetTokenAsync(user);         
        let param = new Dictionary<string, string>
        {
            {"token", token },
            {"email", forgotPasswordDto.Email }
        };
        let callback = QueryHelpers.AddQueryString(forgotPasswordDto.ClientURI, param);
        let message = new Message(new string[] { user.Email }, "Reset password token", callback, null);
        await _emailSender.SendEmailAsync(message);
        return Ok();
    }
    */
   
}

