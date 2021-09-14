import { Component, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

import { RettameseEditComponent } from '../rettamese-edit/rettamese-edit.component';

import { RetteService } from '../rette.service';
import { TipiPagamentoService } from '../tipiPagamento.service';
import { CausaliPagamentoService } from '../causaliPagamento.service';
import { PagamentiService } from '../pagamenti.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { AlunniService } from '../../alunni/alunni.service';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { PagamentiListComponent } from '../pagamenti-list/pagamenti-list.component';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';




@Component({
  selector: 'app-retta-edit',
  templateUrl: './retta-edit.component.html',
  styleUrls: ['../pagamenti.css']
})

export class RettaEditComponent implements OnInit {

  @ViewChildren(RettameseEditComponent) ChildrenRettaMese!:QueryList<RettameseEditComponent>;
  @ViewChild(PagamentiListComponent) ChildPagamenti!: PagamentiListComponent;
  @ViewChild(MatAutocomplete) matAutocomplete!: MatAutocomplete;

  public obsRette$!:          Observable<PAG_Retta[]>;
  causaliPagamento$!:         Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!:            Observable<PAG_TipoPagamento[]>;
  filteredAlunni$!:           Observable<ALU_Alunno[]>;

  formRetta! :                FormGroup;
  formAlunno! :               FormGroup;

  alunno!:                    ALU_Alunno;
  
  anno!:                      ASC_AnnoScolastico;

  mesi:                       number[] = [];
  quoteConcordate:            number[] = [];
  quoteDefault:               number[] = [];
  totPagamenti:               number[] = [];
  nPagamenti:                 number[] = [];
  idRette:                    number[] = [];
  idToHighlight!:             number;

  //public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  public mesiArr=           [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];

  constructor(public _dialogRef: MatDialogRef<RettaEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private fb:             FormBuilder, 
              public _dialog:         MatDialog,
              private retteSvc:       RetteService,
              private alunniSvc:      AlunniService,
              private _snackBar:      MatSnackBar,

              
              private _loadingService:  LoadingService,
              ) 
  { 
    this.formRetta = this.fb.group({
      id:                         [null],
      alunnoID:                   ['', Validators.required],
      annoID:                     ['', Validators.required],
      causaleID:                  ['', Validators.required],
      dtPagamento:                ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      importo:                    ['', { validators:[ Validators.required]}],
      tipoPagamentoID:            ['', Validators.required],
      nomeCognomeAlunno:          [null]
    });

    // this.formAlunno = this.fb.group({
    //   nomeCognomeAlunno:          [null]
    // })
  }

  ngOnInit() {

    this.filteredAlunni$ = this.formRetta.controls['nomeCognomeAlunno'].valueChanges
    .pipe(
      debounceTime(300),                                                      //attendiamo la digitazione
      //tap(() => this.nomiIsLoading = true),                                 //attiviamo il loading
      //delayWhen(() => timer(2000)),                                         //se vogliamo vedere il loading allunghiamo i tempi
      switchMap(() => this.alunniSvc.filterAlunni(this.formRetta.value.nomeCognomeAlunno)), 
    )


    this.loadData();
  }

  loadData(){
    if (this.data.idAlunno == 0) return;
    this.obsRette$ = this.retteSvc.loadByAlunnoAnno(this.data.idAlunno, this.data.idAnno);  
    //const loadRette$ =this._loadingService.showLoaderUntilCompleted(this.obsRette$);
    this.obsRette$.pipe(
      map(obj => { 
        if (obj.length!= 0 ) {
          let n = 0;
          this.alunno = obj[0].alunno!;
          this.formRetta.controls['nomeCognomeAlunno'].setValue(this.alunno.nome+" "+this.alunno.cognome);

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
        } else {
          for (let i = 0; i <= 11; i++) {
            this.idRette[i] = 0;
          }
        }
      })
    )
    .subscribe( () => { 
      // console.log (this.mesi);
      // console.log (this.quoteConcordate);
      // console.log (this.quoteDefault);
      // console.log (this.totPagamenti);
    })
    
  }



  savePivot() {
    //NON DOVREBBE PIU' SERVIRE
    //questo metodo chiama uno ad uno il metodo save di ciascun child
    //salvando quindi ogni form, cioè ogni record Retta
    let response : boolean;
    let hasError: boolean = false;

    for (let i = 0; i < 12; i++) {
      let childRettaMese = this.ChildrenRettaMese.find(childRettaMese => childRettaMese.indice == i);
      response = childRettaMese!.save();
      if (!response) {
        hasError = true;
      }
    }

    if (hasError) 
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore di Salvataggio', panelClass: ['red-snackbar']})
    else 
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record Salvato', panelClass: ['green-snackbar']})

    this._dialogRef.close();
  }

  nuovoPagamentoArrivato(str: string) {
    //è stato inserito un nuovo pagamento: devo fare il refresh dei child: della lista (ChildPagamenti)
    this.ChildPagamenti.loadData();

    //ora dovrei fare il refresh del solo component rettamese interessato...quindi dovrei passare qui l'indice del component rettamese corretto
    //ma provo per ora a fare il refresh di tutti e 12 i component rettamese
    console.log("arrivato nuovo Pagamento faccio la refresh di tutti i rettaMese"+str);
    //ora bisogna fare la refresh di tutti i 12 rettamese
    for (let i = 0; i < 12; i++) {
      let childRettaMese = this.ChildrenRettaMese.find(childRettaMese => childRettaMese.indice == i);
      childRettaMese!.ngOnChanges();
    }
    
  }

  hoverPagamentoArrivato(id: number) {
    //console.log ("arrivato", id);
    this.idToHighlight = id;
    //this.ChildPagamenti.refresh();
  }


  enterAlunnoInput () {
    //Su pressione di enter devo dapprima selezionare il PRIMO valore della lista aperta (a meno che non sia vuoto)
    //Una volta selezionato devo trovare, SE esiste, il valore dell'id che corrisponde a quanto digitato e quello passarlo a passAlunno del service
    //Mancherebbe qui la possibilità di selezionare solo con le freccette e Enter
    if (this.formRetta.controls['nomeCognomeAlunno'].value != '') {
      this.matAutocomplete.options.first.select();
      //Questo è il valore che devo cercare: this.matAutocomplete.options.first.viewValue;
      this.alunniSvc.findIdAlunno(this.matAutocomplete.options.first.viewValue)
      .subscribe();
    }
  }

  deleteAlunnoID() {
    this.formRetta.controls['alunnoID'].setValue("");
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.data.idAlunno = parseInt(event.option.id);
    this.formRetta.controls['alunnoID'].setValue(parseInt(event.option.id));
    this.loadData();
  }

}
