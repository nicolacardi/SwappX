//#region ----- IMPORTS ------------------------
import { Component, Renderer2, ElementRef, EventEmitter, OnInit, Output, ViewChild }                    from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router }                               from '@angular/router';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { EventEmitterService }                  from 'src/app/_services/event-emitter.service';
import { MatDialog }                            from '@angular/material/dialog';

//components
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';

//services
import { UserService } from '../user.service';
import { LoadingService } from 'src/app/_components/utilities/loading/loading.service';
import { ParametriService } from 'src/app/_services/parametri.service';
import { map } from 'rxjs';

//models

//#endregion

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../user.css']
})

export class LoginComponent implements OnInit {
  
//#region ----- Variabili ----------------------

  loading = false;
  form! :                                       UntypedFormGroup;
  ckPsw = true;

//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('psw') pswInput!: ElementRef;
  
  @Output('reloadRoutes') reloadRoutes = new EventEmitter<string>();
//#endregion

//#region ----- Constructor --------------------

  constructor(private svcUser:                  UserService,
              private svcParametri:             ParametriService,
              private router:                   Router,
              private fb:                       UntypedFormBuilder,
              private eventEmitterService:      EventEmitterService,
              public _dialog:                   MatDialog,
              private _loadingService:          LoadingService,
              private _snackBar:                MatSnackBar,
              private renderer:                 Renderer2) { 

    this.form = this.fb.group({
      UserName:                   ['a', Validators.required],
      Password:                   ['1234', { validators:[ Validators.required, Validators.maxLength(50)]}]
    })
  }

//#endregion

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
        this._snackBar.openFromComponent(SnackbarComponent, {  data: 'Benvenuto ' + res.nome + ' ' + res.cognome , panelClass: ['green-snackbar']});  
        
        this.svcParametri.getByParName('AnnoCorrente')
          .pipe(map( par => {
            localStorage.setItem(par.parName, JSON.stringify(par));
            //return par;
          })
        ).subscribe(
          ()=> this.router.navigateByUrl('/home')
        );
      },
      error: err=> {
        this.loading = false;
        this._snackBar.openFromComponent(SnackbarComponent, { data: err, panelClass: ['red-snackbar'] });
      }
    });
  }
  
  forgotPassword(e: Event){
    e.preventDefault();
    this.reloadRoutes.emit('reset-psw');
  }

  validateEmail(email: string) {
    const regularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regularExpression.test(String(email).toLowerCase());
  }
   
  toggleShow() {
    this.ckPsw = !this.ckPsw;
    const inputElement = this.pswInput.nativeElement;
    const newType = this.ckPsw ? 'password' : 'text';
    
    this.renderer.setAttribute(inputElement, 'type', newType);
  }
}

