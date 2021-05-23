import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, tap } from 'rxjs/operators';
import { FiltriService } from './filtri.service';

@Component({
  selector: 'app-filtri',
  templateUrl: './filtri.component.html',
  styleUrls: ['./filtri.component.css']
})
export class FiltriComponent implements OnInit {
  form! : FormGroup;

  constructor(private fb:             FormBuilder,
              private _filtriService:  FiltriService) {

    this.form = this.fb.group({
      idAlunno:       [null],
      idGenitore:     [null]
    });

    this._filtriService.getAlunno()
    .subscribe(
      val=>{
      if (val!=0 && val!= null && val!= undefined){
        this.form.controls['idAlunno'].setValue(val, {emitEvent:false});
      }
    });

    this._filtriService.getGenitore()
    .subscribe(
      val=>{
      if (val!=0 && val!= null && val!= undefined){
        this.form.controls['idGenitore'].setValue(val, {emitEvent:false});
      }
    });



   }

  ngOnInit(): void {
    this.form.controls['idAlunno'].valueChanges
    .pipe(
      debounceTime(500),
    )
    .subscribe(val=>
      {console.log("lancio:", val);
        this._filtriService.passAlunno(val)
    });

    this.form.controls['idGenitore'].valueChanges
    .pipe(
      debounceTime(500),
    )
    .subscribe(val=>
      {console.log("lancio:", val);
        this._filtriService.passGenitore(val)
    });
    

  }


  resetInput (formControlName: string) {
    this.form.controls[formControlName].setValue('');
  }

  resetAllInputs () {
    this.form.controls['idAlunno'].setValue('');
    this.form.controls['idGenitore'].setValue('');
  }


}
