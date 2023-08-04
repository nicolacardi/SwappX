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
import { User }                                 from 'src/app/_user/Users';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { ALU_GenitoreAlunno }                   from 'src/app/_models/ALU_GenitoreAlunno';

//#endregion
@Component({
  selector: 'app-procedura-iscrizione',
  templateUrl: './procedura-iscrizione.component.html',
  styleUrls: ['./procedura-iscrizione.component.css']
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

    
    this.svcIscrizioni.get(this.iscrizioneID)
    .subscribe(res => {
      this.iscrizione = res;
      //console.log(res.alunno._Genitori!.length);
      res.alunno._Genitori!.forEach(
        (genitorealunno: ALU_GenitoreAlunno) =>{
        console.log ("g", genitorealunno);
        this.genitoriArr.push(genitorealunno.genitore!);
        console.log ("pushed");
        }
        
      )
      console.log ("genitoriArr", this.genitoriArr);
    }

    )
    ;
  }
//#endregion

//#region ----- Altri metodi -------------------

  salvaPersona(n: number){
    //console.log(this.stepper.selectedIndex);
    this.form.controls.tipoPersonaID.setValue(n);
    let PersonaFormComponentArray = this.PersonaFormComponent.toArray();
    //console.log ("form del child", PersonaFormComponentArray[this.stepper.selectedIndex-1].form.value);
    this.form.patchValue(PersonaFormComponentArray[this.stepper.selectedIndex-1].form.value);
    //console.log("sto per salvare", this.form.value);
    this.svcPersone.put(this.form.value).subscribe({
      next: res=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']}),
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    });
  }

  formValidEmitted(valid: boolean){
    console.log("ciao", valid);
  }
//#endregion

}
