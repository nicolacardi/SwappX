import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { Observable } from 'rxjs';

import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { DialogData, DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

import { PagamentiService } from '../pagamenti.service';
import { TipiPagamentoService } from '../tipiPagamento.service';
import { CausaliPagamentoService } from '../causaliPagamento.service';
import { AlunniService } from '../../alunni/alunni.service';

import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';
import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

import { LoadingService } from '../../utilities/loading/loading.service';

@Component({
  selector: 'app-pagamento-edit',
  templateUrl: './pagamento-edit.component.html',
  styleUrls: ['../pagamenti.css']
})

export class PagamentoEditComponent implements OnInit {

  emptyForm :                 boolean = false;
  loading:                    boolean = true;

  id!:                        number;
  public pagamento$!:         Observable<PAG_Pagamento>;

  idAlunnoSelected!:          number;
  form! :                     FormGroup;
  
  breakpoint!:                number;
  
  causaliPagamento$!:         Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!:            Observable<PAG_TipoPagamento[]>;
  descTipoPag!:               string;
  
  filteredAlunni$!:           Observable<ALU_Alunno[]>;

  @ViewChild(MatAutocomplete) matAutocomplete!: MatAutocomplete;
  @ViewChild('autoAlunno', { read: MatAutocompleteTrigger }) 
    autoAlunno!: MatAutocompleteTrigger;

  constructor(public _dialogRef: MatDialogRef<PagamentoEditComponent>,
              @Inject(MAT_DIALOG_DATA) public idPagamento: DialogData,
              private fb:                           FormBuilder, 
              private pagamentiSvc:                 PagamentiService,
              private tipiPagamentoSvc:             TipiPagamentoService,
              private causaliPagamentoSvc:          CausaliPagamentoService,
              private alunniSvc:                    AlunniService,
              public _dialog:                       MatDialog,
              private _snackBar:                    MatSnackBar,
              private router:                       Router,
              private _loadingService :             LoadingService )
  { 
      this.form = this.fb.group({
        id:                         [null],
        alunnoID:                   ['', Validators.required],
        causaleID:                  ['', Validators.required],
        dtPagamento:                ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
        importo:                    ['', { validators:[ Validators.required]}],
        tipoPagamentoID:            ['', Validators.required],
        //genitoreID:                 ['', Validators.required],
        nomeCognomeAlunno:          [''],
        nomeAlunno:                 [{value:'', disabled:true}],
        cognomeAlunno:              [{value:'', disabled:true}]

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

    if (this.idPagamento && this.idPagamento + '' != "0") {
      const obsPagamento$: Observable<PAG_Pagamento> = this.pagamentiSvc.loadByID(this.idPagamento);
      //const loadPagamento$ = this._loadingService.showLoaderUntilCompleted(obsPagamento$);
      this.pagamento$ = obsPagamento$
      .pipe(
          tap(
            pagamento => {
              this.form.patchValue(pagamento)
              this.descTipoPag = pagamento.tipoPagamento.descrizione;
              this.form.controls["nomeAlunno"].setValue(pagamento.alunno.nome);
              this.form.controls["cognomeAlunno"].setValue(pagamento.alunno.cognome);
            }
          )
      );
    } 
    else 
      this.emptyForm = true;
    
    this.causaliPagamento$ = this.causaliPagamentoSvc.load();
    this.tipiPagamento$ = this.tipiPagamentoSvc.load();
  }
  
  selected(event: MatAutocompleteSelectedEvent): void {
    this.idAlunnoSelected = parseInt(event.option.id);
    this.form.controls['alunnoID'].setValue(this.idAlunnoSelected);
  }

  deleteAlunnoID() {
    this.form.controls['alunnoID'].setValue("");
  }

  //#region ----- Funzioni -------

  save(){
    if (this.form.controls['id'].value == null) {
      this.pagamentiSvc.post(this.form.value)
        .subscribe(res=> {
        //console.log("return from post", res);
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        this._dialogRef.close();
      },
      err=> (
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      )
      );
    } else {
      this.pagamentiSvc.put(this.form.value)
        .subscribe(res=> {
          //console.log("return from put", res);
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        this._dialogRef.close();
        
      },
      err=> (
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      ));
    }
  }

  delete(){
    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    console.log(this.idPagamento);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.pagamentiSvc.delete(Number(this.idPagamento))
        .subscribe(
          res=>{
            this._snackBar.openFromComponent(SnackbarComponent,
              {data: 'Record cancellato', panelClass: ['red-snackbar']}
            );
            this._dialogRef.close();
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          )
        );
      }
    });
  }
 //#endregion
 
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
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 2;
  }
}
