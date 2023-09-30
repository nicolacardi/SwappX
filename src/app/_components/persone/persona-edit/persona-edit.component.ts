//#region ----- IMPORTS ------------------------

import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { PersonaFormComponent }                 from '../persona-form/persona-form.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PersoneService }                       from '../persone.service';

//models
import { PER_Persona }                          from 'src/app/_models/PER_Persone';
import { User }                                 from 'src/app/_user/Users';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { GenitoreFormComponent } from '../../genitori/genitore-form/genitore-form.component';
import { AlunnoFormComponent } from '../../alunni/alunno-form/alunno-form.component';

//#endregion

@Component({
  selector: 'app-persona-edit',
  templateUrl: './persona-edit.component.html',
  styleUrls: ['../persone.css']
})
export class PersonaEditComponent implements OnInit, AfterViewInit {

//#region ----- Variabili ----------------------
  tmpN:                                        number =0;
  currUser!:                                    User;
  persona$!:                                    Observable<PER_Persona>;
  persona!:                                     PER_Persona;


  
  form! :                                       UntypedFormGroup;

  // personaFormIsValid!:                          boolean;
  // genitoreFormIsValid!:                         boolean;
  // alunnoFormIsValid!:                           boolean;

  emptyForm :                                   boolean = false;

//#endregion

//#region ----- ViewChild Input Output ---------

@ViewChild(PersonaFormComponent) personaFormComponent!: PersonaFormComponent; 
// @ViewChild(GenitoreFormComponent) genitoreFormComponent!: GenitoreFormComponent; 
// @ViewChild(AlunnoFormComponent) alunnoFormComponent!: AlunnoFormComponent; 
//static false serve a consentire un riferimento a appalunnoform anche se non è stato caricato ancora
@ViewChild('appalunnoform', {static: false}) appalunnoform!: AlunnoFormComponent; 
@ViewChild('appgenitoreform', {static: false}) appgenitoreform!: GenitoreFormComponent; 



//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<PersonaEditComponent>,
              @Inject(MAT_DIALOG_DATA) public personaID: number,
              private fb:                       UntypedFormBuilder, 
              private svcPersone:               PersoneService,
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar,
              private _loadingService :         LoadingService  ) {

    _dialogRef.disableClose = true;

  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit (){
    console.log ("persona-edit - afterviewinit");
  }

  loadData(){ 
    if (this.personaID && this.personaID + '' != "0") {
      const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(this.personaID);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);

      this.persona$ = loadPersona$
      .pipe( 
          tap(
            persona => {
              this.personaID = persona.id
              this.persona = persona
            }
            //this.form.patchValue(persona)
          )
      );
    }
    else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save()
  {
    this.personaFormComponent.save()
    .subscribe({
      next: ()=> {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      error: ()=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    })
  }

  delete()
  {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
        dialogYesNo.afterClosed().subscribe( result => {
        if(result){
          if( this.persona._LstRoles!.length != 0) {
            let lstRolesstr = this.persona._LstRoles!.join(', ');
            this._dialog.open(DialogOkComponent, {
              width: '320px',
              data: {titolo: "ATTENZIONE!", sottoTitolo: "Questa persona non si può cancellare: <br>è "+ lstRolesstr}
            });
            return;
          }
          this.personaFormComponent.delete()
          .subscribe( {
            next: res=> { 
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }
//#endregion

//#region ----- Altri metodi -------------------

  // onResize(event: any) {
  //   this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 4;
  //   this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
  // }

  // formPersonaValidEmitted(isValid: boolean) {
  //   console.log("formPersonaValidEmitted")
  //   this.personaFormIsValid = isValid;
  // }

  // formGenitoreValidEmitted(isValid: boolean) {
  //   this.genitoreFormIsValid = isValid;
  // }

  // formAlunnoValidEmitted(isValid: boolean) {
  //   this.alunnoFormIsValid = isValid;
  // }

  // formPersonaChangedRolesEmitted () {
  //   console.log("passo di qua");
  //   //in questo modo quando si cambia il ruolo viene emesso un emit e si impostano i valori a true o false
  //   //ma se sono in edit di una persona??????questo va bene se faccio un nuovo alunno o nuovo genitore!
  //   if (this.genitoreFormComponent) this.genitoreFormIsValid = this.genitoreFormComponent.form.valid;
  //   if (this.alunnoFormComponent) this.alunnoFormIsValid = this.alunnoFormComponent.form.valid;
  // }

  // updateDisableSave () {
  //   this.tmpN++;
  //   console.log (this.tmpN, "updateDisableSave");
  // }

//#endregion
}



