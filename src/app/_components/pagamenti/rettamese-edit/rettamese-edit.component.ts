//TODO ngOnChanges scatta un numero enorme di volte su hover della lista pagamenti

import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RetteService } from '../rette.service';

import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { MatDialog } from '@angular/material/dialog';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

@Component({
  selector: 'app-rettamese-edit',
  templateUrl: './rettamese-edit.component.html',
  styleUrls: ['../pagamenti.css'],
})

export class RettameseEditComponent implements OnInit{

  @Input() public idRetta!: number; 

  private idRettaSubject = new BehaviorSubject<number>(0);
  idRettaObs$: Observable<number> = this.idRettaSubject.asObservable();
  @Input() public inputPagamenti!: number; 
  @Input() public indice!: number; //serve per poter azionare la save di ciascuna istanza di questo component
  //@Input() public toHighlight!: number; 


  @Output('mesePagamentoClicked')
  clickOnpagamentoEmitter = new EventEmitter<number>();

  // quotaConcordata!:           number;
  // quotaDefault!:              number;
  totPagamenti!:              number;
  retta$!:                    Observable<PAG_Retta>;
  obsIdRetta$!:               Observable<number>;
  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  evidenzia:                  boolean = false;

  constructor(private fb:             FormBuilder,
              private svcRette:       RetteService,
              public _dialog:         MatDialog,
              ) { 

    this.form = this.fb.group({
      id:                     [null],
      annoID:                 [null],
      alunnoID:               [null],
      //alunno?:                 ALU_Alunno;
      
      annoRetta:              [null],
      meseRetta:              [null],
      quotaDefault:           [null],
      quotaConcordata:        [null],
      totPagamenti:           [null],
      
      note:                   [null],
      dtIns:                  [null],
      dtUpd:                  [null],
      userIns:                [null],
      userUpd:                [null]
    });

  }

  ngOnInit(): void {
    // const tmpRetta: Observable <PAG_Retta> =  of();
    // this.retta$ = tmpRetta;

    //E' stato creato un behaviorSubject per valorizzarlo quando opportuno (con .next su ngOnChanges)
    //in questo modo solo all'arrivo di idRetta si fa scattare la loadData
    //La load Data non deve per?? scattare quando si tratta di nuovo Pagamento 
    //oppure se l'alunno non ha pagamenti (in entrambi i casi idRettaObs emette 0)
    this.idRettaObs$
    .pipe(
      tap(
      val=>{
        if (val!=0) {
          this.loadData()
          this.emptyForm = false;
        }
        else { 
          //di qua passa se ?? un Nuvo Pagamento oppure se ho selezionato un Alunno senza quote
          this.emptyForm = true;
          this.form.reset(); 
        }
      })
    )
    .subscribe()
  }
  

  ngOnChanges() {
    //non vogliamo che venga lanciata la loadData fin che idRetta ?? undefined
    //per questo motivo abbiamo introdotto un behaviorSubject
    if (this.idRetta != undefined) { 
        this.idRettaSubject.next(this.idRetta);
    }

    //if (this.toHighlight == this.idRetta && this.toHighlight!= null) {this.evidenzia = true} else { this.evidenzia = false}
  }

  loadData(){
    //per di qua in caso di nuovo pagamento non passa nemmeno una volta -> non esiste retta$
    //console.log ("this.idRetta", this.idRetta);
    //this.idRetta = 0 nel caso di alunno che non ha quote
    if (this.idRetta && this.idRetta + '' != "0") {
      const obsRetta$: Observable<PAG_Retta> = this.svcRette.loadByID(this.idRetta);
      //const loadRetta$ = this._loadingService.showLoaderUntilCompleted(obsRetta$);
      this.retta$ = obsRetta$
      .pipe(
          tap(
            retta => {
              //console.log ("dentro qua");
              this.form.patchValue(retta);
              let totPagamenti = 0;
              retta.pagamenti?.forEach( val=>{
                totPagamenti = totPagamenti + val.importo;
              })
              this.form.controls['totPagamenti'].setValue(totPagamenti);
            }
          )
      );
    }
  }

  save(): boolean{
    
    if (this.idRetta && this.form.dirty) {
        this.svcRette.put(this.form.value)
          .subscribe(res=> {
            //return true;
          },
          err=>  {
            //return false;
          }
      );
    } else {
      //post
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Selezionare prima un Alunno"}
      });
      this.form.reset();
    }
    return true;
  }

  ConvertToNumber (x: string): number {
    return parseInt(x);
  }

  clickOnPagamento() {
    this.clickOnpagamentoEmitter.emit(this.form.controls['meseRetta'].value);
  }
}


