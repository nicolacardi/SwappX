import { Component, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, timer } from 'rxjs';
import { debounceTime, delayWhen, map, switchMap, tap } from 'rxjs/operators';
import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

import { RettameseEditComponent } from '../rettamese-edit/rettamese-edit.component';

import { RetteService } from '../rette.service';

import { LoadingService } from '../../utilities/loading/loading.service';
import { AlunniService } from '../../alunni/alunni.service';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';
import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { PagamentiListComponent } from '../pagamenti-list/pagamenti-list.component';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { RettapagamentoEditComponent } from '../rettapagamento-edit/rettapagamento-edit.component';




@Component({
  selector: 'app-retta-edit',
  templateUrl: './retta-edit.component.html',
  styleUrls: ['../pagamenti.css']
})

export class RettaEditComponent implements OnInit {

  @ViewChildren(RettameseEditComponent) ChildrenRettaMese!:QueryList<RettameseEditComponent>;
  @ViewChild(PagamentiListComponent) ChildPagamenti!: PagamentiListComponent;
  @ViewChild(RettapagamentoEditComponent) ChildRettapagamentoEdit!: RettapagamentoEditComponent;
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
      nomeCognomeAlunno:          [null],
      annoscolastico:             [null]
    });

    // this.formAlunno = this.fb.group({
    //   nomeCognomeAlunno:          [null]
    // })
  }

  ngOnInit() {

    this.filteredAlunni$ = this.formRetta.controls['nomeCognomeAlunno'].valueChanges
    .pipe(
      debounceTime(300),
      switchMap(() => this.alunniSvc.filterAlunni(this.formRetta.value.nomeCognomeAlunno))
    )

    this.formRetta.controls['annoscolastico'].setValue(this.data.idAnno);

    this.formRetta.controls['annoscolastico'].valueChanges
    .subscribe(
      val=> {
        if (val) {
          console.log(val);
          this.data.idAnno = val;
          this.loadData();
        }
      }
    )

    
    this.loadData();
  }

  loadData(){
    console.log("idAnno", this.data.idAnno);

    this.obsRette$ = this.retteSvc.loadByAlunnoAnno(this.data.idAlunno, this.data.idAnno);  
    const loadRette$ =this._loadingService.showLoaderUntilCompleted(this.obsRette$);
    loadRette$.pipe(
      //delayWhen(() => timer(5000)),
      map(obj => { 
        //obsRette$ ?? un Observable<PAG_Retta[]> quindi ?? un elenco/lista/array di 12 oggetti di tipo PAG_Rette
        //prendo CIASCUNO di questi 12 oggetti e ci popolo vari array di numeri in cui l'indice va da 0 a 11
        //ed in particolare ?? obj[n].meseRetta
        //questi array nell'html li uso per passare ORDINATAMENTE a ognuno dei 12 component rettamese la quotaconcordata, la quotadefault, l'idRetta
        if (obj.length!= 0 ) {
          let n = 0;

          this.alunno = obj[0].alunno!;
          this.formRetta.controls['nomeCognomeAlunno'].setValue(this.alunno.nome+" "+this.alunno.cognome);

          this.anno = obj[0].anno!;
          //this.formRetta.controls['annoscolastico'].setValue(this.anno.id);
          console.log ("obj", obj);
          obj.forEach(()=>{
            this.mesi[obj[n].meseRetta - 1] = obj[n].meseRetta;
            this.quoteConcordate[obj[n].meseRetta - 1] = obj[n].quotaConcordata;
            this.quoteDefault[obj[n].meseRetta - 1] = obj[n].quotaDefault;

            //ora calcolo il totale dei pagamenti per ciascun mese e lo metto nell'array totPagamenti sommandolo 
            //foreach pagamento trovato
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
          //obj.length ?? = 0 quando non c'?? alcun obj, cio?? quando si vuole inserire un "nuovo pagamento" da zero
          //la differenza in questo caso ?? che non c'?? un anno e quindi lo dobbiamo forzare
          //creo un oggetto vuoto di tipo ASC_Annoscolastico, lo assegno a this.anno e poi ci setto il valor di default
          const tmpObj = <ASC_AnnoScolastico>{};
          this.anno = tmpObj;
          this.anno.annoscolastico ="2019-20"; //ovviamente questo sar?? un parametro, per ora lo "cablo" dentro
          //console.log( "obj.length = 0");
          //this.formRetta.controls['nomeCognomeAlunno'].setValue("");
          //retta.edit passa i valori a 12 children, uno per mese, che si chiamano rettamese-edit:
          //nel caso di "nuovo pagamento" impostiamo a 0 tutti i valori trasmessi ai child
          for (let i = 0; i <= 11; i++) {
            //idRette[da 0 a 11] ?? il valore dir?? ad ognuno dei 12 child che si tratta di un nuovo pagamento
            this.idRette[i] = 0; 
            // this.quoteConcordate[i]=0;
            // this.quoteDefault[i]=0;
            // this.nPagamenti[i] = 0;
            // this.totPagamenti[i] = 0;
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
    //salvando quindi ogni form, cio?? ogni record Retta
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
    //?? stato inserito un nuovo pagamento: devo fare il refresh dei child: della lista (ChildPagamenti)
    this.ChildPagamenti.loadData();

    //ora dovrei fare il refresh del solo component rettamese interessato...quindi dovrei passare qui l'indice del component rettamese corretto
    //ma provo per ora a fare il refresh di tutti e 12 i component rettamese
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
    //Mancherebbe qui la possibilit?? di selezionare solo con le freccette e Enter
    if (this.formRetta.controls['nomeCognomeAlunno'].value != '') {
      this.matAutocomplete.options.first.select();
      //Questo ?? il valore che devo cercare: this.matAutocomplete.options.first.viewValue;
      this.alunniSvc.findIdAlunno(this.matAutocomplete.options.first.viewValue)
      .subscribe();
    }
  }


  selected(event: MatAutocompleteSelectedEvent): void {
    this.data.idAlunno = parseInt(event.option.id);
    this.formRetta.controls['alunnoID'].setValue(parseInt(event.option.id));
    this.loadData();
  }


  blur() {
     //l'unico caso che al momento non possiamo gestire ?? se non c'?? alcun elemento nella dropdown (se p.e. utente scrive "hh")
     //e anzi per non incorrere in errori in quel caso bisogna uscire dalla routine
    if (!this.matAutocomplete.options.first) return; 

    const stored = this.matAutocomplete.options.first.viewValue;
    //console.log ("stored", stored);
    const idstored = this.matAutocomplete.options.first.id;
    //console.log("idstored", idstored);
    //se uno cancella tutto si ritrova selezionato il primo della lista
    if (this.formRetta.controls['nomeCognomeAlunno'].value == "") {
      this.matAutocomplete.options.first.select();
    }
    

    this.alunniSvc.filterAlunniExact(this.formRetta.value.nomeCognomeAlunno).subscribe(val=>
      {
        if (!val) {
          this.data.idAlunno = parseInt(idstored);
        this.formRetta.controls['nomeCognomeAlunno'].setValue(stored)
        this.formRetta.controls['alunnoID'].setValue(parseInt(idstored));
        this.loadData();
        
      }
    })
  }

  mesePagamentoClicked (meseRettaClicked: number ){
    //ora devo passare queste informazioni a rettapagamento-edit
    this.ChildRettapagamentoEdit.formRetta.controls['causaleID'].setValue(1);
    this.ChildRettapagamentoEdit.formRetta.controls['meseRetta'].setValue(meseRettaClicked - 1);
  }


}
