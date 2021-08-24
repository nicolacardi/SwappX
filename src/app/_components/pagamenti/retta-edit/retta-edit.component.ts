import { Component, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { RetteService } from '../rette.service';

import { RettameseEditComponent } from '../rettamese-edit/rettamese-edit.component';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

@Component({
  selector: 'app-retta-edit',
  templateUrl: './retta-edit.component.html',
  styleUrls: ['../pagamenti.css']
})

export class RettaEditComponent implements OnInit {


  @ViewChildren(RettameseEditComponent) ChildComponents!:QueryList<RettameseEditComponent>;
  
  public obsRette$!:          Observable<PAG_Retta[]>;
  //public obsPagamenti$!:      Observable<PAG_Pagamento[]>;

  //idAlunno!:                  number;
  //idAnno!:                    number;
  form! :                     FormGroup;

  alunno!:                    ALU_Alunno;
  breakpoint!:                number;
  mesi:                      number[] = [];
  quoteConcordate:           number[] = [];
  quoteDefault:              number[] = [];
  totPagamenti:              number[] = [];
  nPagamenti:                number[] = [];
  idRette:                   number[] = [];

  public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  public mesiArr=           [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];

  
  constructor(public _dialogRef: MatDialogRef<RettaEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private fb:             FormBuilder, 
              public _dialog:         MatDialog,
              private retteSvc:       RetteService,
              private _snackBar:      MatSnackBar,
              ) 
  { }

  ngOnInit() {
    this.loadData();
  }

  loadData(){
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 4;

    //this.obsPagamenti$ = this.pagamentiSvc.loadByAlunnoAnno(this.data.idAlunno, this.data.idAnno);  
    
    /*
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
              console.log(pagamento.alunno.nome)
              this.form.controls["cognomeAlunno"].setValue(pagamento.alunno.cognome);
            }
          )
      );
    } 
    */

    this.obsRette$ = this.retteSvc.loadByAlunnoAnno(this.data.idAlunno, this.data.idAnno);  
    this.obsRette$.pipe(
       map(obj => { 
       //console.log ("obj", obj);
       let n = 0;
       this.alunno = obj[0].alunno!;
       obj.forEach(z=>{
        
          this.mesi[obj[n].mese - 1] = obj[n].mese;
          this.quoteConcordate[obj[n].mese - 1] = obj[n].quotaConcordata;
          this.quoteDefault[obj[n].mese - 1] = obj[n].quotaDefault;
          this.totPagamenti[obj[n].mese-1] = 0;
          this.nPagamenti[obj[n].mese-1] = 0;
          this.idRette[obj[n].mese-1] = obj[n].id;
          obj[n].pagamenti?.forEach(x=>{
            //console.log (x.importo);
            this.totPagamenti[obj[n].mese-1] = this.totPagamenti[obj[n].mese-1] + x.importo;
            this.nPagamenti[obj[n].mese-1] = this.nPagamenti[obj[n].mese-1] + 1;
          });
          n++;
      })   
      
       })
    )
    .subscribe( () => { 
    //   // console.log (this.mesi);
    //   // console.log (this.quoteConcordate);
    //   // console.log (this.quoteDefault);
    //   // console.log (this.totPagamenti);
    })
  }

  save() {
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
