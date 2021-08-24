import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { RetteService } from '../rette.service';

@Component({
  selector: 'app-rettamese-edit',
  templateUrl: './rettamese-edit.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RettameseEditComponent implements OnInit, AfterViewInit {

  @Input() public inputConcordata!: number; 
  @Input() public inputDefault!: number; 
  @Input() public inputPagamenti!: number; 
  @Input() public placeholderMese!: string; 
  @Input() public indice!: number; 
  @Input() public IDRetta!: number; 

  form! :                             FormGroup;
  retta$!:                            Observable<PAG_Retta>;

  constructor(private fb:             FormBuilder,
              private svcRette:       RetteService) { 

    this.form = this.fb.group({
      id:                           [null],
      quotaDefault:                 [0],
      quotaConcordata:              [0],
      //pagamenti:                  [0],
    });

  }

  ngOnInit(): void {
    this.retta$ = this.svcRette.loadByID(this.IDRetta)
    .pipe(
      tap(
        retta => this.form.patchValue(retta)
      )
    );
  }

  ngAfterViewInit() {
    //console.log("input IDRetta", this.IDRetta);

  }

  salva() {

    //NON RIESCO A FARE FUNZIONARE QUESTA
    console.log (this.placeholderMese, this.indice, this.IDRetta)
    if (this.IDRetta && this.form.dirty) {
      //put

       this.form.controls['id'].setValue(this.IDRetta);
       
       if (!this.form.controls['quotaDefault'].dirty) this.form.controls['quotaDefault'].setValue(this.inputDefault);
       if (!this.form.controls['quotaConcordata'].dirty) this.form.controls['quotaConcordata'].setValue(this.inputConcordata);
      
       this.retta$
      .pipe(
        map(val=>{
          console.log(val);
          val.quotaConcordata = this.form.controls['quotaConcordata'].value;
          val.quotaDefault = this.form.controls['quotaDefault'].value;
          delete val.alunno;
          delete val.pagamenti;
          console.log("dopo patch value", val);
          console.log("ritorno put", this.svcRette.put(val));
        })
      ).subscribe();

    } else {
      //post
    }
  }
}
function MergeMap(arg0: (val: any) => void): import("rxjs").OperatorFunction<PAG_Retta, PAG_Retta> {
  throw new Error('Function not implemented.');
}

