//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnInit, Output }                     from '@angular/core';
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

export class AlunnoFormComponent implements OnInit {

//#region ----- Variabili ----------------------
  alunno$!:                                     Observable<ALU_Alunno>;
  form! :                                       UntypedFormGroup;
  
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() alunnoID!:                           number;
  @Output('formValid') formValid = new EventEmitter<boolean>();
  @Output('formChanged') formChanged = new EventEmitter();
  @Output('deletedRole') deletedRole = new EventEmitter<string>();

//#endregion
  
//#region ----- Constructor --------------------

  constructor(public _dialog:                   MatDialog,
              private fb:                       UntypedFormBuilder, 
              private svcAlunni:                AlunniService,
              private _loadingService :         LoadingService ) {

    this.form = this.fb.group(
    {
      id:                                       [null],
      personaID:                                [null],
      scuolaProvenienza:                        ['', Validators.maxLength(255)],
      indirizzoScuolaProvenienza:               ['', Validators.maxLength(255)],
      ckDSA:                                    [false],
      ckDisabile:                               [false],
    });
  }

//#endregion


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();

    this.form.valueChanges.subscribe(
      res=> {
        this.formValid.emit(this.form.valid);
        this.formChanged.emit()
      }
    )
  }

  loadData(){

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

    if (this.alunnoID == null || this.alunnoID == 0) 
      return this.svcAlunni.post(this.form.value)
    else 
      return this.svcAlunni.put(this.form.value)
  }

  delete() :Observable<any>{
    if (this.alunnoID != null) 
      return this.svcAlunni.delete(this.alunnoID) 
    else 
      return of();
  }


  deleteRole() {
    this.delete();
    this.deletedRole.emit('Alunno')
  }
//#endregion
}
