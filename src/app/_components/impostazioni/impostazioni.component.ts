import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

//models
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';

//components
import { SnackbarComponent } from '../utilities/snackbar/snackbar.component';

//services 
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
  form! :                             UntypedFormGroup;
  
  public mesiArr =            [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=  ["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
  
  public parAnnoCorrente!:              _UT_Parametro;
  public parQuoteDefault!:              _UT_Parametro;
  public parQuoteRidotteFratelli!:      _UT_Parametro;

  private arrElab = [true, false, false];
  private arrMsg!: boolean[];


  @ViewChildren('QuoteListElement') QuoteList!: QueryList<any>;
  
  constructor(
    private fb:                       UntypedFormBuilder, 
    private svcAnni:                  AnniScolasticiService,
    private svcParametri:             ParametriService,
    private _snackBar:                MatSnackBar,
    private _loadingService :         LoadingService )  {

    let obj = localStorage.getItem('AnnoCorrente');

    this.form = this.fb.group({
      // selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
      selectAnnoScolastico: "",
      quoteRidotteFratelli : false
    });

    this.svcParametri.getByParName('AnnoCorrente').subscribe(
      par=>{
        this.parAnnoCorrente = par;
        this.form.controls['selectAnnoScolastico'].setValue(parseInt(par.parValue));
      }
    );

    this.svcParametri.getByParName('QuoteDefault').subscribe(
      par=>{
        this.parQuoteDefault = par;
      }
    );

    this.svcParametri.getByParName('QuoteRidotteFratelli').subscribe(
      par=>{
        this.parQuoteRidotteFratelli = par;
        this.form.controls['quoteRidotteFratelli'].setValue(JSON.parse(par.parValue));
      }
    );
  }

  ngOnInit(): void {
    this.obsAnni$= this.svcAnni.list();
  }

  save(){

    //Anno scolastico
    this.parAnnoCorrente.parValue = this.form.controls['selectAnnoScolastico'].value;
    this.svcParametri.put(this.parAnnoCorrente).subscribe(
      res=>{
        this.setMessage(0);
      },
      err=>{
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio [Anno Scolastico]', panelClass: ['red-snackbar']});
      }
    ); 

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
      res=> this.setMessage(1),
      err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio [Quote Default]', panelClass: ['red-snackbar']})
    );
  
    this.parQuoteRidotteFratelli.parValue = this.form.controls['quoteRidotteFratelli'].value;
    this.svcParametri.put(this.parQuoteRidotteFratelli).subscribe(
      res=> this.setMessage(2),
      err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio [Quote Fratelli]', panelClass: ['red-snackbar']})
    ); 
  }

  //TODO: refactoring
  setMessage(n: number){
    this.arrElab[n]= true;

    let tuttiTrue= true;
    this.arrElab.forEach(
      x=> {
        if(x == false) tuttiTrue = false; 
      }
    )
    if(tuttiTrue){
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Parametri salvati', panelClass: ['green-snackbar']});
    }
  }
}  
