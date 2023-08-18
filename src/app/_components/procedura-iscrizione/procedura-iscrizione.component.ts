//#region ----- IMPORTS ------------------------

import { Component, ContentChildren, Input, OnInit, QueryList, ViewChild, ViewChildren }                    from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { Observable }                           from 'rxjs';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatStepper }                           from '@angular/material/stepper';
import { ActivatedRoute }                       from '@angular/router';

//components
import { SnackbarComponent }                    from '../utilities/snackbar/snackbar.component';
import { PersonaFormComponent }                 from '../persone/persona-form/persona-form.component';

//services
import { PersoneService }                       from '../persone/persone.service';
import { IscrizioniService }                    from '../iscrizioni/iscrizioni.service';

//models
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { ALU_GenitoreAlunno }                   from 'src/app/_models/ALU_GenitoreAlunno';
import { ConsensiIscrizioneComponent } from './consensi-iscrizione/consensi-iscrizione.component';
import { dA } from '@fullcalendar/core/internal-common';

//#endregion
@Component({
  selector: 'app-procedura-iscrizione',
  templateUrl: './procedura-iscrizione.component.html',
  styleUrls: ['./procedura-iscrizione.css']
})

export class ProceduraIscrizioneComponent implements OnInit {

//#region ----- Variabili ----------------------

  public obsIscrizione$!:                       Observable<CLS_Iscrizione>;
  public genitoriArr:                           ALU_Genitore[] = [];
  public iscrizione!:                           CLS_Iscrizione;
  private form! :                               UntypedFormGroup;
  public iscrizioneID!:                         number;

//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChildren(PersonaFormComponent) PersonaFormComponent!: QueryList<PersonaFormComponent>;
  @ViewChild('formConsensiIscrizione') ConsensiFormComponent!: ConsensiIscrizioneComponent;

  @ViewChild('stepper') stepper!:               MatStepper;
//#endregion

//#region ----- Constructor --------------------

  constructor(private fb:                                 UntypedFormBuilder,
              private svcIscrizioni:                      IscrizioniService,
              private svcPersone:                         PersoneService,
              private actRoute:                           ActivatedRoute,
              private _snackBar:                          MatSnackBar ) { 

    this.form = this.fb.group({
      id:                         [null],
      //tipoPersonaID:              [''],
      ckAttivo:                   [true],
    });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    //estraggo lo user
    // this.currUser = Utility.getCurrentUser();

    //verifico se è un genitore  //TODO va inserito campo ckGenitore
    // if (this.currUser.TipoPersona.ckGenitore) {
    //   this.genitoreBool = true;
    // }
    // this.genitoreBool = true; //per ora lo imposto fisso

    //se è un genitore vado a caricarne i figli
    //ma mi serve il genitoreID e non personaID

    // this.obsFigli$ = this.svcGenitori.getByPersona(this.currUser.personaID)
    // .pipe(
    //   //in base al genitoreID estraggo tutti i figli
    //   concatMap(genitore => this.svcAlunni.listByGenitore(genitore.id))
    // );

    this.actRoute.queryParams.subscribe(
      params => {
        this.iscrizioneID = params['iscrizioneID'];     
    });

    this.loadData()
  }

  loadData() {
    //ottengo dall'iscrizione tutti i dati: dell'alunno e dei genitori

    this.svcIscrizioni.get(this.iscrizioneID).subscribe(
      res => { this.iscrizione = res;
        res.alunno._Genitori!.forEach(
          (genitorealunno: ALU_GenitoreAlunno) =>{
            this.genitoriArr.push(genitorealunno.genitore!);
          }
      )
    });
  }
//#endregion

//#region ----- Altri metodi -------------------

  salvaPersona(n: number){
   
    this.form.controls.tipoPersonaID.setValue(n);
    let PersonaFormComponentArray = this.PersonaFormComponent.toArray();
   
    this.form.patchValue(PersonaFormComponentArray[this.stepper.selectedIndex-1].form.value);
    this.svcPersone.put(this.form.value).subscribe({
      next: res=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']}),
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    });

  }

  salvaConsensi() {
    let formValues = this.ConsensiFormComponent.formConsensi.value;
    console.log (formValues);
    //devo trasformare questo ogetto in un altro
    //ad esempio da
    // const formValues = {
    //   3: true,
    //   8: '3',
    //   11: true,
    //   13: true,
    //   14: 2,
    //   15: true,
    //   16: 3,
    //   17: 4,
    //   18: 5
    // }; 
    //deve diventare

    // consensoID risposta1 risposta2 risposta3 risposta4 risposta5
    // 3 true false false false false
    // 8 false false true false false
    // 11 true false false false false
    // 13 true false false false false
    // 14 false true false false false
    // 15 true false false false false
    // 16 false false true false false

    const transformedData = [];

    for (const key in formValues) {
      if (formValues.hasOwnProperty(key)) {
        const value = formValues[key];
        const consensoId = parseInt(key);
        const risposta1 = value === true || parseInt(value) === 1 ? true : false;
        const risposta2 = parseInt(value) === 2 ? true : false;
        const risposta3 = parseInt(value) === 3 ? true : false;
        const risposta4 = parseInt(value) === 4 ? true : false;
        const risposta5 = parseInt(value) === 5 ? true : false;
    
        const transformedEntry = {
          ConsensoID: consensoId,
          Risposta1: risposta1,
          Risposta2: risposta2,
          Risposta3: risposta3,
          Risposta4: risposta4,
          Risposta5: risposta5,
        };
    
        transformedData.push(transformedEntry);
      }
    }
    console.log (transformedData);

    //vanno aggiunti gli altri campi di CLS_ConsensoIscrizione, tra cui iscrizioneID

    
    //ora devo salvarlo, va fatto un service consensiiscrizione
    //cancello quel che c'è prima
    //await firstValueFrom(this.svcConsensiIscrizione.deleteByIscrizione(this.iscrizioneID));
    // this.svcConsensiIscrizione.post(transformedData).subscribe({
    //   next: res=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Consensi salvati', panelClass: ['green-snackbar']}),
    //   error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio consensi', panelClass: ['red-snackbar']})
    // });

  }

  formValidEmitted(valid: boolean){
   // console.log("ciao", valid);
  }
//#endregion

}
