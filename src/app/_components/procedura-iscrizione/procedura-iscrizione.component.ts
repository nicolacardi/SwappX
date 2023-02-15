import { Component, ContentChildren, Input, OnInit, QueryList, ViewChild, ViewChildren }                    from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { concatMap, map }                            from 'rxjs/operators';
import { Observable }                           from 'rxjs';

//components

//services


//models
import { User }                                 from 'src/app/_user/Users';
import { ActivatedRoute } from '@angular/router';
import { IscrizioniService } from '../iscrizioni/iscrizioni.service';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { ALU_GenitoreAlunno } from 'src/app/_models/ALU_GenitoreAlunno';
import { PersonaFormComponent } from '../persone/persona-form/persona-form.component';
import { MatStepper } from '@angular/material/stepper';
import { PersoneService } from '../persone/persone.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../utilities/snackbar/snackbar.component';

@Component({
  selector: 'app-procedura-iscrizione',
  templateUrl: './procedura-iscrizione.component.html',
  styleUrls: ['./procedura-iscrizione.component.css']
})
export class ProceduraIscrizioneComponent implements OnInit {

  private currUser!:                            User;

  //public obsFigli$!:                            Observable<ALU_Alunno[]>;
  public obsIscrizione$!:                       Observable<CLS_Iscrizione>;
  public genitoriArr:                           ALU_Genitore[] = [];
  public iscrizione!:                           CLS_Iscrizione;


  private form! :                               UntypedFormGroup;
  public iscrizioneID!:                         number;

  
  @ViewChildren(PersonaFormComponent) PersonaFormComponent!: QueryList<PersonaFormComponent>;

  @ViewChild('stepper') stepper!:               MatStepper;


  constructor(
    private fb:                                 UntypedFormBuilder,
    private svcIscrizioni:                      IscrizioniService,
    private svcPersone:                         PersoneService,
    private actRoute:                           ActivatedRoute,
    private _snackBar:                          MatSnackBar


  ) { 



    this.form = this.fb.group({
      id:                         [null],
      
      tipoPersonaID:              [''],
      ckAttivo:                   [true],

      nome:                       [''],
      cognome:                    [''],
      dtNascita:                  [''],
      comuneNascita:              [''],
      provNascita:                [''],
      nazioneNascita:             [''],
      indirizzo:                  [''],
      comune:                     [''],
      prov:                       [''],
      cap:                        [''],
      nazione:                    [''],
      genere:                     [''],
      cf:                         [''],
      telefono:                   [''],
      email:                      [''],

      //ckAttivo:                   [true]
    });



  }

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

    console.log("QUI")
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

  salvaPersona(n: number){
    //console.log(this.stepper.selectedIndex);
    this.form.controls.tipoPersonaID.setValue(n);
    let PersonaFormComponentArray = this.PersonaFormComponent.toArray();
    //console.log ("form del child", PersonaFormComponentArray[this.stepper.selectedIndex-1].form.value);
    this.form.patchValue(PersonaFormComponentArray[this.stepper.selectedIndex-1].form.value);
    //console.log("sto per salvare", this.form.value);
    this.svcPersone.put(this.form.value).subscribe(
      res=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']}),

      err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
  );



  }

  formValidEmitted(valid: boolean){
    console.log("ciao", valid);
  }


}
