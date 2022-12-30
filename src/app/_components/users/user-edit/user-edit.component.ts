import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { FormCustomValidatorsArray} from '../../utilities/requireMatch/requireMatch';

//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { UserService } from 'src/app/_user/user.service';
//import { RuoliService } from 'src/app/_user/ruoli.service';
import { TipiPersonaService } from 'src/app/_components/persone/tipi-persona.service';

import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import {  User } from 'src/app/_user/Users';
import { PER_Persona, PER_TipoPersona } from 'src/app/_models/PER_Persone';
import { PersoneService } from '../../persone/persone.service';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { PersonaEditComponent } from '../../persone/persona-edit/persona-edit.component';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['../users.css']
})

export class UserEditComponent implements OnInit {

  subscription!: Subscription;

  user$!:                     Observable<User>;
  //obsRuoli$!:               Observable<Ruolo[]>;
  obsTipiPersona$!:           Observable<PER_TipoPersona[]>;

  filteredPersone$!:          Observable<PER_Persona[]>;
  filteredPersoneArray!:      PER_Persona[];

  persona$!:                  Observable<PER_Persona>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;

  previousMatSelect! :        number;
  //currUserRuolo!:             number;

  currUserID!:                string;       //ID dell'utente loggato
  userID!:                    string;       //ID dell'utente che si sta editando

  @ViewChild(MatAutocompleteTrigger) trigger!: MatAutocompleteTrigger; //non sembra "agganciarsi" al matautocompleteTrigger
  @ViewChild(MatAutocomplete) MatAutoComplete!: MatAutocomplete;

  constructor( @Inject(MAT_DIALOG_DATA) 
               public idUser: string,
               public _dialogRef: MatDialogRef<UserEditComponent>,
               private svcUser:                            UserService,
               //private svcRuoli:                         RuoliService,
               private svcTipiPersona:                     TipiPersonaService,
               private svcPersone:                         PersoneService,
               public _dialog:                             MatDialog,
               private _snackBar:                          MatSnackBar,
               private _loadingService :                   LoadingService,
               private fb:                                 FormBuilder ) { 

    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      userName:         [''],
      email:            ['', Validators.email],
      password:         ['', [Validators.minLength(4), Validators.maxLength(19)]],

      nomeCognomePersona: [null],
      //punto di partenza: https://onthecode.co.uk/blog/force-selection-angular-material-autocomplete/

      //qui usando un customFormValidator
      //https://stackoverflow.com/questions/51871720/angular-material-how-to-validate-autocomplete-against-suggested-options
      //che funziona se gli si passa un array!, funzioa benissimo, ma in questo caso l'array arriva da un observable e lo conosco "più tardi"...quindi?
      //Ho chiesto su stackoverflow e attendo risposta
      //nomeCognomePersona: [null, [FormCustomValidators.valueSelected(this.myArray)]],
      //nomeCognomePersona: [],
      personaID:        [null]
    });
  }

//#region ----- LifeCycle Hooks e simili-------

/* AS ???
  private myObjectExists(value: any): boolean {
    return this.filteredPersoneArray.some(v => v === value);
  }
  */

  ngOnInit() {

    //console.log ("ngOnInit");
    this.svcPersone.list().subscribe(persone => {
      this.form.controls['nomeCognomePersona'].setValidators(
        [FormCustomValidatorsArray.valueSelected(persone)]
      );
    })

    this.filteredPersone$ = this.form.controls['nomeCognomePersona'].valueChanges
      .pipe(
        debounceTime(300),
        switchMap(() => this.svcPersone.filterPersone(this.form.value.nomeCognomePersona)),
      );

    this.svcUser.obscurrentUser.subscribe( val => {
        this.currUserID = val.userID;
    });

    //this.obsRuoli$ = this.svcRuoli.list();
    this.obsTipiPersona$ = this.svcTipiPersona.list();    

    this.loadData();
  }

  loadData() {

    if (this.idUser && this.idUser + '' != "0") {
      const obsUser$: Observable<User> = this.svcUser.get(this.idUser);
      const loadUser$ = this._loadingService.showLoaderUntilCompleted(obsUser$);
      
      this.user$ = loadUser$.pipe(
        tap(utente => {
          console.log(utente);

          this.form.patchValue(utente);
          this.form.controls['nomeCognomePersona'].setValue(utente.persona!.nome + " " + utente.persona!.cognome);

          this.userID = utente.id;       
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
    dialogYesNo.afterClosed().subscribe(
      result => {
        if(result){
          this.svcUser.delete(this.idUser).subscribe(
            res => {
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['green-snackbar']});
              this._dialogRef.close();
            },
            err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          );
        }
    });
  }

   save() {
    //NC: ho aggiunto il campo personaID e non salva...bisogna aggiustare anche il service per accettarlo
    //AS: e il tipo Persona ?

    let formData = {
      userID:     this.idUser,   
      UserName:   this.form.controls.userName.value,
      Email:      this.form.controls.email.value,
      PersonaID:  this.form.controls.personaID.value,  //NC 25.12.22
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
      this.svcUser.post(this.form.value).subscribe(
        res=> this._dialogRef.close(),
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio POST', panelClass: ['red-snackbar']})  
      );
    } else {
      this.svcUser.put(formData).subscribe( 
        res => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Profilo utente salvato', panelClass: ['green-snackbar']}),
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvaggio PUT', panelClass: ['red-snackbar']})
      );
    }

    if(formData.userID != "0" && this.form.controls.password.dirty && this.form.controls.password.value != "" ){
      
      this.svcUser.ResetPassword(this.idUser, this.form.controls.password.value).subscribe( 
        res => {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
          this._dialogRef.close();
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel cambio password', panelClass: ['red-snackbar']})
      );
    }
  }

  //questa routine non dovrebbe più servire
  ruoloChange() {
    
    //AS: ATTENZIONE: verificare se serve
    /*
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
    */
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

  selected(event: MatAutocompleteSelectedEvent): void {

    //come approccio alternativo all'uso di un customformvalidator vorrei fare come in 
    //https://stackblitz.com/edit/mat-autocomplete-force-selection-of-option?file=src%2Fapp%2Fautocomplete-auto-active-first-option-example.ts 
    //sembra infatti molto più "diretto" e "semplice" MA....come lo propone lui su ngAfterViewInit ...NON FUNZIONA CASSO! quindi lo metto qui che non è il massimo

    //***NC 25.12.22 ***/
    this.form.controls.personaID.setValue(event.option.id);
    //vado a pescare la mail della persona selezionata
    const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(event.option.id);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);
      this.persona$ = loadPersona$
      .pipe( 
          tap(
            persona => {this.form.controls.email.setValue(persona.email);}
          )
      );
      this.persona$.subscribe();

    //***NC 25.12.22 ***/

    //in alternativa apro il form persona....

    //this.data.alunnoID = parseInt(event.option.id);
    //this.formRetta.controls['alunnoID'].setValue(parseInt(event.option.id));
    //this.loadData();

    // const dialogConfig : MatDialogConfig = {
    //   panelClass: 'add-DetailDialog',
    //   width: '850px',
    //   height: '600px',
    //   data: event.option.id
    // };

    // const dialogRef = this._dialog.open(PersonaEditComponent, dialogConfig);
    // dialogRef.afterClosed().subscribe( result => {
    //   this.form.controls['email'].setValue(result.email);
    //   console.log (result);
    //   //this.loadData()
    // });
    
  }

  addPersona() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '600px',
      data: 0
    };

    const dialogRef = this._dialog.open(PersonaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }
  
}

