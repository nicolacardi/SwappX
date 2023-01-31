import { Component, Input, OnInit }             from '@angular/core';
import { FormBuilder, FormGroup, Validators }   from '@angular/forms';
import { MatDialog, MatDialogRef }              from '@angular/material/dialog';
import { Observable }                           from 'rxjs';
import { debounceTime, switchMap, tap }         from 'rxjs/operators';

//components
import { Utility }                              from '../../utilities/utility.component';

//services
import { ComuniService }                        from 'src/app/_services/comuni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PersoneService }                       from '../persone.service';

//models
import { PER_Persona, PER_TipoPersona }         from 'src/app/_models/PER_Persone';
import { _UT_Comuni }                           from 'src/app/_models/_UT_Comuni';
import { TipiPersonaService }                   from '../tipi-persona.service';
import { User }                                 from 'src/app/_user/Users';

@Component({
  selector: 'app-persona-form',
  templateUrl: './persona-form.component.html',
  styleUrls: ['../persone.css']
})
export class PersonaFormComponent implements OnInit {

//#region ----- Variabili -------

  persona$!:                                    Observable<PER_Persona>;
  obsTipiPersona$!:                             Observable<PER_TipoPersona[]>;
  currPersona!:                                 User;


  public form! :                                FormGroup;
  emptyForm :                                   boolean = false;
  filteredComuni$!:                             Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:                      Observable<_UT_Comuni[]>;
  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;
  breakpoint!:                                  number;
  breakpoint2!:                                 number;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() personaID!:                          number;
  @Input() tipoPersonaID!:                      number;

//#endregion

  constructor(public _dialogRef:                          MatDialogRef<PersonaFormComponent>,
              public _dialog:                             MatDialog,
              private fb:                                 FormBuilder, 
              private svcPersone:                         PersoneService,
              private svcTipiPersona:                     TipiPersonaService,
              private svcComuni:                          ComuniService,
              private _loadingService :                   LoadingService  ) { 

    let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";

    this.form = this.fb.group({
      id:                         [null],
      tipoPersonaID:              ['', Validators.required],
      nome:                       ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      cognome:                    ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      dtNascita:                  ['', Validators.required],
      comuneNascita:              ['', Validators.maxLength(50)],
      provNascita:                ['', Validators.maxLength(2)] ,
      nazioneNascita:             ['', Validators.maxLength(3)],
      indirizzo:                  ['', Validators.maxLength(255)],
      comune:                     ['', Validators.maxLength(50)],
      prov:                       ['', Validators.maxLength(2)],
      cap:                        ['', Validators.maxLength(5)],
      nazione:                    ['', Validators.maxLength(3)],
      genere:                     ['',{ validators:[Validators.maxLength(1), Validators.required, Validators.pattern("M|F")]}],
      cf:                         ['',{ validators:[Validators.maxLength(16), Validators.pattern(regCF)]}],
      telefono:                   ['', Validators.maxLength(13)],
      email:                      ['',Validators.email],
      ckAttivo:                   [true]
    });

    this.currPersona = Utility.getCurrentUser();
    this.obsTipiPersona$ = this.svcTipiPersona.listByLivello(this.currPersona.TipoPersona!.livello);
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    if (this.tipoPersonaID) this.form.controls.tipoPersonaID.setValue(this.tipoPersonaID);

    if (this.personaID && this.personaID + '' != "0") {
      const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(this.personaID);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);

      this.persona$ = loadPersona$
      .pipe( 
          tap(
            persona => this.form.patchValue(persona)
          )
      );
    }
    else 
      this.emptyForm = true

      //********************* FILTRO COMUNE *******************
    this.filteredComuni$ = this.form.controls.comune.valueChanges
      .pipe( 
        tap(),
        debounceTime(300),
        tap(() => this.comuniIsLoading = true),
        switchMap(() => this.svcComuni.filterList(this.form.value.comune)),
        tap(() => this.comuniIsLoading = false)
      )

    //********************* FILTRO COMUNE NASCITA ***********
    this.filteredComuniNascita$ = this.form.controls.comuneNascita.valueChanges
      .pipe( 
        tap(),
        debounceTime(300),
        tap(() => this.comuniNascitaIsLoading = true),
        switchMap(() => this.svcComuni.filterList(this.form.value.comuneNascita)),
        tap(() => this.comuniNascitaIsLoading = false)
      )
  }

  save(): number {

    console.log("persona-forma - save");

    if (this.personaID == null) {
      this.svcPersone.post(this.form.value).subscribe(
        res => {
          this.personaID = res.id;
          console.log("salvato Form Persona - post", res.id)
          return this.personaID;
        },
        err => {
           console.log("errore in salvataggio Form Persona - post")
           return this.personaID;
          }
      ) 
    }
    else {
      this.svcPersone.put(this.form.value).subscribe(
        res => console.log("salvato Form Persona - put"),
        err => console.log("errore in salvataggio Form Persona - put")
      ) 
      return this.personaID;
    }
  }

  delete() {

    if (this.personaID == null) {
      this.svcPersone.delete(this.personaID).subscribe(
        res => console.log("Cancellato ID = " , this.personaID),
        err => console.log("errore in cancellazione  - delete ID=", this.personaID)
      );
    }
  }

//#endregion


//#region ----- Altri metodi -------

  popolaProv(prov: string, cap: string) {
    this.form.controls['prov'].setValue(prov);
    this.form.controls['cap'].setValue(cap);
    this.form.controls['nazione'].setValue('ITA');
  }

  popolaProvNascita(prov: string) {
    this.form.controls['provNascita'].setValue(prov);
    this.form.controls['nazioneNascita'].setValue('ITA');
  }

//#endregion


}
