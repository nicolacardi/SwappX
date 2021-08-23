import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  constructor(private fb:             FormBuilder,) { 

    this.form = this.fb.group({
      quotaDefault:                 [0],
      quotaConcordata:              [0],
      //pagamenti:                  [0],
    });

  }

  ngOnInit(): void {
  }

  salva() {
    console.log (this.placeholderMese, this.indice, this.IDRetta)
    if (this.IDRetta) {
      //put in cui passiamo l'ID separatamente (nel form non c'è)
    } else {
      //post in cui passiamo l'ID separatamente (nel form non c'è)
    }
  }
}
