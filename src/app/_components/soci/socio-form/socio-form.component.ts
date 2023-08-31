//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output }     from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { Observable, of }                       from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { FormatoData, Utility }                 from '../../utilities/utility.component';

//services
import { ComuniService }                        from 'src/app/_services/comuni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { SociService }                          from '../soci.service';

//models
import { PER_Socio, PER_TipoSocio }             from 'src/app/_models/PER_Soci';
import { _UT_Comuni }                           from 'src/app/_models/_UT_Comuni';
import { TipiSocioService }                     from '../tipi-socio.service';
import { User }                                 from 'src/app/_user/Users';

//#endregion
@Component({
  selector: 'app-socio-form',
  templateUrl: './socio-form.component.html',
  styleUrls: ['../soci.css']
})
export class SocioFormComponent implements OnInit {

//#region ----- Variabili ----------------------

  socio$!:                                      Observable<PER_Socio>;
  obsTipiSocio$!:                               Observable<PER_TipoSocio[]>;
  currSocio!:                                   User;

  public form! :                                UntypedFormGroup;
  emptyForm :                                   boolean = false;
  comuniArr!:                                   _UT_Comuni[];
  filteredComuniArr!:                           _UT_Comuni[];
  filteredComuniNascitaArr!:                    _UT_Comuni[];

  filteredComuni$!:                             Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:                      Observable<_UT_Comuni[]>;
  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;

//#endregion

//#region ----- ViewChild Input Output -------
  @Input() socioID!:                          number;
  @Input() tipoSocioID!:                      number;
  @Input() dove!:                               string;

  @Output('formValid') formValid = new EventEmitter<boolean>();
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialog:                   MatDialog,
              private fb:                       UntypedFormBuilder, 
              private svcSoci:                  SociService,
              private svcTipiSocio:             TipiSocioService,
              private _loadingService :         LoadingService  ) { 

    let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";

    this.form = this.fb.group({
      id:                                       [null],
      tipoSocioID:                              ['', Validators.required],
      personaID:                                [''],
      nome:                                     [{value: '', disabled: true}],
      cognome:                                  [{value: '', disabled: true}],
      dtNascita:                                [{value: '', disabled: true}],
      cf:                                       [{value: '', disabled: true}],
      dtRichiesta:                              [''],
      dtAccettazione:                           [''],
      quota:                                    [''],
      dtDisiscrizione:                          [''],
      dtRestQuota:                              [''],
      ckRinunciaQuota:                          ['']

    });

    this.obsTipiSocio$ = this.svcTipiSocio.list();
  }
  
//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();
    this.form.valueChanges.subscribe(
      res=> this.formValid.emit(this.form.valid) //ma serve??? Su procedura-iscrizioni ho fatto diversamente
    )
  }

  loadData(){


    if (this.tipoSocioID) this.form.controls.tipoSocioID.setValue(this.tipoSocioID);

    if (this.socioID && this.socioID + '' != "0") {
      const obsSocio$: Observable<PER_Socio> = this.svcSoci.get(this.socioID);
      const loadSocio$ = this._loadingService.showLoaderUntilCompleted(obsSocio$);

      this.socio$ = loadSocio$
      .pipe( 
          tap(
            socio => {
              console.log (socio);
              this.form.patchValue(socio)
              this.form.controls.nome.setValue(socio.persona!.nome);
              this.form.controls.cognome.setValue(socio.persona!.cognome);
              this.form.controls.dtNascita.setValue(Utility.formatDate(socio.persona!.dtNascita, FormatoData.dd_mm_yyyy));
              this.form.controls.cf.setValue(socio.persona!.cf);
            
            }
          )
      );
    }
    else 
      this.emptyForm = true

  }

  save() :Observable<any>{
    console.log ("SocioFormComponent - save() - this.form.value", this.form.value);
    if (this.socioID == null || this.socioID == 0) {
      return this.svcSoci.post(this.form.value)
    }
    else {
      this.form.controls.dtRichiesta.setValue(Utility.formatDate(this.form.controls.dtRichiesta.value, FormatoData.yyyy_mm_dd));
      return this.svcSoci.put(this.form.value)
    }
  }

  delete() :Observable<any>{
    if (this.socioID != null) 
      return this.svcSoci.delete(this.socioID) 
    else return of();
  }

//#endregion

//#region ----- Altri metodi -------
  updateDt(dt: string, control: string){

    //prendo la stringa e ne estraggo i pezzi
    const parts = dt.split('/'); // Split the input string by '/'
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
    this.form.controls['dtRichiesta'].setValue(formattedDate);
  }
  
//#endregion


}
