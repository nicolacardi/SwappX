//#region ----- IMPORTS ------------------------

import { Component, ContentChildren, Input, OnInit, QueryList, ViewChild, ViewChildren }                    from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { Observable, firstValueFrom }                           from 'rxjs';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatStepper }                           from '@angular/material/stepper';
import { ActivatedRoute }                       from '@angular/router';

//components
import { SnackbarComponent }                    from '../utilities/snackbar/snackbar.component';
import { PersonaFormComponent }                 from '../persone/persona-form/persona-form.component';

//services
import { PersoneService }                       from '../persone/persone.service';
import { IscrizioniService }                    from '../iscrizioni/iscrizioni.service';
import { IscrizioneConsensiService }            from './iscrizione-consensi/iscrizione-consensi.service';

//models
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { ALU_GenitoreAlunno }                   from 'src/app/_models/ALU_GenitoreAlunno';
import { IscrizioneConsensiComponent }          from './iscrizione-consensi/iscrizione-consensi.component';
import { CLS_IscrizioneConsenso } from 'src/app/_models/CLS_IscrizioneConsenso';

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
  @ViewChild('formIscrizioneConsensi') ConsensiFormComponent!: IscrizioneConsensiComponent;

  @ViewChild('stepper') stepper!:               MatStepper;
//#endregion

//#region ----- Constructor --------------------

  constructor(private fb:                       UntypedFormBuilder,
              private svcIscrizioni:            IscrizioniService,
              private svcIscrizioneConsensi:    IscrizioneConsensiService,

              private svcPersone:               PersoneService,
              private actRoute:                 ActivatedRoute,
              private _snackBar:                MatSnackBar ) { 

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

  async salvaConsensi() {

    await firstValueFrom(this.svcIscrizioneConsensi.deleteByIscrizione(this.iscrizioneID));
    let formValues = this.ConsensiFormComponent.formConsensi.value;

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

    let iscrizioneConsensiForm : CLS_IscrizioneConsenso;

    for (const key in formValues) {
      if (formValues.hasOwnProperty(key)) {
        const value = formValues[key];
        const consensoId = parseInt(key);
        const risposta1 = value === true || parseInt(value) === 1 ? true : false;
        const risposta2 = parseInt(value) === 2 ? true : false;
        const risposta3 = parseInt(value) === 3 ? true : false;
        const risposta4 = parseInt(value) === 4 ? true : false;
        const risposta5 = parseInt(value) === 5 ? true : false;
    
        iscrizioneConsensiForm = {
          iscrizioneID: this.iscrizioneID,
          consensoID: consensoId,
          risposta1: risposta1,
          risposta2: risposta2,
          risposta3: risposta3,
          risposta4: risposta4,
          risposta5: risposta5,
        };
    
        this.svcIscrizioneConsensi.post(iscrizioneConsensiForm).subscribe(
          {
            next: res=> {console.log ("inserita domanda", consensoId)},
            error: err=> {console.log ("errore nell'nserimento", consensoId)}
          }
        )

      }
    }

  }

  formValidEmitted(valid: boolean){
   // console.log("ciao", valid);
  }
//#endregion

}
