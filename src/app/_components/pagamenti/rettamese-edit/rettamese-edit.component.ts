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

  @Input() public idRetta!: number; 

  @Input() public inputConcordata!: number; 
  @Input() public inputDefault!: number; 
  @Input() public inputPagamenti!: number; 
  @Input() public placeholderMese!: string; 
  @Input() public indice!: number; 
  

  retta$!:                    Observable<PAG_Retta>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;

  constructor(private fb:             FormBuilder,
              private svcRette:       RetteService) { 

    /*
    this.form = this.fb.group({
      id:                           [null],
      quotaDefault:                 [0],
      quotaConcordata:              [0],
      //pagamenti:                  [0],
    });
    */
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

    console.log("Constructor - idRetta: " , this.idRetta);

  }

  ngOnInit() {
    console.log("ngOnInit - idRetta: " , this.idRetta);

    this.loadData();
    // this.retta$ = this.svcRette.loadByID(this.IDRetta)
    //    .pipe(
    //      tap(
    //        retta => this.form.patchValue(retta)
    //      )
    //    );

    
  }
  ngAfterViewInit() {
    console.log("ngAfterViewInit - idRetta: " , this.idRetta);

    console.log("ngAfterViewInit - control.idRetta: " , this.form.controls['quotaConcordata'].value);
    
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

  save(){



    if (this.idRetta && this.form.dirty) {

      console.log("ID Retta: " , this.idRetta);
      console.log("form: " ,this.form.value);


      // if (this.form.controls['id'].value == null) 
      //   this.svcRette.post(this.form.value)
      //     .subscribe(res=> {
      //       console.log("return from post");
      //       //this._dialogRef.close();
      //     },
      //     err=> (
      //       console.log("ERRORE POST")
      //     // this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      //     )
      // );
      // else 

  
    
        // this.retta$.pipe(
        //   tap( val => val.quotaConcordata = this.form.controls['quotaConcordata'].value),
        //   tap(
        //     x=> console.log("andrea: " , x)
        //   )
        //   );
        
        this.svcRette.put(this.form.value)
        //this.svcRette.put(this.retta$)
          .subscribe(res=> {
            console.log("return from put", res);
            //this._dialogRef.close();
          },
          err=> (
            console.log("ERRORE PUT")
            //this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
      );
    }
    //this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
  }

  salva_old() {

    //NON RIESCO A FARE FUNZIONARE QUESTA
    
    if (this.idRetta && this.form.dirty) {
    
      console.log ("SALVA: " , this.placeholderMese, this.indice, this.idRetta)
      //put

       //this.form.controls['id'].setValue(this.idRetta);

      this.retta$ = this.svcRette.loadByID(this.idRetta)
       .pipe(
         tap(
         x=> console.log("LoadByID: " , x)
         )
       );

       /*
       this.alunniSvc.findIdAlunno(this.matAutocomplete.options.first.viewValue)
       .pipe(
         tap(val=> this._alunnoDashboardNewService.passAlunno(val.id))
       )
       .subscribe();
     }
     */
       console.log("QUI: " , this.retta$);

       /*

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
*/

    } else {
      //post
    }
  }
}
function MergeMap(arg0: (val: any) => void): import("rxjs").OperatorFunction<PAG_Retta, PAG_Retta> {
  throw new Error('Function not implemented.');
}

