import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { debounceTime, pairwise, startWith, switchMap, tap } from 'rxjs/operators';
import {FormCustomValidators, RequireMatch} from '../../utilities/requireMatch/requireMatch';
//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { RuoliService } from 'src/app/_user/ruoli.service';
import { UserService } from 'src/app/_user/user.service';
import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import { Ruolo, User } from 'src/app/_user/Users';
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { PersoneService } from '../../persone/persone.service';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { PersonaEditComponent } from '../../persone/persona-edit/persona-edit.component';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['../users.css']
})

export class UserEditComponent implements OnInit, AfterViewInit {

  user$!:                     Observable<User>;
  obsRuoli$!:                 Observable<Ruolo[]>;

  filteredPersone$!:           Observable<PER_Persona[]>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;

  previousMatSelect! :        number;
  currUserRuolo!:             number;
  currUserID!:                string;       //ID dell'utente loggato
  userID!:                    string;       //ID dell'utente che si sta editando

  @ViewChild(MatAutocompleteTrigger) trigger!: MatAutocompleteTrigger; //non sembra "agganciarsi" al matautocompleteTrigger
  @ViewChild(MatAutocomplete) MatAutoComplete!: MatAutocomplete;

  //myArray = ["Andrea Svegliado", "Nicola Cardi"];
  
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public idUser: string,
    public _dialogRef:                          MatDialogRef<UserEditComponent>,
  
    private svcUser:                            UserService,
    private svcRuoli:                           RuoliService,
    private svcPersone:                         PersoneService,


    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    private _loadingService :                   LoadingService,
    private fb:                                 FormBuilder ) { 

    _dialogRef.disableClose = true;

    
    this.form = this.fb.group({
      userName:         [''],
      //fullName:         [''],
      email:            ['', Validators.email],
      //badge:            [''],
      password:         ['', [Validators.minLength(4), Validators.maxLength(19)]],
      //ruoloID:          [''],

      //nomeCognomePersona: [null, [RequireMatch]],


      //punto di partenza: https://onthecode.co.uk/blog/force-selection-angular-material-autocomplete/

      
      //qui usando un customFormValidator
      //https://stackoverflow.com/questions/51871720/angular-material-how-to-validate-autocomplete-against-suggested-options
      //che funziona se gli si passa un array!, funzioa benissimo, ma in questo caso l'array arriva da un observable e lo conosco "più tardi"...quindi?
      //Ho chiesto su stackoverflow e attendo risposta
      //nomeCognomePersona: [null, [FormCustomValidators.valueSelected(this.myArray)]],
      nomeCognomePersona: []
    });
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {




    this.filteredPersone$ = this.form.controls['nomeCognomePersona'].valueChanges
    .pipe(
      debounceTime(300),
      switchMap(() => this.svcPersone.filterPersone(this.form.value.nomeCognomePersona))
    )

    this.svcUser.obscurrentUser.subscribe(
      val => {
        //this.currUserRuolo = val.ruoloID;
        this.currUserID = val.userID;
    })

    this.loadData();

    //salvo in una proprietà (previousMatSelect) il valore PRECEDENTE nella combo
    // this.form.controls.ruoloID.valueChanges.pipe(
    //   startWith(this.form.controls.ruoloID.value),
    //   pairwise()
    // ).subscribe(
    //   ([old,value])=> this.previousMatSelect = old
    // );
  }
 

  ngAfterViewInit() {
    //come approccio alternativo all'uso fi un customformvalidator vorrei fare come in 
    //https://stackblitz.com/edit/mat-autocomplete-force-selection-of-option?file=src%2Fapp%2Fautocomplete-auto-active-first-option-example.ts 
    //sembra infatti molto più "diretto" e "semplice" MA....
    //this.MatAutoComplete.closed.subscribe(val=>{console.log ("chiuso")});
    this.trigger.panelClosingActions.subscribe(e => {  //...NON FUNZIONA QUESTO, CASSO!
      //ERROR TypeError: Cannot read properties of undefined (reading 'panelClosingActions') è come se trigger non lo vedesse "ancora", come se fosse un tema di caricamento
      //ma cos'è MatAutoCompleteTrigger? qui lo spiega https://stackoverflow.com/questions/50030381/angular-material-autocomplete-matautocompletetrigger
      if (!(e && e.source)) {
        this.form.value.nomeCognomePersona.setValue('');
        this.trigger.closePanel();
      }
    });
  }




  loadData() {
    this.obsRuoli$ = this.svcRuoli.list();
    //this.form.controls['ruoloID'].setValue(this.user$);

    if (this.idUser && this.idUser + '' != "0") {
      const obsUser$: Observable<User> = this.svcUser.get(this.idUser);
      const loadUser$ = this._loadingService.showLoaderUntilCompleted(obsUser$);
      
      this.user$ = loadUser$.pipe(
        tap(utente => {
          this.form.patchValue(utente);
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
          this.svcUser.delete(this.idUser).subscribe(()=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['green-snackbar']});
              this._dialogRef.close();
            },
            err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          );
        }
    });
  }

   save() {

    let formData = {
      userID:     this.idUser,   
      UserName:   this.form.controls.userName.value,
      Email:      this.form.controls.email.value,
      //FullName:   this.form.controls.fullName.value,
      //Badge:      this.form.controls.badge.value,
      //RuoloID:    this.form.controls.ruoloID.value,
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
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})  
      );
    } else {
      this.svcUser.put(formData).subscribe( 
        res => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Profilo utente salvato', panelClass: ['green-snackbar']}),
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvaggio', panelClass: ['red-snackbar']})
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

  ruoloChange() {
    //questa routine non dovrebbe più servire
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


  selected(event: MatAutocompleteSelectedEvent): void {
    //evento triggered su selezione di una voce tra quelle proposte
    console.log ("selected", event.option.id);
    //this.data.alunnoID = parseInt(event.option.id);
    //this.formRetta.controls['alunnoID'].setValue(parseInt(event.option.id));
    //this.loadData();

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '600px',
      data: event.option.id
    };

    const dialogRef = this._dialog.open(PersonaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( result => {
      this.form.controls['email'].setValue(result.email);
      console.log (result);
      //this.loadData()
    });
    
  }

  

}

