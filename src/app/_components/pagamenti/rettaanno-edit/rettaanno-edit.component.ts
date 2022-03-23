import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { LoadingService } from '../../utilities/loading/loading.service';
import { RetteService } from '../rette.service';

@Component({
  selector: 'app-rettaanno-edit',
  templateUrl: './rettaanno-edit.component.html',
  styleUrls: ['../pagamenti.css'],
})
export class RettaannoEditComponent implements OnInit {

//#region ----- Variabili -------
  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  totDefault!:                number;
  totConcordate!:             number;
  totPagamenti!:              number;
  retta$!:                    Observable<PAG_Retta[]>;


//#endregion

//#region ----- ViewChild Input Output -------
  @Input() alunnoID!:       number;
  @Input() annoID!:         number;
//#endregion

  constructor(
    private fb:               FormBuilder,
    private svcRette:         RetteService,
    private _loadingService:  LoadingService  


  ) {
    this.form = this.fb.group({
      totDefault:           [null],
      totConcordate:        [null],
      totPagamenti:         [null],
    });
   }

   ngOnChanges() {
    if (this.alunnoID && this.alunnoID + '' != "0") {
      this.loadData();
    } else {
      this.emptyForm = true;
      this.form.reset(); 
    }
  }


  loadData(){

    const obsRetta$: Observable<PAG_Retta[]> = this.svcRette.listByAlunnoAnno(this.alunnoID, this.annoID);
    const loadRette$ =this._loadingService.showLoaderUntilCompleted(obsRetta$);

    this.retta$ = loadRette$.pipe(

      tap(
        (retta: PAG_Retta[]) => {
          this.totPagamenti = 0;
          this.totConcordate = 0;
          this.totDefault = 0;
          retta.forEach( (rettaMese: PAG_Retta) => {
            rettaMese.pagamenti?.forEach( val=>{
              this.totPagamenti = this.totPagamenti + val.importo;
            });

            this.totConcordate = this.totConcordate + rettaMese.quotaConcordata;
            this.totDefault = this.totDefault + rettaMese.quotaDefault;

          }

          )
          console.log ("totDefault", this.totDefault);
          this.form.controls['totPagamenti'].setValue(this.totPagamenti);
          this.form.controls['totConcordate'].setValue(this.totConcordate);
          this.form.controls['totDefault'].setValue(this.totDefault);

        }
      )
    );
    


  }


  ngOnInit(): void {
  }

  save() {

  }

}
