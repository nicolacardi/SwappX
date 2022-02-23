import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { concat, Observable } from 'rxjs';
import { concatMap, finalize, tap } from 'rxjs/operators';

import { RuoliService } from 'src/app/_user/ruoli.service';
import { UserService } from 'src/app/_user/user.service';
import { Ruolo, User } from 'src/app/_user/Users';

import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['../users.css']
})
export class UserEditComponent implements OnInit {

  user$!:                     Observable<User>;
  obsRuoli$!:                 Observable<Ruolo[]>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) public idUser: string,
    public _dialogRef:                          MatDialogRef<UserEditComponent>,
  
    private svcUser:                            UserService,
    private svcRuoli:                           RuoliService,
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    private _loadingService :                   LoadingService,
    private fb:                                 FormBuilder,
  ) { 

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      userName:         [''],
      fullName:         [''],
      email:            [''],
      badge:            [''],
      password:         [''],
      ruoloID:          [''],
    });
  }


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    this.loadData();
  }

  loadData() {

    this.obsRuoli$ = this.svcRuoli.list();
    this.form.controls['ruoloID'].setValue(this.user$);

    if (this.idUser && this.idUser + '' != "0") {
      const obsUser$: Observable<User> = this.svcUser.get(this.idUser);
      const loadUser$ = this._loadingService.showLoaderUntilCompleted(obsUser$);
      
      this.user$ = loadUser$.pipe(
          tap(utente => {
            this.form.patchValue(utente);
            /*
            this.svcRuoli.list().pipe().subscribe();
            */
          })
      );
    } 
    else 
      this.emptyForm = true;
  }

  //#endregion

  delete() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result){
        this.svcUser.delete(this.idUser)
        .subscribe(
          ()=>{
            this._snackBar.openFromComponent(SnackbarComponent,
              {data: 'Record cancellato', panelClass: ['red-snackbar']}
            );
            this._dialogRef.close();
          },
          ()=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          )
        );
      }
    });
  }

  save() {

    var formData = {
      userID:     this.idUser,   
      UserName:   this.form.controls.userName.value,
      Email:      this.form.controls.email.value,
      FullName:   this.form.controls.fullName.value,
      Badge:      this.form.controls.badge.value,
      RuoloID:    this.form.controls.ruoloID.value
    };
    
    if (formData.userID == "0") {
        this.svcUser.post(this.form.value)
             .subscribe(res=> {
               this._dialogRef.close();
             },
             err=> (
               this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
             ));
    } else {
      this.svcUser.put(formData)
        .subscribe( ()=> {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Profilo utente salvato (MANCANO PASSWORD E RUOLO)', panelClass: ['green-snackbar']})}
        );
    }

    var formDataPwd = {
      userID:     this.idUser,   
      Password:   this.form.controls.password.value
    };

    if(this.form.controls.password.dirty && this.form.controls.password.value != "" ){

      console.log("Dirty Diana");

      this.svcUser.ResetPassword(formDataPwd)
        .subscribe( res=> {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
          this._dialogRef.close();
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel cambio password', panelClass: ['red-snackbar']})
        ));
      }
  }
}

