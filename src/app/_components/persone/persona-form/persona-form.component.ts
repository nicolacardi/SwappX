//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output }     from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { Observable, firstValueFrom, of }                       from 'rxjs';
import { concatMap, tap }                                  from 'rxjs/operators';

//components
import { FormatoData, Utility }                 from '../../utilities/utility.component';

//services
import { ComuniService }                        from 'src/app/_services/comuni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PersoneService }                       from '../persone.service';

//models
import { PER_Persona, PER_TipoPersona }         from 'src/app/_models/PER_Persone';
import { _UT_Comuni }                           from 'src/app/_models/_UT_Comuni';
import { TipiPersonaService }                   from '../tipi-persona.service';
import { User }                                 from 'src/app/_user/Users';
import { AlunniService } from '../../alunni/alunni.service';
import { GenitoriService } from '../../genitori/genitori.service';
import { DocentiService } from '../../docenti/docenti.service';
import { NonDocentiService } from '../nondocenti.service';
import { ITManagersService } from '../ITmanagers.service';
import { DirigentiService } from '../dirigenti.service';
import { PER_Docente } from 'src/app/_models/PER_Docente';
import { DocentiCoordService } from '../docenticoord.service';

//#endregion
@Component({
  selector: 'app-persona-form',
  templateUrl: './persona-form.component.html',
  styleUrls: ['../persone.css']
})
export class PersonaFormComponent implements OnInit {

//#region ----- Variabili ----------------------

  persona$!:                                    Observable<PER_Persona>;
  obsTipiPersona$!:                             Observable<PER_TipoPersona[]>;
  currPersona!:                                 User;

  public form! :                                UntypedFormGroup;
  emptyForm :                                   boolean = false;
  comuniArr!:                                   _UT_Comuni[];
  filteredComuniArr!:                           _UT_Comuni[];
  filteredComuniNascitaArr!:                    _UT_Comuni[];

  filteredComuni$!:                             Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:                      Observable<_UT_Comuni[]>;
  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;
  breakpoint!:                                  number;
  breakpoint2!:                                 number;

  _lstRoles!:                                   string[];
  lstTipiPersona!:                              PER_TipoPersona[];
  selectedTipi:                                 number[] = []

//#endregion

//#region ----- ViewChild Input Output -------
  @Input() personaID!:                          number;
  @Input() tipoPersonaID!:                      number;
  @Input() dove!:                               string;

  @Output('formValid') formValid = new EventEmitter<boolean>();
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialog:                   MatDialog,
              private fb:                       UntypedFormBuilder, 
              private svcPersone:               PersoneService,

              //vari service per le post o delete dei vari tipi di persona
              private svcAlunni:                AlunniService,
              private svcGenitori:              GenitoriService,
              private svcDocenti:               DocentiService,
              private svcDocentiCoord:          DocentiCoordService,

              private svcNonDocenti:            NonDocentiService,
              private svcITManagers:            ITManagersService,
              private svcDirigenti:             DirigentiService,

              private svcTipiPersona:           TipiPersonaService,
              private svcComuni:                ComuniService,
              private _loadingService :         LoadingService  ) { 

    let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";

    this.form = this.fb.group({
      id:                                       [null],
      tipoPersonaID:                            ['', Validators.required],
      _lstRoles:                                [''],

      nome:                                     ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      cognome:                                  ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      dtNascita:                                ['', Validators.required],
      comuneNascita:                            ['', Validators.maxLength(50)],
      provNascita:                              ['', Validators.maxLength(2)] ,
      nazioneNascita:                           ['', Validators.maxLength(3)],
      indirizzo:                                ['', Validators.maxLength(255)],
      comune:                                   ['', Validators.maxLength(50)],
      prov:                                     ['', Validators.maxLength(2)],
      cap:                                      ['', Validators.maxLength(5)],
      nazione:                                  ['', Validators.maxLength(3)],
      genere:                                   ['',{ validators:[Validators.maxLength(1), Validators.required, Validators.pattern("M|F")]}],
      cf:                                       ['',{ validators:[Validators.maxLength(16), Validators.pattern(regCF)]}],
      telefono:                                 ['', Validators.maxLength(13)],
      email:                                    ['',Validators.email],
      ckAttivo:                                 [true]
    });

    this.currPersona = Utility.getCurrentUser();
    this.obsTipiPersona$ = this.svcTipiPersona.listByLivello(this.currPersona.persona!.tipoPersona!.livello);

  }
  
