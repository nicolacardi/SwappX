import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, tap } from 'rxjs/operators';
import { FiltriService } from './filtri.service';

@Component({
  selector: 'app-filtri',
  templateUrl: './filtri.component.html',
  styleUrls: ['./filtri.component.css']
})
export class FiltriComponent implements OnInit , AfterViewInit{
  form! : FormGroup;

  constructor(private fb:             FormBuilder,
              private _filtriService:  FiltriService) {

    this.form = this.fb.group({
      id:       [null]
    });

    this._filtriService.getData()
    .subscribe(
      val=>{
      if (val!=0 && val!= null && val!= undefined){
        this.form.controls['id'].setValue(val, {emitEvent:false});
      }
    });

   }

  ngOnInit(): void {
    this.form.controls['id'].valueChanges
    .pipe(
      debounceTime(500),
    )
    .subscribe(val=>
      {console.log("lancio:", val);
        this._filtriService.passData(val)
      });
    

  }


  ngAfterViewInit() {

  }
  resetInput () {
    this.form.controls['id'].setValue('');
  }
  resetAllInputs () {
    this.form.controls['id'].setValue('');
  }


}
