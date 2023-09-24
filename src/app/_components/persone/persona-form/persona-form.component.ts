//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output }     from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { Observable, firstValueFrom, from, of }                       from 'rxjs';
import { concatMap, mergeMap, tap }                                  from 'rxjs/operators';

//components
import { FormatoData, Utility }                 from '../../utilities/utility.component';

//services
import { ComuniService }                        from 'src/app/_services/comuni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PersoneService }                       from '../persone.service';

import { TipiPersonaService }                   from '../tipi-persona.service';
import { AlunniService }                        from '../../alunni/alunni.service';
import { GenitoriService }                      from '../../genitori/genitori.service';
import { DocentiService }                       from '../../docenti/docenti.service';
import { NonDocentiService }                    from '../nondocenti.service';
import { ITManagersService }                    from '../ITmanagers.service';
import { DirigentiService }                     from '../dirigenti.service';
import { DocentiCoordService }                  from '../docenticoord.service';

//models
import { PER_Persona, PER_TipoPersona }         from 'src/app/_models/PER_Persone';
import { _UT_Comuni }                           from 'src/app/_models/_UT_Comuni';
import { PER_Docente }                          from 'src/app/_models/PER_Docente';
import { User }                                 from 'src/app/_user/Users';
import { UserService } from 'src/app/_user/user.service';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';



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
  currUser!:                                    User;

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
  selectedRoles:                                 number[] = []

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
              private svcUser:                  UserService,

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
      //tipoPersonaID:                            ['', Validators.required],
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
      email:                                    ['',{ validators:[Validators.email, Validators.required]}],
      ckAttivo:                                 [true]
    });

    this.currUser = Utility.getCurrentUser();
    //this.obsTipiPersona$ = this.svcTipiPersona.listByLivello(this.currPersona.persona!.tipoPersona!.livello);
    this.obsTipiPersona$ = this.svcTipiPersona.list();

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

    //if (this.tipoPersonaID) this.form.controls.tipoPersonaID.setValue(this.tipoPersonaID);


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
                const ruoloPersona = this.lstTipiPersona.find(tp => tp.descrizione === persona._LstRoles![i]);
                if (ruoloPersona) this.selectedRoles.push(ruoloPersona.id)
              }
              this.form.controls._lstRoles.setValue(this.selectedRoles);
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

  // async checkExistsNC() : Promise<any>{
  //   let nome = this.form.controls.nome.value;
  //   let cognome = this.form.controls.cognome.value;
  //   let objTrovato : PER_Persona;
  //   await firstValueFrom(this.svcPersone.getByNomeCognome(nome, cognome, this.personaID));
  // }

  async checkExists(): Promise<any[] | null> {

    let result = [];
    let objTrovatoNC: PER_Persona | null = null;
    let objTrovatoCF: PER_Persona | null = null;
    let objTrovatoEM: PER_Persona | null = null;

    objTrovatoNC = await firstValueFrom(this.svcPersone.getByNomeCognome(this.form.controls.nome.value, this.form.controls.cognome.value, this.personaID));
    if (this.form.controls.cf.value && this.form.controls.cf.value!= '') objTrovatoCF = await firstValueFrom(this.svcPersone.getByCF(this.form.controls.cf.value, this.personaID));
    objTrovatoEM = await firstValueFrom(this.svcPersone.getByEmail(this.form.controls.email.value, this.personaID));

    if (objTrovatoNC) result.push({msg: "Nome-Cognome già esistente", grav: "nonBlock"} );
    if (objTrovatoCF) result.push({msg: "CF già esistente", grav: "Block"} );
    if (objTrovatoEM) result.push({msg: "Email già esistente", grav: "Block"} );
    
    return result;
  }

  save() :Observable<any>{

    //---------- AS --------------------
    let result = [];
    //let objTrovatoNC: PER_Persona | null = null;
    
    //const obsPersona$: Observable<PER_Persona> = this.svcPersone.getByNomeCognome(this.form.controls.nome.value, this.form.controls.cognome.value, this.personaID);
    //await firstValueFrom(this.obsTipiPersona$.pipe(tap(lstTipiPersona=> this.lstTipiPersona = lstTipiPersona)));
/*
    let objTrovatoNC =  this.svcPersone.getByNomeCognome(this.form.controls.nome.value, this.form.controls.cognome.value, this.personaID)
      .subscribe(
        res => this.comuniArr = res
      );
    console.log("AS: ",objTrovatoNC )
        */
    //--------------------------------------

    if (this.personaID == null || this.personaID == 0) {
      
      return this.svcPersone.post(this.form.value).pipe (
        tap(persona=> this.saveRoles() ),
        concatMap(persona => {
          let formData = { 
            UserName:   this.form.controls.email.value,
            Email:      this.form.controls.email.value,
            PersonaID:  persona.id,
            Password:   "1234"
          };
          console.log ("sto creando l'utente", formData);
          return this.svcUser.post(formData)
        }),
      )
    }
    else {
      this.form.controls.dtNascita.setValue(Utility.formatDate(this.form.controls.dtNascita.value, FormatoData.yyyy_mm_dd));
      this.saveRoles(); 
      return this.svcPersone.put(this.form.value)
    }

    /*
      if (this.personaID == null || this.personaID == 0) {
      
        return from(this.checkExists()).pipe(
          mergeMap((msg) => {
          if (msg && msg.length > 0) { 
            
            const blockMessages = msg
                .filter(item => item.grav === "Block")
                .map(item => item.msg); 

            if (blockMessages && blockMessages.length > 0){
              this._dialog.open(DialogOkComponent, {
                width: '320px',
                data: { titolo: "ATTENZIONE!", sottoTitolo: blockMessages.join(', ') + 'Impossibile Salvare' }
              });
              
              return of()
            }
            else {
              const UnblockMessages = msg
              .filter(item => item.grav === "nonBlock")
              .map(item => item.msg);

              const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
                width: '320px',
                data: { titolo: "ATTENZIONE!", sottoTitolo: UnblockMessages.join(', ') + 'Vuoi salvare?' }
              });

              dialogYesNo.afterClosed().subscribe(result => {
                if(result) {
                  return of();
                } else {
                  return of();
                }
              });
            }
          }  /////(ELSE???)
        return this.svcPersone.post(this.form.value)
        .pipe (
          tap(persona=> this.saveRoles() ),
          concatMap(persona => {
            let formData = { 
              UserName:   this.form.controls.email.value,
              Email:      this.form.controls.email.value,
              PersonaID:  persona.id,
              Password:   "1234"
            };
            console.log ("sto creando l'utente", formData);
            return this.svcUser.post(formData)
          }),
        )}))
      }
      else {
        this.form.controls.dtNascita.setValue(Utility.formatDate(this.form.controls.dtNascita.value, FormatoData.yyyy_mm_dd));
        this.saveRoles(); 
        return this.svcPersone.put(this.form.value)
        
      }
    */
  };


  saveRoles() {
    //parallelamente alla save (put o post che sia) della persona bisogna occuparsi di inserire i diversi ruoli
    //ALU_Alunno
    //ALU_Genitore
    //PER_Docente
    //PER_DocenteCoord - per questo una modalità diversa
    //PER_NonDocente
    //PER_Dirigente
    //PER_ITManager
    let selectedRolesIds = []
    //console.log("elenco dei valori arrivati inizialmente", this._lstRoles); //è l'elenco dei ruoli "precedenti". E' un array di stringhe del tipo ["Alunno", "ITManager"...]
    console.log (this.personaID);
    if (this.form.controls._lstRoles.value.length != 0) selectedRolesIds = this.form.controls._lstRoles.value;
    console.log (selectedRolesIds);
    const selectedRolesDescrizioni = selectedRolesIds.map((tipo:any) => {const tipoPersona = this.lstTipiPersona.find(tp => tp.id === tipo);
      return tipoPersona ? tipoPersona.descrizione : ''; // Restituisce la descrizione se trovata, altrimenti una stringa vuota
    });
    console.log("this._lstRoles",this._lstRoles);

    console.log("elenco dei valori selezionati dall'utente",selectedRolesDescrizioni);

    if (this._lstRoles) { //se è un record nuovo e non seleziono nessuno è undefined
      this._lstRoles.forEach(async roleinput=> {
        {if (!selectedRolesDescrizioni.includes(roleinput))
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

      selectedRolesDescrizioni.forEach(async (roleselected:string)=> {
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
