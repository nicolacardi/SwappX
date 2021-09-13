//TODO causale.value == 1 va cagarissimo


import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { CausaliPagamentoService } from '../causaliPagamento.service';
import { PagamentiService } from '../pagamenti.service';
import { RetteService } from '../rette.service';
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
  @ViewChild('causale')       public causale!: MatSelect;
  
  public mesiArr=           [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];

  constructor(private fb:                           FormBuilder, 
              private tipiPagamentoSvc:             TipiPagamentoService,
              private causaliPagamentoSvc:          CausaliPagamentoService,
              private pagamentiSvc:                 PagamentiService,
              private retteSvc:                     RetteService,
              private _snackBar:                    MatSnackBar,) { 

    this.formRetta = this.fb.group({
      id:                         [null],
      alunnoID:                   [''],
      annoID:                     [''],
      causaleID:                  ['', Validators.required],
      dtPagamento:                ['', Validators.required],
      importo:                    ['', Validators.required],
      tipoPagamentoID:            ['', Validators.required],
      meseRetta:                  ['', Validators.required],
      rettaID:                    ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(){
    this.causaliPagamento$ = this.causaliPagamentoSvc.load();
    this.tipiPagamento$ = this.tipiPagamentoSvc.load();
  }

  save( ){
    //if (this.formRetta.controls['id'].value == null) { //non serve questo check: facciamo sempre la post mai la put
    this.formRetta.controls['alunnoID'].setValue(this.alunnoID);
    this.formRetta.controls['annoID'].setValue(this.annoID);
    

    if (this.causale.value == 1) {
      
      //ATTENZIONE: ASINCRONA! BISOGNA ASPETTARE CHE QUESTA RISPONDA PRIMA DI LANCIARE LA SUCCESSIVA post
      this.retteSvc.loadByAlunnoAnnoMese(this.alunnoID, this.annoID, (this.formRetta.controls['meseRetta'].value + 1))
      .pipe (
        tap (val=> this.formRetta.controls['rettaID'].setValue(val.id)), //il valore in arrivo dalla load viene inserito nel form
        concatMap(() => this.pagamentiSvc.post(this.formRetta.value)) //concatMap ATTENDE l'observable precedente prima di lanciare il successivo
        )
        .subscribe(
          ()=> {
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            //this._dialogRef.close();
            this.pagamentoEmitter.emit(this.formRetta.controls['meseRetta'].value);
            this.resetFields();
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
      );

    } else {

      this.pagamentiSvc.post(this.formRetta.value)
        
        .subscribe(
          ()=> {
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            //this._dialogRef.close();
            this.pagamentoEmitter.emit("RecordSalvato");
            this.resetFields();
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
        )
    }
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

  resetFields(){

    this.formRetta.controls["id"].setValue(null);
    this.formRetta.controls["alunnoID"].setValue(null);
    this.formRetta.controls["annoID"].setValue(null);
    this.formRetta.controls["causaleID"].setValue(null);
    this.formRetta.controls["dtPagamento"].setValue(null);
    this.formRetta.controls["importo"].setValue(null);
    this.formRetta.controls["tipoPagamentoID"].setValue(null);
    this.formRetta.controls["meseRetta"].setValue(null);

    this.formRetta.markAsPristine();
    this.formRetta.markAsUntouched();
    this.formRetta.updateValueAndValidity();

    for (let control in this.formRetta.controls) {
      this.formRetta.controls[control].setErrors(null);
    }
  }
}
