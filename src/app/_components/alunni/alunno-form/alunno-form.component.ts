//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, Output }                     from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { Observable, of, tap }                  from 'rxjs';

//components

//services
import { AlunniService }                        from '../alunni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';


//#endregion

@Component({
  selector: 'app-alunno-form',
  templateUrl: './alunno-form.component.html',
  styleUrls:    ['./../alunni.css']
})


export class AlunnoFormComponent {

//#region ----- Variabili ----------------------
  alunno$!:                                     Observable<ALU_Alunno>;
  form! :                                       UntypedFormGroup;
  
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  breakpoint!:                                  number;
  breakpoint2!:                                 number;

//#endregion

//#region ----- ViewChild Input Output -------
  @Input() alunnoID!:                           number;
  @Input() personaID!:                          number;

  @Output('formValid') formValid = new EventEmitter<boolean>();

//#endregion
  
//#region ----- Constructor --------------------

  constructor(public _dialog:                   MatDialog,
              private fb:                       UntypedFormBuilder, 
              private svcAlunni:                AlunniService,
              private _loadingService :         LoadingService ) {

  this.form = this.fb.group(
  {
  id:                                           [null],
  scuolaProvenienza:                            ['', Validators.maxLength(255)],
  indirizzoScuolaProvenienza:                   ['', Validators.maxLength(255)],
  personaID:                                    [this.personaID],
  ckDSA:                                        [false],
  ckDisabile:                                   [false],
  });

}

//#endregion


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();

    this.form.valueChanges.subscribe(
      res=> this.formValid.emit(this.form.valid)
    )
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    if (this.alunnoID && this.alunnoID + '' != "0") {
      const obsAlunno$: Observable<ALU_Alunno> = this.svcAlunni.get(this.alunnoID);
      const loadAlunno$ = this._loadingService.showLoaderUntilCompleted(obsAlunno$);

      this.alunno$ = loadAlunno$
      .pipe( 
          tap(
            alunno => this.form.patchValue(alunno)
          )
      );
    }
    else 
      this.emptyForm = true
  }

  save() :Observable<any>{
    //console.log("save di alunno form -form:", this.form.value);
    if (this.alunnoID == null || this.alunnoID == 0) {
      return this.svcAlunni.post(this.form.value)
    }
    else {
      return this.svcAlunni.put(this.form.value)
    }
  }

  delete() :Observable<any>{
    if (this.alunnoID != null) 
      return this.svcAlunni.delete(this.alunnoID) 
    else return of();
  }
//#endregion
}
