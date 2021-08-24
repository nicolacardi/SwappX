
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
  styleUrls: ['../pagamenti.css'],
})
export class RettameseEditComponent implements OnInit, AfterViewInit {

  @Input() public idRetta!: number; 


  @Input() public inputPagamenti!: number; 
  @Input() public placeholderMese!: string; 
  @Input() public indice!: number; 
  

  retta$!:                    Observable<PAG_Retta>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;

  constructor(private fb:             FormBuilder,
              private svcRette:       RetteService,
              ) { 

    this.form = this.fb.group({
      id:                     [null],
      annoID:                 [null],
      alunnoID:               [null],
      //alunno?:                 ALU_Alunno;
      
      anno:                   [null],
      mese:                   [null],
      quotaDefault:           [null],
      quotaConcordata:        [null],
      
      note:                   [null],
      dtIns:                  [null],
      dtUpd:                  [null],
      userIns:                [null],
      userUpd:                [null]
    });

  }

  ngOnInit() {   
    //console.log("ngOnChanges - idRetta: " , this.idRetta); 
  }

  ngOnChanges() {
    this.loadData();
  }
  ngAfterViewInit() {
    //console.log("ngAfterViewInit - idRetta: " , this.idRetta);
  }

  loadData(){
    if (this.idRetta && this.idRetta + '' != "0") {

      const obsRetta$: Observable<PAG_Retta> = this.svcRette.loadByID(this.idRetta);
      //const loadAlunno$ = this._loadingService.showLoaderUntilCompleted(obsAlunno$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.retta$ = obsRetta$
      .pipe(
          tap(
            retta => this.form.patchValue(retta)
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

  toNum (x: string): number {
    return parseInt(x);
  }


}


