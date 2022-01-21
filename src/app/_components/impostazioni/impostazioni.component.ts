import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';

import { SnackbarComponent } from '../utilities/snackbar/snackbar.component';

import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { ParametriService } from 'src/app/_services/parametri.service';
import { LoadingService } from '../utilities/loading/loading.service';

@Component({
  selector: 'app-impostazioni',
  templateUrl: './impostazioni.component.html',
  styleUrls: ['./impostazioni.component.css']
})

export class ImpostazioniComponent implements OnInit {

  obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  form! :                             FormGroup;
  
  public parAnnoCorrente!:       _UT_Parametro;

  public mesiArr =            [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=  ["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
  public parQuoteDefault!:       _UT_Parametro;

  @ViewChildren('QuoteListElement') QuoteList!: QueryList<any>;
  
  constructor(
    private fb:                       FormBuilder, 
    private svcAnni:                  AnniScolasticiService,
    private svcParametri:             ParametriService,
    private _snackBar:                MatSnackBar,
    private _loadingService :         LoadingService )  {

    let obj = localStorage.getItem('AnnoCorrente');

    this.form = this.fb.group({
      // selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
      selectAnnoScolastico: ""
    });

    this.svcParametri.loadParametro('AnnoCorrente')
      .subscribe(par=>{
        this.parAnnoCorrente = par;
        this.form.controls['selectAnnoScolastico'].setValue(parseInt(this.parAnnoCorrente.parValue));
      }
    );



    this.svcParametri.loadParametro('QuoteDefault')
      .subscribe(par=>{
        this.parQuoteDefault = par;

      }
    );
  }

  ngOnInit(): void {
    this.obsAnni$= this.svcAnni.load()
    // .pipe (
    //   x=> {this.form.controls['selectAnnoScolastico'].setValue(x.)}
    // )
    ;

  }

  save(){

    //Costruisco la stringa del parametro QuoteDefault
    let arrCheckboxes = this.QuoteList.toArray();
    let strCheckboxes="";

    arrCheckboxes.forEach(element => {
      if(element.checked == true)
        strCheckboxes += "1";
      else
        strCheckboxes += "0";
    });
    this.parQuoteDefault.parValue = strCheckboxes;


    this.svcParametri.put(this.parQuoteDefault).subscribe( 
        res=>{
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Parametri salvati', panelClass: ['green-snackbar']})
        },
        err=>{
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        }
      );
  
  }
}  
