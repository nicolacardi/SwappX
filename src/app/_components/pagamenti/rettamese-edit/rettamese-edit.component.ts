import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { RetteService } from '../rette.service';

@Component({
  selector: 'app-rettamese-edit',
  templateUrl: './rettamese-edit.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RettameseEditComponent implements OnInit {

  @Input() public inputConcordata!: number; 
  @Input() public inputDefault!: number; 
  @Input() public inputPagamenti!: number; 
  @Input() public placeholderMese!: string; 
  @Input() public indice!: number; 
  @Input() public IDRetta!: number; 

  
  form! :                             FormGroup;
  



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

  }

  salva() {

    //NON RIESCO A FARE FUNZIONARE QUESTA
    //console.log (this.placeholderMese, this.indice, this.IDRetta)
    if (this.IDRetta) {
      //put

      this.form.controls['id'].setValue(this.IDRetta);
      if (!this.form.controls['quotaDefault'].dirty) this.form.controls['quotaDefault'].setValue(this.inputDefault);
      if (!this.form.controls['quotaConcordata'].dirty) this.form.controls['quotaConcordata'].setValue(this.inputConcordata);

      this.svcRette.put(this.form.value); 
      //Attenzione! 
      //ho provato da swagger con {id: 4, quotaDefault: 500, quotaConcordata: "3"} credendo che il problema fosse la quota concordata stringa, MA:
      //The UPDATE statement conflicted with the FOREIGN KEY constraint "FK_PAG_Rette_ALU_Alunni". 
      //The conflict occurred in database "SwappXDB", table "dbo.ALU_Alunni", column 'ID'.

      //console.log("put/update");
    } else {
      //post
      //console.log("post/insert");
    }
  }
}
