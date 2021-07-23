import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';

import { PagamentiService } from '../pagamenti.service';
import { TipiPagamentoService } from '../tipiPagamento.service';
import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';


@Component({
  selector: 'app-pagamenti-edit',
  templateUrl: './pagamenti-edit.component.html',
  styleUrls: ['../pagamenti.css']
})
export class PagamentiEditComponent implements OnInit {

  id!:               number;
  pagamento$!:                Observable<PAG_Pagamento>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  breakpoint!:                number;
  descTipoPag!:               string;
  tipiPagamentoIsLoading:     boolean=false;
  filteredTipiPagamento$!:    Observable<PAG_TipoPagamento[]>;
  TipoPagamento$!:            Observable<PAG_TipoPagamento>;

  constructor(
    //public dialogRef: MatDialogRef<DialogYesNoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb:     FormBuilder, 
    private pagamentiSvc:     PagamentiService,
    private tipiPagamentoSvc: TipiPagamentoService,
    public _dialog:         MatDialog,
    private _snackBar:      MatSnackBar,
    private _loadingService :LoadingService,
    ) { 

      this.form = this.fb.group({
        id:                         [null],
        importo:                    ['', { validators:[ Validators.required, Validators.pattern("^[0-9]*$")]}],
        dtPagamento:                ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
        tipoPagamentoID:            ['', Validators.required],
        
        causaleID:                  ['', Validators.required]
// TODO ...
      });
  }

  ngOnInit()  {
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    
    if (this.data) {
      const obsPagamento$: Observable<PAG_Pagamento> = this.pagamentiSvc.loadByID(this.data);
      const loadPagamento$ = this._loadingService.showLoaderUntilCompleted(obsPagamento$);
      
      this.pagamento$ = loadPagamento$
      .pipe(
          tap(
            pagamento => {
              this.form.patchValue(pagamento)
              this.descTipoPag = pagamento.tipoPagamento.descrizione;
              
            }
          ),
      );
    } else {
      this.emptyForm = true
    }

    //********************* COMBO TIPO PAGAMENTO *******************
    this.filteredTipiPagamento$ = this.form.controls['tipoPagamentoID'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.tipiPagamentoIsLoading = true),
      //delayWhen(() => timer(2000)),
      switchMap(() => this.tipiPagamentoSvc.filter(this.form.value.tipoPagamentoID)),
      tap(() => this.tipiPagamentoIsLoading = false)
    );

  }

  // autocompleteDisplay() {
  //    this.tipiPagamentoSvc.loadByID(this.form.value.tipoPagamentoID).subscribe(
  //     x=>{
  //       this.descTipoPag = x.descrizione

  //   });
    
  // }
  displayFn(id: any) {
    if (!id) return "";
  
    console.log("BELLA MERDA", id);
/*
    const obsTipoPagamento$: Observable<PAG_TipoPagamento> = this.tipiPagamentoSvc.loadByID(id).pipe(
      tap(
        tipo => {
          console.log("TIPO PAGAMENTO", tipo.descrizione);
        }
      )
    );
    */
    
    //this.TipoPagamento$ = this.tipiPagamentoSvc.loadByID(id);

        
    this.TipoPagamento$ =  this.tipiPagamentoSvc.loadByID(id)
    .pipe(
        tap(
          tipo => {
            //this.form.patchValue(pagamento)
            this.descTipoPag = tipo.descrizione;
            
          }
        ),
    );


    return this.descTipoPag;


    //let index = this.states.findIndex(state => state.id === id);
    //return this.states[index].name;
  }

  save(){
//TODO ...
  }

  delete(){
//TODO ...
  }

  back(){
    //TODO ...

  }


  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 3;
  }
}
