import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { pairwise, startWith, tap } from 'rxjs/operators';

import { RuoliService } from 'src/app/_user/ruoli.service';
import { UserService } from 'src/app/_user/user.service';
import { Ruolo, User } from 'src/app/_user/Users';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

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

  previousMatSelect! :        number;
  currUserRuolo!:             number;
  currUserID!:                string;       //ID dell'utente loggato
  userID!:                    string;       //ID dell'utente che si sta editando

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
      email:            ['', Validators.email],
      badge:            [''],
      password:         ['', [Validators.minLength(4), Validators.maxLength(19)]],
      ruoloID:          [''],
    });
  }


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    this.svcUser.obscurrentUser.subscribe(val => {
        this.currUserRuolo = val.ruoloID;
        this.currUserID = val.userID;
    })

    this.loadData();

    //salvo in una proprietà (previousMatSelect) il valore PRECEDENTE nella combo
    this.form.controls.ruoloID.valueChanges.pipe(
      startWith(this.form.controls.ruoloID.value),
      pairwise()
    ).subscribe(
      ([old,value])=>{
        this.previousMatSelect = old;
        console.log (old);
      }
    )
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
            this.userID = utente.id;            /*
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
              {data: 'Record cancellato', panelClass: ['green-snackbar']}
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

    let formData = {
      userID:     this.idUser,   
      UserName:   this.form.controls.userName.value,
      Email:      this.form.controls.email.value,
      FullName:   this.form.controls.fullName.value,
      Badge:      this.form.controls.badge.value,
      RuoloID:    this.form.controls.ruoloID.value,
      Password:   this.form.controls.password.value
      
    };
    



    if (formData.userID == "0") {
      if (formData.Password == ""  || formData.Password == null || formData.Password == undefined) {
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Password obbligatoria"}
        });
        return;        
      }
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
          console.log (formData);
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Profilo utente salvato', panelClass: ['green-snackbar']})}
        );
    }


    if(formData.userID != "0" && this.form.controls.password.dirty && this.form.controls.password.value != "" ){
      
      this.svcUser.ResetPassword(this.idUser, this.form.controls.password.value)
        .subscribe( res=> {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
          this._dialogRef.close();
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel cambio password', panelClass: ['red-snackbar']})
        ));
    }
  }



  ruoloChange() {
    if (this.currUserRuolo != 11 && this.previousMatSelect == 11) {
      //impedisco  ai non SysAdmin di modificare il ruolo di quelli che sono SySAdmin
      //un SySAdmin invece può cambiare tutti gli altri (non il suo, v. oltre)
      //può cambiare anche il ruolo di un altro SysAdmin
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Non puoi impostare il ruolo per questo utente"}
      });
      this.form.controls['ruoloID'].setValue(this.previousMatSelect);
      return;
    }


    if (this.currUserRuolo != 11 && this.form.controls.ruoloID.value == 11) {
      //impedisco ai non SysAdmin di impostare alcuno come SySAdmin 
      //altrimenti potrei portare un profilo di alunno a essere SysAdmin e poi con quel profilo modificare il profilo degli altri SysAdmin
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Non puoi impostare questo ruolo"}
      });
      this.form.controls['ruoloID'].setValue(this.previousMatSelect);
      return;
    }

    if (this.currUserID == this.userID) {
      //impedisco di modificare il proprio ruolo a chiunque, compresi i SysAdmin
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Non puoi modificare il tuo ruolo"}
      });
      this.form.controls['ruoloID'].setValue(this.previousMatSelect);
      return;
    }
  }

}

