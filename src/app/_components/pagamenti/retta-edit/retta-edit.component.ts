import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { RetteService } from '../rette.service';

@Component({
  selector: 'app-retta-edit',
  templateUrl: './retta-edit.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RettaEditComponent implements OnInit {

  public obsRette$!:          Observable<PAG_Retta[]>;
  idAlunno!:                  number;
  idAnno!:                    number;
  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;

  breakpoint!:                number;
  quoteConcordate!:           number[];

  constructor(public _dialogRef: MatDialogRef<RettaEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private fb:             FormBuilder, 
              public _dialog:         MatDialog,
              private svcRette:       RetteService, 
              private _snackBar:      MatSnackBar,
              private _loadingService :LoadingService  
              ) 
  { 


    this.form = this.fb.group({
      id:                         [null],
      alunnoID:                   [''],
      c_SET:            [0],
      c_OTT:               [0],
    }
    
  

    
    );


    //this.idAlunno = data.idAlunno;

  }

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    const obsRette$ = this.svcRette.loadByAlunnoAnno(this.data.idAlunno, this.data.idAnno);


    obsRette$
    .pipe(
      tap (
        a => {
          this.quoteConcordate[a.mese] = a.quotaConcordata{

          } 
        }
      )
    )

    
    
    
  }

  delete() {
    //TODO
  }

  save() {
    //TODO
  }

  onResize(e: Event) {
    //TODO
  }


}
