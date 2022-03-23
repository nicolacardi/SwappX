//TODO ngOnChanges scatta un numero enorme di volte su hover della lista pagamenti

import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

//components
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { RetteService } from '../rette.service';

//models
import { PAG_Retta } from 'src/app/_models/PAG_Retta';

@Component({
  selector: 'app-rettamese-edit',
  templateUrl: './rettamese-edit.component.html',
  styleUrls: ['../pagamenti.css'],
})

export class RettameseEditComponent implements OnInit{

//#region ----- Variabili -------
  private idRettaSubject = new BehaviorSubject<number>(0);
  idRettaObs$: Observable<number> = this.idRettaSubject.asObservable();
  // quotaConcordata!:           number;
  // quotaDefault!:              number;
  totPagamenti!:              number;
  retta$!:                    Observable<PAG_Retta>;
  obsIdRetta$!:               Observable<number>;
  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  evidenzia:                  boolean = false;
//#endregion

//#region ----- ViewChild Input Output -------

  @Input() public idRetta!: number; 
  // @Input() public inputPagamenti!: number; 

  @Input() public indice!: number; //serve per poter azionare la save di ciascuna istanza di questo component
  //@Input() public toHighlight!: number; 

  @Output('mesePagamentoClicked')
  clickOnpagamentoEmitter = new EventEmitter<number>();
//#endregion

  constructor(
    private fb:             FormBuilder,
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

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    //non vogliamo che venga lanciata la loadData fin che idRetta è undefined
    //per questo motivo abbiamo introdotto un behaviorSubject
    if (this.idRetta != undefined) { 
        this.idRettaSubject.next(this.idRetta);
    }

    //if (this.toHighlight == this.idRetta && this.toHighlight!= null) {this.evidenzia = true} else { this.evidenzia = false}
  }

  ngOnInit(): void {

    //E' stato creato un behaviorSubject per valorizzarlo quando opportuno (con .next su ngOnChanges)
    //in questo modo solo all'arrivo di idRetta si fa scattare la loadData
    //La load Data non deve però scattare quando si tratta di nuovo Pagamento 
    //oppure se l'alunno non ha pagamenti (in entrambi i casi idRettaObs emette 0)
    this.idRettaObs$.pipe(
      tap( val=> {
        if (val!=0) {
          this.loadData()
          this.emptyForm = false;
        }
        else { 
          //di qua passa se è un Nuovo Pagamento oppure se ho selezionato un Alunno senza quote
          this.emptyForm = true;
          this.form.reset(); 
        }
      })
    )
    .subscribe()


    // if (this.idRetta && this.idRetta + '' != "0") {
    //   this.loadData();
    // }

  }
  
  loadData(){
    //per di qua in caso di nuovo pagamento non passa nemmeno una volta -> non esiste retta$
    //this.idRetta = 0 nel caso di alunno che non ha quote
    if (this.idRetta && this.idRetta + '' != "0") {
      const obsRetta$: Observable<PAG_Retta> = this.svcRette.get(this.idRetta);
      this.retta$ = obsRetta$
      .pipe(
          tap(
            retta => {
              this.form.patchValue(retta);
              this.totPagamenti = 0;
              retta.pagamenti?.forEach( val=>{
                this.totPagamenti = this.totPagamenti + val.importo;
              })
              this.form.controls['totPagamenti'].setValue(this.totPagamenti);
            }
          )
      );
    }


  }
//#endregion

//#region ----- Operazioni CRUD -------
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
//#endregion

//#region ----- Altri metodi -------
  ConvertToNumber (x: string): number {
    return parseInt(x);
  }

  clickOnPagamento() {
    this.clickOnpagamentoEmitter.emit(this.form.controls['meseRetta'].value);
  }
//#endregion
}


