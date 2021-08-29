import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { CausaliPagamentoService } from '../causaliPagamento.service';
import { PagamentiService } from '../pagamenti.service';
import { TipiPagamentoService } from '../tipiPagamento.service';

@Component({
  selector: 'app-rettapagamento-edit',
  templateUrl: './rettapagamento-edit.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RettapagamentoEditComponent implements OnInit {

  @Input() alunnoID!:       number;
  @Input() annoID!:         number;
  @Output('nuovoPagamento')
  pagamentoEmitter = new EventEmitter<string>();


  formRetta! :                FormGroup;
  causaliPagamento$!:         Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!:            Observable<PAG_TipoPagamento[]>;

  public mesiArr=           [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];

  constructor(private fb:                           FormBuilder, 
              private tipiPagamentoSvc:             TipiPagamentoService,
              private causaliPagamentoSvc:          CausaliPagamentoService,
              private pagamentiSvc:                 PagamentiService,
              private _snackBar:                    MatSnackBar,) { 

    this.formRetta = this.fb.group({
      id:                         [null],
      alunnoID:                   [''],
      annoID:                     [''],
      causaleID:                  ['', Validators.required],
      dtPagamento:                ['', Validators.required],
      importo:                    ['', Validators.required],
      tipoPagamentoID:            ['', Validators.required],
      meseRetta:                  ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(){
    this.causaliPagamento$ = this.causaliPagamentoSvc.load();
    this.tipiPagamento$ = this.tipiPagamentoSvc.load();
  }

  save(){

    //if (this.formRetta.controls['id'].value == null) {
      this.formRetta.controls['alunnoID'].setValue(this.alunnoID);
      this.formRetta.controls['annoID'].setValue(this.annoID);
      console.log("retta-edit.ts save() : this.formRetta.value", this.formRetta.value);
      this.pagamentiSvc.post(this.formRetta.value)
        .subscribe(
          res=> {
            //console.log("return from post", res);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            //this._dialogRef.close();
            this.pagamentoEmitter.emit("salvato Record");
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
      );
    //} else {
      //NON FACCIAMO MAI LA PUT, E' SEMPRE SOLO UNA POST
    //}
    

  }

  changedCausale(value: number) {
    if (value == 1) {
      this.formRetta.controls["meseRetta"].setValidators(Validators.required);
      this.formRetta.controls["meseRetta"].updateValueAndValidity();
    } else {
      this.formRetta.controls["meseRetta"].clearValidators();
      this.formRetta.controls["meseRetta"].updateValueAndValidity();
    }
  }

}
