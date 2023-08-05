//#region ----- IMPORTS ------------------------
import { Component, Renderer2, ElementRef, OnInit, ViewChild, AfterViewInit }                    from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { SnackbarComponent }                    from '../../_components/utilities/snackbar/snackbar.component';
import { ActivatedRoute }                       from '@angular/router';
import { Router }                               from '@angular/router';

//components
import { Utility }                              from '../../_components/utilities/utility.component';

//services
import { UserService }                          from 'src/app/_user/user.service';
import { User }                                 from 'src/app/_user/Users';
import { firstValueFrom, tap } from 'rxjs';

//#endregion

@Component({
  selector: 'app-change-psw-ext',
  templateUrl: './change-psw-ext.component.html',
  styleUrls: ['../user.css']
})

export class ChangePswExtComponent implements OnInit {

//#region ----- Variabili ----------------------

  form! :                                       UntypedFormGroup;
  public user!:                             User;
  routedUsername!:                              string;
  routedRndPassword!:                           string;

  ckPsw : boolean[] =[true, true, true];
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('psw0') pswInput0!: ElementRef;
  @ViewChild('psw1') pswInput1!: ElementRef;
  @ViewChild('psw2') pswInput2!: ElementRef;
//#endregion


//#region ----- Constructor --------------------

  constructor( private fb:                      UntypedFormBuilder, 
               private svcUser:                 UserService,
               private _snackBar:               MatSnackBar,
               private renderer:                Renderer2,
               private route:                   ActivatedRoute,
               private router: Router) { 

    this.route.queryParams.subscribe(params => {
      this.routedUsername = params['username'];
      this.routedRndPassword = params['rndpassword'];
    });

    this.form = this.fb.group({
        UserName:                               [this.routedUsername],
        password:                               [this.routedRndPassword, [Validators.required, Validators.minLength(4)]],
        newPassword:                            ['', [Validators.required, Validators.minLength(4), Validators.maxLength(19)]],
        confirmPassword:                        ['', Validators.required]
      },
      {
        validators: [
          Utility.matchingPasswords ('newPassword', 'confirmPassword'),
          Utility.checkIfChangedPasswords('password', 'newPassword') ]
      });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {


  }

  // ngAfterViewInit() {
  //   this.form.controls['UserName'].setValue(this.routedUsername);

  // }
  async save(){
    //estraggo l'utente e con la password temporanea per verificare se corrisponde (altrimenti uno potrebbe accedere alla pagina e farlo da sè)

    await firstValueFrom(this.svcUser.getByUsernameAndTmpPassword(this.form.controls.UserName.value, this.form.controls.password.value)
      .pipe(
        tap(res => { this.user = res;}
      )
    ));

    if (!this.user) {
      this._snackBar.openFromComponent(SnackbarComponent, { data: "Credenziali errate"  , panelClass: ['green-snackbar']});
      return;
    }
    console.log ("ok le credenziali corrispondono");
    console.log ("imposto", this.form.controls.UserName.value, this.form.controls.newPassword.value);
    //se tutto corrisponde imposto quella nuova tramite ResetPassword

    
    this.svcUser.ResetPassword(this.user.id, this.form.controls.newPassword.value).subscribe({
      next: res =>  {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
      },
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio della password', panelClass: ['red-snackbar']})
    });
  }
//#endregion

  toggleShow(index: number) {
    this.ckPsw[index] = !this.ckPsw[index];
    const inputElement = this.getInputByIndex(index);

    const newType = this.ckPsw[index] ? 'password' : 'text';
    this.renderer.setAttribute(inputElement, 'type', newType);
  }

  getInputByIndex(index: number): HTMLInputElement {
    switch (index) {
      case 0:
        return this.pswInput0.nativeElement;
      case 1:
        return this.pswInput1.nativeElement;
      case 2:
        return this.pswInput2.nativeElement;
      default:
        throw new Error(`Invalid index: ${index}`);
    }
  }

  toLogin() {
    this.router.navigate(['/user/login']); 
  }
}