//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){




    this.loadData();
    this.svcComuni.list().subscribe( res => this.comuniArr = res);
    this.form.valueChanges.subscribe(
      res=> this.formValid.emit(this.form.valid) //ma serve??? Su procedura-iscrizioni ho fatto diversamente
    )
  }

  async loadData(){
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    if (this.tipoPersonaID) this.form.controls.tipoPersonaID.setValue(this.tipoPersonaID);


    if (this.personaID && this.personaID + '' != "0") {
      const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(this.personaID);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);

      //interrogo ed aspetto per avere la lista dei tipi persona che mi serve nella loadPersona successiva
      await firstValueFrom(this.obsTipiPersona$.pipe(tap(lstTipiPersona=> this.lstTipiPersona = lstTipiPersona)));

      this.persona$ = loadPersona$
      .pipe( 

          tap(
            persona => {
              this.form.patchValue(persona);
              //console.log("persona-form - loadData - persona", persona);
              //console.log("persona-form - loadData - lstTipiPersona", this.lstTipiPersona)
              this._lstRoles = persona._LstRoles!;

              for (let i= 0; i < persona._LstRoles!.length; i++)
              {
                const tipoPersona = this.lstTipiPersona.find(tp => tp.descrizione === persona._LstRoles![i]);  //A VOLTE NON FUNZIA
                if (tipoPersona) this.selectedTipi.push(tipoPersona.id)
              }
              this.form.controls._lstRoles.setValue(this.selectedTipi);
            }

          )
      );
    }
    else 
      this.emptyForm = true

      //********************* FILTRO COMUNE *******************

      this.form.controls.comune.valueChanges.subscribe( res=> {
        this.comuniIsLoading = true
          if (res && res.length >=3 && this.comuniArr != undefined ) {
            this.filteredComuniArr = this.comuniArr.filter (val => val.comune.toLowerCase().includes(res.toLowerCase()) );
            this.comuniIsLoading = false
          } 
          else {
            this.filteredComuniArr = [];
            this.comuniIsLoading = false
          }
        }
      )

      this.form.controls.comuneNascita.valueChanges.subscribe( res=> {
        this.comuniNascitaIsLoading = true
          if (res && res.length >=3  && this.comuniArr != undefined) {
            this.filteredComuniNascitaArr = this.comuniArr.filter(val => val.comune.toLowerCase().includes(res.toLowerCase()));
            this.comuniNascitaIsLoading = false
          } 
          else {
            this.filteredComuniNascitaArr = [];
            this.comuniNascitaIsLoading = false
          }
        }
      )
      //MODALITA' PRECEDENTE TUTTA RXJS MA FUNZIONA MALE E OGNI VOLTA DEVE FARE UNA CHIAMATA
      // this.filteredComuni$ = this.form.controls.comune.valueChanges
      //   .pipe( 
      //     debounceTime(300),
      //     tap(() => this.comuniIsLoading = true),
      //     tap(() => console.log("cerco" + this.form.value.comune)),
      //     switchMap(() =>  
      //     { //voglio cercare SOLO se l'utente digita + di tre caratteri
      //       if (this.form.controls.comune.value.length >= 3) {
      //         return this.svcComuni.filterList(this.form.value.comune);
      //       } else {
      //         this.comuniIsLoading = false;
      //         return of([]);
      //       }
      //     }
      //     ),
      //     tap(() => this.comuniIsLoading = false),

      //   )
        // concatMap( res => iif (()=> res.length == 0, this.svcAlunni.postGenitoreAlunno(genitore.id, this.alunnoID), of() ))
  }

  save() :Observable<any>{


    this.saveRoles(); 

      //console.log ("PersonaFormComponent - save() - this.form.value", this.form.value);
    if (this.personaID == null || this.personaID == 0) {
      return this.svcPersone.post(this.form.value).pipe(
        tap( res=>{
          if (this.form.controls.tipoPersonaID.value == 6 || this.form.controls.tipoPersonaID.value == 7) //TODO fa schifo lo so
            {
              // let docente :PER_Docente = {  //TODO
              //   personaID : res.id,
              //   ckAttivo : true
              //   persona: {}
              // }
              // this.svcDocenti.post(docente).subscribe()
            }
          }
        )
      )
    }
    else {
      this.form.controls.dtNascita.setValue(Utility.formatDate(this.form.controls.dtNascita.value, FormatoData.yyyy_mm_dd));
      return this.svcPersone.put(this.form.value)
    }




  }


  saveRoles() {
    //parallelamente alla save (put o post che sia) della persona bisogna occuparsi di inserire i diversi ruoli
    //ALU_Alunno
    //ALU_Genitore
    //PER_Docente
    //PER_DocenteCoord - per questo una modalità diversa
    //PER_NonDocente
    //PER_Dirigente
    //PER_ITManager

    console.log("elenco dei valori arrivati inizialmente", this._lstRoles); //è l'elenco dei ruoli "precedenti". E' un array di stringhe del tipo ["Alunno", "ITManager"...]

    const selectedTipoPersonaIds = this.form.controls._lstRoles.value;
    const selectedTipoPersonaDescrizioni = selectedTipoPersonaIds.map((tipo:any) => {const tipoPersona = this.lstTipiPersona.find(tp => tp.id === tipo);
      return tipoPersona ? tipoPersona.descrizione : ''; // Restituisce la descrizione se trovata, altrimenti una stringa vuota
    });

    console.log("elenco dei valori selezionati dall'utente",selectedTipoPersonaDescrizioni);


    this._lstRoles.forEach(async roleinput=> {
      {if (!selectedTipoPersonaDescrizioni.includes(roleinput))
        {
          //questo roleinput è stato CANCELLATO, va dunque rimosso (ammesso che si possa)
          switch (roleinput) {
            case "Alunno":
              this.svcAlunni.deleteByPersona(this.personaID).subscribe();
            break;
            case "Genitore":
              this.svcGenitori.deleteByPersona(this.personaID).subscribe();
            break;
            case "Docente":
              this.svcDocenti.deleteByPersona(this.personaID).subscribe();
            break;
            case "DocenteCoord":
              let docente!: PER_Docente;
              await firstValueFrom(this.svcDocenti.getByPersona(this.personaID).pipe(tap(docenteEstratto => 
                {docente = docenteEstratto})));
              this.svcDocentiCoord.deleteByDocente(docente.id);
              break;
            case "NonDocente":
              this.svcNonDocenti.deleteByPersona(this.personaID).subscribe();
            break;
            case "Dirigente":
              this.svcDirigenti.deleteByPersona(this.personaID).subscribe();
            break;
            case "ITManager":
              this.svcITManagers.deleteByPersona(this.personaID).subscribe();
            break;
          }
        }
      }
    })

    selectedTipoPersonaDescrizioni.forEach(async (roleselected:string)=> {
      {if (!this._lstRoles.includes(roleselected))
        {
          //questo roleselected è stato AGGIUNTO, va dunque fatta la post
          let formData =  {
            personaID: this.personaID
          }
          switch (roleselected) {
            case "Alunno":
              this.svcAlunni.post(formData).subscribe();
            break;
            case "Genitore":
              this.svcGenitori.post(formData).subscribe();
            break;
            case "Docente":
              this.svcDocenti.post(formData).subscribe();
            break;
            case "DocenteCoord":
              let formDataDocenteCoord = {};
              await firstValueFrom(this.svcDocenti.getByPersona(this.personaID).pipe(tap(docenteEstratto => 
                {
                  formDataDocenteCoord = {
                    docenteID: docenteEstratto.id
                  }
                })));
              console.log("verificare se è arrivato...", formDataDocenteCoord );
              this.svcDocentiCoord.post(formDataDocenteCoord).subscribe();

            break;
            case "NonDocente":
              this.svcNonDocenti.post(formData).subscribe();
            break;
            case "Dirigente":
              this.svcDirigenti.post(formData).subscribe();
            break;
            case "ITManager":
              this.svcITManagers.post(formData).subscribe();
            break;
          }
        }
      }
    })




  }
  delete() :Observable<any>{
    if (this.personaID != null) 
      return this.svcPersone.delete(this.personaID) 
    else return of();
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

  updateDtNascita(dtNascita: string){

    //prendo la stringa e ne estraggo i pezzi
    const parts = dtNascita.split('/'); // Split the input string by '/'
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
  
    // creo la nuova data con i valori estratti (assumendo l'ordine day/month/year)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
    // formatto la data al tipo richiesto dal controllo data ('yyyy-MM-dd')
    let formattedDate = date.toISOString().slice(0, 10);
  
    //piccolo step per evitare che 1/1/2008 diventi 31/12/2007
    formattedDate = Utility.formatDate(date, FormatoData.yyyy_mm_dd);

    //impostazione della data finale
    this.form.controls['dtNascita'].setValue(formattedDate);
  }
//#endregion


}
