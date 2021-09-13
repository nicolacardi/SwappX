import { Component, Input, OnInit} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RetteService } from '../rette.service';

import { PAG_Retta } from 'src/app/_models/PAG_Retta';

@Component({
  selector: 'app-rettamese-edit',
  templateUrl: './rettamese-edit.component.html',
  styleUrls: ['../pagamenti.css'],
})

export class RettameseEditComponent implements OnInit{

  @Input() public idRetta!: number; 
  @Input() public inputPagamenti!: number; 
  @Input() public indice!: number; //serve per poter azionare la save di ciascuna istanza di questo component
  @Input() public toHighlight!: number; 

  retta$!:                    Observable<PAG_Retta>;
  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  evidenzia:                  boolean = false;

  constructor(private fb:             FormBuilder,
              private svcRette:       RetteService,
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
  }
  
  ngOnChanges() {
    this.loadData();
    if (this.toHighlight == this.idRetta && this.toHighlight!= null) {this.evidenzia = true} else { this.evidenzia = false}
  }

  loadData(){
    if (this.idRetta && this.idRetta + '' != "0") {
      const obsRetta$: Observable<PAG_Retta> = this.svcRette.loadByID(this.idRetta);
      //const loadRetta$ = this._loadingService.showLoaderUntilCompleted(obsRetta$);
      this.retta$ = obsRetta$
      .pipe(
          tap(
            retta => {
              this.form.patchValue(retta);
              let totPagamenti = 0;
              retta.pagamenti?.forEach( val=>{
                totPagamenti = totPagamenti + val.importo;
              })
              this.form.controls['totPagamenti'].setValue(totPagamenti);
            }
          )
      );
    } else {
      this.emptyForm = true
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
    } 
    return true;
  }

  ConvertToNumber (x: string): number {
    return parseInt(x);
  }
}


