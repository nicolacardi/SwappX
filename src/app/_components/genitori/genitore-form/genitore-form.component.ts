//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { Observable, of, tap }                  from 'rxjs';

//components

//services
import { GenitoriService }                      from '../genitori.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { ALU_TipoGenitore } from 'src/app/_models/ALU_Tipogenitore';
import { TipiGenitoreService } from '../tipi-genitore.service';

//#endregion

@Component({
  selector: 'app-genitore-form',
  templateUrl: './genitore-form.component.html',
  styleUrls: ['./../genitori.css']
})
export class GenitoreFormComponent {

  //#region ----- Variabili ----------------------
  genitore$!:                                     Observable<ALU_Genitore>;
  obsTipiGenitore$!:                            Observable<ALU_TipoGenitore[]>;
  form! :                                       UntypedFormGroup;
  
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  breakpoint!:                                  number;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() genitoreID!:                         number;
  // @Input() personaID!:                          number;

  @Output('formValid') formValid = new EventEmitter<boolean>();
//#endregion


//#region ----- Constructor --------------------

  constructor(public _dialog:                   MatDialog,
              private fb:                       UntypedFormBuilder, 
              private svcGenitori:              GenitoriService,
              private svcTipiGenitore:          TipiGenitoreService,
              private _loadingService :         LoadingService ) {

    this.form = this.fb.group(
    {
      id:                                       [null],
      personaID:                                [null],
      tipoGenitoreID:                           [''],
      titoloStudio:                             [''],
      professione:                              ['']
    });

    this.obsTipiGenitore$ = this.svcTipiGenitore.list();
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

    if (this.genitoreID && this.genitoreID + '' != "0") {
      const obsGenitore$: Observable<ALU_Genitore> = this.svcGenitori.get(this.genitoreID);
      const loadGenitore$ = this._loadingService.showLoaderUntilCompleted(obsGenitore$);

      this.genitore$ = loadGenitore$
      .pipe( 
          tap(
            genitore => this.form.patchValue(genitore)
          )
      );
    }
    else 
      this.emptyForm = true
  }

  save() :Observable<any>{
    
    if (this.genitoreID == null || this.genitoreID == 0) {
      return this.svcGenitori.post(this.form.value)
    }
    else {
      return this.svcGenitori.put(this.form.value)
    }
  }

  delete() :Observable<any>{
    if (this.genitoreID != null) 
      return this.svcGenitori.delete(this.genitoreID) 
    else return of();
  }
}
