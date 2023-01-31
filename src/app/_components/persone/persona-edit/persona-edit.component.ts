import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

//components
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { PersoneService } from '../persone.service';
import { TipiPersonaService } from '../tipi-persona.service';

//models
import { PER_Persona, PER_TipoPersona } from 'src/app/_models/PER_Persone';
import { PersonaFormComponent } from '../persona-form/persona-form.component';
import { User } from 'src/app/_user/Users';


@Component({
  selector: 'app-persona-edit',
  templateUrl: './persona-edit.component.html',
  styleUrls: ['../persone.css']
})
export class PersonaEditComponent implements OnInit {

//#region ----- Variabili -------
  persona$!:                                    Observable<PER_Persona>;
  obsTipiPersona$!:                             Observable<PER_TipoPersona[]>;
  currPersona!:                                 User;

  form! :                                       FormGroup;
  isValid!:                                     boolean;
  emptyForm :                                   boolean = false;
  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;
  breakpoint!:                                  number;
  breakpoint2!:                                 number;
//#endregion

//#region ----- ViewChild Input Output -------

  @ViewChild(PersonaFormComponent) personaFormComponent!: PersonaFormComponent; 

//#endregion

  constructor(
    
    public _dialogRef: MatDialogRef<PersonaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public personaID: number,
    private fb:                           FormBuilder, 
    private svcPersone:                   PersoneService,
    private svcTipiPersona:               TipiPersonaService,
    //private svcComuni:                    ComuniService,
    public _dialog:                       MatDialog,
    private _snackBar:                    MatSnackBar,
    private _loadingService :             LoadingService  ) {

    _dialogRef.disableClose = true;
    //let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";

    // this.form = this.fb.group({
    //   id:                         [null],
    //   tipoPersonaID:              ['', Validators.required],

    //   nome:                       [''],
    //   cognome:                    [''],
    //   dtNascita:                  [''],
    //   comuneNascita:              [''],
    //   provNascita:                [''],
    //   nazioneNascita:             [''],
    //   indirizzo:                  [''],
    //   comune:                     [''],
    //   prov:                       [''],
    //   cap:                        [''],
    //   nazione:                    [''],
    //   genere:                     [''],
    //   cf:                         [''],
    //   telefono:                   [''],
    //   email:                      [''],

    //   ckAttivo:                   [true]
    // });
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    //this.currPersona = Utility.getCurrentUser();
    //this.obsTipiPersona$ = this.svcTipiPersona.listByLivello(this.currPersona.TipoPersona!.livello);
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    if (this.personaID && this.personaID + '' != "0") {

      const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(this.personaID);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);

      this.persona$ = loadPersona$
      .pipe( 
          tap(
            persona => this.personaID = persona.id
            //this.form.patchValue(persona)
          )
      );
    }
    else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD -------

  save()
  {
    this.personaFormComponent.save()
    .subscribe(
      res=> {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    )
  
  }

  delete()
  {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
              dialogYesNo.afterClosed().subscribe( result => {
        if(result){

          this.personaFormComponent.delete()
          .subscribe(  
            res=> { 
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          );
        }
    });
  }
//#endregion

//#region ----- Altri metodi -------

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 4;
    this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
  }

  formValidEmitted(isValid: boolean) {
    this.isValid = isValid;
  }

//#endregion
}



