import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';
 
import { UserService } from '../user.service';

import { MatDialog } from '@angular/material/dialog';
import { SnackbarComponent } from 'src/app/_components/utilities/snackbar/snackbar.component';
import { LoadingService } from 'src/app/_components/utilities/loading/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../user.css']
})

export class LoginComponent implements OnInit {
  
  loading = false;
  form! :                     UntypedFormGroup;
  
  constructor(private svcUser:         UserService,
              private router:          Router,
              private fb:              UntypedFormBuilder,
              private eventEmitterService:  EventEmitterService,
              public _dialog:          MatDialog,
              private _loadingService: LoadingService,
              private _snackBar:       MatSnackBar ) {

    this.form = this.fb.group({
      UserName:                   ['a', Validators.required],
      Password:                   ['1234', { validators:[ Validators.required, Validators.maxLength(50)]}]
    })
  }

  ngOnInit() {
    if(localStorage.getItem('token') != null)
      this.router.navigateByUrl('/home');
  }

  onSubmit(){
    let obsUser$= this.svcUser.Login(this.form.value);
    const loadUser$ =this._loadingService.showLoaderUntilCompleted(obsUser$);
    
    loadUser$.subscribe({
      next: res => {
        this.eventEmitterService.onAccountSaveProfile();
        //nel caso di forkJoin res[0] è relativo al primo Observable 
        //this._snackBar.openFromComponent(SnackbarComponent, {  data: 'Benvenuto ' + res[0].fullname , panelClass: ['green-snackbar']}); 
        this._snackBar.openFromComponent(SnackbarComponent, {  data: 'Benvenuto ' + res.nome + ' ' + res.cognome , panelClass: ['green-snackbar']});  
        this.router.navigateByUrl('/home');
      },
      error: err=> {
        this.loading = false;
        this._snackBar.openFromComponent(SnackbarComponent, { data: err, panelClass: ['red-snackbar'] });
      }
    });
  }
  
  forgotPassword(e: Event){
    e.preventDefault();
    //console.log(this.validateEmail(this.form.controls.UserName.value));
    if(!this.validateEmail(this.form.controls.UserName.value)){ 
      this._snackBar.openFromComponent(SnackbarComponent, { data: "Inserire una email valida"  , panelClass: ['red-snackbar']});
      return;
    }

    //invio mail di reset
    //TODO 
  
    this._snackBar.openFromComponent(SnackbarComponent, { data: "E' stata inviata una mail con un link di reset a " + this.form.controls.UserName.value , panelClass: ['green-snackbar']});
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

