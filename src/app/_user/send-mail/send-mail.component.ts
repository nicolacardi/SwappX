//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { firstValueFrom, tap }                  from 'rxjs';
import { MatDialog }                            from '@angular/material/dialog';

//components
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';
import { Utility }                              from 'src/app/_components/utilities/utility.component';
import { DialogOkComponent }                    from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';

//services
import { UserService }                          from '../user.service';
import { MailService }                          from 'src/app/_components/utilities/mail/mail.service';

//models
import { _UT_MailMessage }                      from 'src/app/_models/_UT_MailMessage';

//#endregion

@Component({
  selector: 'app-send-mail',
  templateUrl: './send-mail.component.html',
  styleUrls: ['../user.css']
})


export class SendMailComponent {

//#region ----- ViewChild Input Output ---------
  form! :                                       UntypedFormGroup;
//#endregion

//#region ----- ViewChild Input Output ---------
    @Output('reloadRoutes') reloadRoutes = new EventEmitter<string>();
//#endregion

//#region ----- Constructor --------------------

constructor(

  private fb:                                   UntypedFormBuilder,
  private _snackBar:                            MatSnackBar,
  private svcUser:                              UserService,
  private svcMail:                              MailService,
  public _dialog:                               MatDialog, 

  ) {

  this.form = this.fb.group({
    Email:                   ['', Validators.required],
  })
}
//#endregion

  backToLogin(e: Event){
      e.preventDefault();
    this.reloadRoutes.emit("login");
  }

  async onSubmit(){
    if(!Utility.validateEmail(this.form.controls.Email.value)){ 
      this._snackBar.openFromComponent(SnackbarComponent, { data: "Inserire una email valida"  , panelClass: ['red-snackbar']});
      return;
    }

    let mailAddress = this.form.controls.Email.value;
          
    let user : any;
    //interrogo e aspetto il DB per ottenere lo user che ha questa mail 
    //(TODO: bloccare inserimento più utenti con una stessa mail!)
    await firstValueFrom(this.svcUser.getByMailAddress(mailAddress)
      .pipe(
        tap(res => { user = res;}
      )
    ));
    
    //console.log ("user trovato", user);

    if (!user) {
      this._snackBar.openFromComponent(SnackbarComponent, { data: "L'Email non è presente per alcun utente"  , panelClass: ['green-snackbar']});
      return;
    }

    let rndPassword = Utility.generateRandomString();
    
    //Reset Password con utente e pagina random generata
    //await firstValueFrom(this.svcUser.ResetPassword(user.id, rndPassword)); //sincrono
    this.svcUser.ResetPassword(user.id, rndPassword).subscribe();                         //asincrono
    
    let titoloMail = "STOODY: Invio Password Temporanea";

    let testoMail =  "<html><body>"+
    
    //segue il logo STOODY in base64

    //TODO: recuperare la risorsa del logo e convertirlo in base64
    //....


    
    "<img style='width: 100px' src='data:image/png;base64,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'/> <br><br>" +

    "E' stata richiesta una nuova password per l'utente riferito a questo indirizzo email <br>." +
    "<br><br>"+
    "Di seguito le nuove credenziali: <br><br>" +
    "Nome Utente: " + user.userName + "<br>" +
    "Password temporanea : " + rndPassword;

    let objMail: _UT_MailMessage= {
      emailAddress: mailAddress,
      testoMail: testoMail,
      titoloMail: titoloMail
    }

    this.svcMail.inviaMail(objMail).subscribe({
      next: res=> {
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Inviata email di reset password a " + mailAddress}
        });
      },
      error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: "Errore durante l'invio", panelClass: ['red-snackbar']}))
    });

  }

}
