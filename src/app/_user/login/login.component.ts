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
      
      //console.log("Token: " , localStorage.getItem('token'));

      this.router.navigateByUrl('/home');
    }
  }

  onSubmit(){

    /*
    this.svcRette.loadByAlunnoAnnoMese(this.alunnoID, this.annoID, (this.formRetta.controls['meseRetta'].value + 1))
      .pipe (
        tap (val=> this.formRetta.controls['rettaID'].setValue(val.id)), //il valore in arrivo dalla load viene inserito nel form
        concatMap(() => this.svcPagamenti.post(this.formRetta.value)) //concatMap ATTENDE l'observable precedente prima di lanciare il successivo
        )
        .subscribe(
          ()=> {
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            //this._dialogRef.close();
            this.pagamentoEmitter.emit(this.formRetta.controls['meseRetta'].value);
            this.resetFields();
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
      );
    */

    let obsUser$= this.svcUser.Login(this.form.value);
    const loadUser$ =this._loadingService.showLoaderUntilCompleted(obsUser$);
    
    loadUser$.subscribe(
      (res: any) => {

        //console.log("login.component - onSubmit", res);

        //  this.svcParametri.loadParametro("AnnoCorrente").subscribe(
        //      (par: any) => {
        //        console.log("DEBUG1:", par);
        //      }
        //  )

        //this.svcUser.changeLoggedIn(true);
        this._snackBar.openFromComponent(SnackbarComponent, {
          //data: 'Benvenuto ' + res.fullname , panelClass: ['green-snackbar']
          data: 'Benvenuto ' + res[0].fullname , panelClass: ['green-snackbar']
        });

        this.router.navigateByUrl('/home');
      },
      err=> {
        this.loading = false;

        //console.log("DEBUG - err: ", err);

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

  problemiLogin(){
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "HAI DIMENTICATO LA PASSWORD?", sottoTitolo: "Bravo mona!"}
    });
  }
}

