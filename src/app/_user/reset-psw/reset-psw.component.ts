//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { firstValueFrom, tap }                  from 'rxjs';
import { MatDialog }                            from '@angular/material/dialog';
import { logoBase64 }                           from 'src/environments/environment';

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
  selector: 'app-reset-psw',
  templateUrl: './reset-psw.component.html',
  styleUrls: ['../user.css']
})


export class ResetPswComponent {

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

    //console.log ("reset password richiesto");
    if(!Utility.validateEmail(this.form.controls.Email.value)){ 
      this._snackBar.openFromComponent(SnackbarComponent, { data: "Inserire una email valida"  , panelClass: ['red-snackbar']});
      return;
    }

    let mailAddress = this.form.controls.Email.value;
          
    let user : any;
    //interrogo e aspetto il DB per ottenere lo user che ha questa mail 
          //(TODO: bloccare possibilità di inserimento più utenti con una stessa mail!)
    await firstValueFrom(this.svcUser.getByMailAddress(mailAddress)
      .pipe(
        tap(res => { user = res;}
      )
    ));
    
    //console.log ("user trovato", user);

    if (!user) {
      this._snackBar.openFromComponent(SnackbarComponent, { data: "L'Email non è presente per alcun utente"  , panelClass: ['red-snackbar']});
      return;
    }

    let rndPassword = Utility.generateRandomString();

    //Reset Password con utente e pagina random generata AVVENIVA COSI' PRIMA DI RIFARE IL GIRO CON INVIO E SALVATAGGIO PSW TEMPORANEA
    //await firstValueFrom(this.svcUser.ResetPassword(user.id, rndPassword));                //sincrono
    //this.svcUser.ResetPassword(user.id, rndPassword).subscribe();                         //asincrono


    //ora devo salvare la password temporanea

    let formData = {
      userID:       user.id,                    //necessario x la put
      userName:     user.userName,              //necessario x la put
      personaID:    user.personaID,             //necessario x la put
      tmpPassword:  rndPassword,                //nuova psw
      email:        user.email,                 //se non lo metto viene cancellato
      normalizedEmail:  user.normalizedEmail,   //se non lo metto viene cancellato
      fullName:  user.fullName                  //se non lo metto viene cancellato
    };

    //const formData = { ...user, tmpPassword: rndPassword }; //così purtroppo non funziona (SAREBBE STATO + ELEGANTE)

    //console.log ("imposto tmpPassword tramite formData", formData);
    this.svcUser.put(formData).subscribe({
      next: res =>  {
        //console.log ("tmpPassword impostata")
      },
      error: err=>  {
        //console.log ("errore in impostazione tmpPassword")
      }
    });
  
    let titoloMail = "STOODY: Invio Password Temporanea";
    let testoMail =  "<html><body>"+
    
    //segue il logo STOODY in base64

    //TODO: recuperare la risorsa del logo e convertirlo in base64

    "<img style='width: 100px' src='"+logoBase64+"'/> <br><br>" +

    "E' stata richiesta una nuova password per l'utente riferito a questo indirizzo email. <br>" +
    "<br><br> Puoi accedere tramite questo <a href='localhost:4200/change-psw-ext?username="+user.userName+"&key=" + rndPassword +"'>link<a> e impostare la nuova password."+
    "<br><br> Se non sei stato tu a richiedere una nuova password puoi ignorare questo link o segnalarlo a info@stoody.it ";

    // "Di seguito le nuove credenziali: <br><br>" +
    // "Nome Utente: " + user.userName + "<br>" +
    // "Password temporanea : " + rndPassword +
    

    let objMail: _UT_MailMessage= {
      emailAddress: mailAddress,
      testoMail: testoMail,
      titoloMail: titoloMail
    }

    this.svcMail.inviaMail(objMail).subscribe({
      next: res=> {
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "RICHIESTA DI CAMBIO PASSWORD", sottoTitolo: "E' stata inviata una email di reset password a " + mailAddress}
        });
        this.form.controls.Email.reset();
        this.form.controls.Email.setErrors(null);
      },
      error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: "Errore durante l'invio", panelClass: ['red-snackbar']}))
    });


    this.form.controls.Email.setValue('');




    //this.form.controls.Email.markAsUntouched();
    //this.form.controls.Email.markAsPristine();

  }

}
