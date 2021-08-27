import { Component, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

import { RettameseEditComponent } from '../rettamese-edit/rettamese-edit.component';

import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

import { RetteService } from '../rette.service';
import { TipiPagamentoService } from '../tipiPagamento.service';
import { CausaliPagamentoService } from '../causaliPagamento.service';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';

@Component({
  selector: 'app-retta-edit',
  templateUrl: './retta-edit.component.html',
  styleUrls: ['../pagamenti.css']
})

export class RettaEditComponent implements OnInit {


  @ViewChildren(RettameseEditComponent) ChildComponents!:QueryList<RettameseEditComponent>;
  
  public obsRette$!:          Observable<PAG_Retta[]>;
  causaliPagamento$!:         Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!:            Observable<PAG_TipoPagamento[]>;
  
  form! :                     FormGroup;

  alunno!:                    ALU_Alunno;
  anno!:                      ASC_AnnoScolastico;

  mesi:                       number[] = [];
  quoteConcordate:            number[] = [];
  quoteDefault:               number[] = [];
  totPagamenti:               number[] = [];
  nPagamenti:                 number[] = [];
  idRette:                    number[] = [];

  public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  public mesiArr=           [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];

  constructor(public _dialogRef: MatDialogRef<RettaEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private fb:             FormBuilder, 
              public _dialog:         MatDialog,
              private retteSvc:       RetteService,
              private _snackBar:      MatSnackBar,
              private tipiPagamentoSvc:             TipiPagamentoService,
              private causaliPagamentoSvc:          CausaliPagamentoService,
              ) 
  { 
    this.form = this.fb.group({
      id:                         [null],
      alunnoID:                   ['', Validators.required],
      causaleID:                  ['', Validators.required],
      dtPagamento:                ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      importo:                    ['', { validators:[ Validators.required]}],
      tipoPagamentoID:            ['', Validators.required],
      nomeCognomeAlunno:          [''],
      nomeAlunno:                 [{value:'', disabled:true}],
      cognomeAlunno:              [{value:'', disabled:true}]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    this.causaliPagamento$ = this.causaliPagamentoSvc.load();
    this.tipiPagamento$ = this.tipiPagamentoSvc.load();

    this.obsRette$ = this.retteSvc.loadByAlunnoAnno(this.data.idAlunno, this.data.idAnno);  
    this.obsRette$.pipe(
      map(obj => { 
        //console.log ("obj", obj);
        let n = 0;
        this.alunno = obj[0].alunno!;
        this.anno = obj[0].anno!;
        obj.forEach(()=>{
          this.mesi[obj[n].meseRetta - 1] = obj[n].meseRetta;
          this.quoteConcordate[obj[n].meseRetta - 1] = obj[n].quotaConcordata;
          this.quoteDefault[obj[n].meseRetta - 1] = obj[n].quotaDefault;
          this.totPagamenti[obj[n].meseRetta-1] = 0;
          this.nPagamenti[obj[n].meseRetta-1] = 0;
          this.idRette[obj[n].meseRetta-1] = obj[n].id;
          obj[n].pagamenti?.forEach(x=>{
            //console.log (x.importo);
            this.totPagamenti[obj[n].meseRetta-1] = this.totPagamenti[obj[n].meseRetta-1] + x.importo;
            this.nPagamenti[obj[n].meseRetta-1] = this.nPagamenti[obj[n].meseRetta-1] + 1;
          });
          n++;
        })
      })
    )
    .subscribe( () => { 
      // console.log (this.mesi);
      // console.log (this.quoteConcordate);
      // console.log (this.quoteDefault);
      // console.log (this.totPagamenti);
    })
  }

  save() {
    //questo metodo chiama uno ad uno il metodo save di ciascun child
    //salvando quindi ogni form, cioè ogni record Retta
    let response : boolean;
    let hasError: boolean = false;

    for (let i = 0; i < 12; i++) {
      let childComponent = this.ChildComponents.find(childComponent => childComponent.indice == i);
      response = childComponent!.save();
      if (!response) {
        hasError = true;
      }
    }

    if (hasError) {
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore di Salvataggio', panelClass: ['red-snackbar']})
    } else {
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record Salvato', panelClass: ['green-snackbar']})
    }

    this._dialogRef.close();

  }

}
