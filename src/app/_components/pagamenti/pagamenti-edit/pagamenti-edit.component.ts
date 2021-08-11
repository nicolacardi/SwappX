import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';

import { PagamentiService } from '../pagamenti.service';
import { TipiPagamentoService } from '../tipiPagamento.service';
import { CausaliPagamentoService } from '../causaliPagamento.service';

import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';
import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

import { AlunniService } from '../../alunni/alunni.service';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

@Component({
  selector: 'app-pagamenti-edit',
  templateUrl: './pagamenti-edit.component.html',
  styleUrls: ['../pagamenti.css']
})
export class PagamentiEditComponent implements OnInit {

  id!:                        number;
  pagamento$!:                Observable<PAG_Pagamento>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  breakpoint!:                number;
  descTipoPag!:               string;
  
  causaliPagamento$!:         Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!:            Observable<PAG_TipoPagamento[]>;
  
  filteredAlunni$!:           Observable<ALU_Alunno[]>;

  @ViewChild(MatAutocomplete) matAutocomplete!: MatAutocomplete;

  @ViewChild('autoAlunno', { read: MatAutocompleteTrigger }) 
  autoAlunno!: MatAutocompleteTrigger;

  constructor(
    //public dialogRef: MatDialogRef<DialogYesNoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb:                           FormBuilder, 
    private pagamentiSvc:                 PagamentiService,
    private tipiPagamentoSvc:             TipiPagamentoService,
    private causaliPagamentoSvc:          CausaliPagamentoService,
    private alunniSvc:                    AlunniService,
    public _dialog:                       MatDialog,
    private _snackBar:                    MatSnackBar,
    //private _loadingService :             LoadingService,
    ) { 

      this.form = this.fb.group({
        id:                         [null],
        importo:                    ['', { validators:[ Validators.required, Validators.pattern("^[0-9]*$")]}],
        dtPagamento:                ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
        tipoPagamentoID:            ['', Validators.required],
        causaleID:                  ['', Validators.required],
        alunnoID:                   ['', Validators.required],
        genitoreID:                 ['', Validators.required],
        nomeCognomeAlunno:          [''],
        nomeAlunno:                 [{value:'', disabled:true}],
        cognomeAlunno:              [{value:'', disabled:true}]
// TODO ...
      });
  }

  ngOnInit()  {
    this.filteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
    .pipe(
      debounceTime(300),                                                      //attendiamo la digitazione
      //tap(() => this.nomiIsLoading = true),                                 //attiviamo il loading
      //delayWhen(() => timer(2000)),                                         //se vogliamo vedere il loading allunghiamo i tempi
      switchMap(() => this.alunniSvc.filterAlunni(this.form.value.nomeCognomeAlunno)), 
    )
    this.loadData();
  }

 
  loadData(){
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 4;
    if (this.data && this.data + '' != "0") {
      const obsPagamento$: Observable<PAG_Pagamento> = this.pagamentiSvc.loadByID(this.data);
      //const loadPagamento$ = this._loadingService.showLoaderUntilCompleted(obsPagamento$);
      this.pagamento$ = obsPagamento$
      .pipe(
          tap(
            pagamento => {
              this.form.patchValue(pagamento)
              this.descTipoPag = pagamento.tipoPagamento.descrizione;
              this.form.controls["nomeAlunno"].setValue( pagamento.alunno.nome);
              this.form.controls["cognomeAlunno"].setValue( pagamento.alunno.cognome);
            }
          )
      );
    } else {
      this.emptyForm = true;
    }
    this.causaliPagamento$ = this.causaliPagamentoSvc.load();
    this.tipiPagamento$ = this.tipiPagamentoSvc.load();
  }

    
  save(){
    if (this.form.controls['id'].value == null) 
      this.pagamentiSvc.post(this.form.value)
        .subscribe(res=> {
          console.log("return from post", res);
          //this.form.markAsPristine();
        });
    else 
      this.pagamentiSvc.put(this.form.value)
        .subscribe(res=> {
          console.log("return from put", res);
          //this.form.markAsPristine();
        });
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
  }

  delete(){
//TODO ...
  }

  back(){
    //TODO ...

  }

  //#region funzioni legate all'autocomplete
  
  enterAlunnoInput () {
    //Su pressione di enter devo dapprima selezionare il PRIMO valore della lista aperta (a meno che non sia vuoto)
    //Una volta selezionato devo trovare, SE esiste, il valore dell'id che corrisponde a quanto digitato e quello passarlo a passAlunno del service
    //Mancherebbe qui la possibilità di selezionare solo con le freccette e Enter
    if (this.form.controls['nomeCognomeAlunno'].value != '') {
      this.matAutocomplete.options.first.select();
      //Questo è il valore che devo cercare: this.matAutocomplete.options.first.viewValue;
      this.alunniSvc.findIdAlunno(this.matAutocomplete.options.first.viewValue)
      .subscribe();
    }
  }

  resetInputAlunno (formControlName: string) {
    //console.log("formControlName" , formControlName);
    this.form.controls[formControlName].setValue('');
    this.autoAlunno.closePanel();
  }

  //#endregion

  onResize(event: any) {
    console.log("STEP4");

    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 2;

    console.log("STEP5");

  }
}
