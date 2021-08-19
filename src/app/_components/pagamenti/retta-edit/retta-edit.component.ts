import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { PAG_RettaObj } from 'src/app/_models/PAG_RetteObj';
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
  mesi:                      number[] = [];
  quoteConcordate:           number[] = [];
  quoteDefault:              number[] = [];
  totPagamenti:              number[] = [];
  nPagamenti:              number[] = [];
  public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  

  myObj2: PAG_RettaObj = { 
    meseX:[],
    quoteConcordateX:  [],
    quoteDefaultX:     []
  }
  

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
      c_SET:                      [0],
      c_OTT:                      [0],
      c_NOV:                      [0],
      c_DIC:                      [0],
      c_GEN:                      [0],
      c_FEB:                      [0],
      c_MAR:                      [0],
      c_APR:                      [0],
      c_MAG:                      [0],
      c_GIU:                      [0],
      c_LUG:                      [0],
      c_AGO:                      [0],

    });


  }

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    const obsRette$ = this.svcRette.loadByAlunnoAnno(this.data.idAlunno, this.data.idAnno);


    obsRette$
     .pipe(
       map(obj => { 
       console.log ("obj", obj);
       let n = 0;
       obj.forEach(z=>{
        this.mesi[obj[n].mese - 1] = obj[n].mese;
        this.quoteConcordate[obj[n].mese - 1] = obj[n].quotaConcordata;
        this.quoteDefault[obj[n].mese - 1] = obj[n].quotaDefault;
        this.totPagamenti[obj[n].mese-1] = 0;
        this.nPagamenti[obj[n].mese-1] = 0;
        obj[n].pagamenti?.forEach(x=>{
          console.log (x.importo);
          this.totPagamenti[obj[n].mese-1] = this.totPagamenti[obj[n].mese-1] + x.importo;
          this.nPagamenti[obj[n].mese-1] = this.nPagamenti[obj[n].mese-1] + 1;
        })

        // ele.items.forEach((item) => {
        //   sum += item.cost.costNum;


        n++;
      })   
       //this.quoteConcordate[obj[0].mese] = obj[0].quotaConcordata
       //this.quoteDefault[obj[0].mese] = obj[0].quotaDefault


    //   //  quoteConcordate[obj.mese] = obj.quotaConcordata;
    //   //  myObj2[found].quoteDefault[obj.mese] = obj.quotaDefault;
       
       
    //   //  arrObj.push(
    //   //    {
    //   //    'alunnoID': myObj2[found].alunnoID2,
    //   //    alunno : myObj2[found].alunno,
         
    //   //    'c_SET': myObj2[found].quoteConcordate[9], 
    //   //    'c_OTT': myObj2[found].quoteConcordate[10], 
    //   //    'c_NOV': myObj2[found].quoteConcordate[11],
    //   //    'c_DIC': myObj2[found].quoteConcordate[12],
    //   //    'c_GEN': myObj2[found].quoteConcordate[1],
    //   //    'c_FEB': myObj2[found].quoteConcordate[2],
    //   //    'c_MAR': myObj2[found].quoteConcordate[3],
    //   //    'c_APR': myObj2[found].quoteConcordate[4],
    //   //    'c_MAG': myObj2[found].quoteConcordate[5],
    //   //    'c_GIU': myObj2[found].quoteConcordate[6],
    //   //    'c_LUG': myObj2[found].quoteConcordate[7],
    //   //    'c_AGO': myObj2[found].quoteConcordate[8],

    //   //    'd_SET': myObj2[found].quoteDefault[9], 
    //   //    'd_OTT': myObj2[found].quoteDefault[10], 
    //   //    'd_NOV': myObj2[found].quoteDefault[11],
    //   //    'd_DIC': myObj2[found].quoteDefault[12],
    //   //    'd_GEN': myObj2[found].quoteDefault[1],
    //   //    'd_FEB': myObj2[found].quoteDefault[2],
    //   //    'd_MAR': myObj2[found].quoteDefault[3],
    //   //    'd_APR': myObj2[found].quoteDefault[4],
    //   //    'd_MAG': myObj2[found].quoteDefault[5],
    //   //    'd_GIU': myObj2[found].quoteDefault[6],
    //   //    'd_LUG': myObj2[found].quoteDefault[7],
    //   //    'd_AGO': myObj2[found].quoteDefault[8],
    //   //   });


    //   //  return arrObj;
       })
    )
    .subscribe( () => { 
      console.log (this.mesi);
      console.log (this.quoteConcordate);
      console.log (this.quoteDefault);
      console.log (this.totPagamenti);

    })

    
    
    
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
