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
  styleUrls: ['../soci.component.css']
})
export class SocioFormComponent implements OnInit {

//#region ----- Variabili ----------------------

  socio$!:                                    Observable<PER_Socio>;
  obsTipiSocio$!:                             Observable<PER_TipoSocio[]>;
  currSocio!:                                 User;

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
              private svcComuni:                ComuniService,
              private _loadingService :         LoadingService  ) { 

    let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";

    this.form = this.fb.group({
      id:                                       [null],
      tipoSocioID:                            ['', Validators.required],
      nome:                                     ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      cognome:                                  ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
    });

    //this.currSocio = Utility.getCurrentUser();
    //this.obsTipiSocio$ = this.svcTipiSocio.listByLivello(this.currSocio.TipoSocio!.livello);
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

  loadData(){
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    if (this.tipoSocioID) this.form.controls.tipoSocioID.setValue(this.tipoSocioID);

    if (this.socioID && this.socioID + '' != "0") {
      const obsSocio$: Observable<PER_Socio> = this.svcSoci.get(this.socioID);
      const loadSocio$ = this._loadingService.showLoaderUntilCompleted(obsSocio$);

      this.socio$ = loadSocio$
      .pipe( 
          tap(
            socio => this.form.patchValue(socio)
          )
      );
    }
    else 
      this.emptyForm = true

  }

  save() :Observable<any>{
      //console.log ("SocioFormComponent - save() - this.form.value", this.form.value);
    if (this.socioID == null || this.socioID == 0) {
      return this.svcSoci.post(this.form.value).pipe(
        tap( res=>{
          if (this.form.controls.tipoSocioID.value == 6 || this.form.controls.tipoSocioID.value == 7) //TODO fa schifo lo so
            {
              // let docente :PER_Docente = {  //TODO
              //   socioID : res.id,
              //   ckAttivo : true
              //   socio: {}
              // }
              // this.svcDocenti.post(docente).subscribe()
            }
          }
        )
      )
    }
    else {
      this.form.controls.dtNascita.setValue(Utility.formatDate(this.form.controls.dtNascita.value, FormatoData.yyyy_mm_dd));
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

  
//#endregion


}
