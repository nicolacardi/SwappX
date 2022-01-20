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
  
  public mesiArr =            [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=  ["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
  //public QuoteDefault =            "000000000000";
  public objQuoteDefault!:       _UT_Parametro;

  @ViewChildren('QuoteList') QuoteList!: QueryList<ElementRef>;
  

  constructor(
    private fb:                       FormBuilder, 
    private svcAnni:                  AnniScolasticiService,
    private svcParametri:             ParametriService,
    private _snackBar:                MatSnackBar,
    private _loadingService :         LoadingService )  {

    let obj = localStorage.getItem('AnnoCorrente');

    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    });

    this.svcParametri.loadParametro('QuoteDefault')
      .subscribe(x=>{
        this.objQuoteDefault = x;
      }
    );

  }

  ngOnInit(): void {
    this.obsAnni$= this.svcAnni.load();

  }

  save(){

    // var formData: _UT_Parametro = {
    //   id:             this.currUser.userID,   
    //   parName:        this.form.controls.username.value,
    //   parDescr:       this.form.controls.email.value,
    //   parValue:       this.form.controls.fullname.value,
    // };


    this.objQuoteDefault.parValue = "111111111111";

console.log("QUOTE LIST: ",this.QuoteList);

console.log("QUOTE LIST foreach: ",this.QuoteList.forEach);

this.QuoteList.forEach(writer => console.log(writer));



//this.QuoteList.forEach();
    this.svcParametri.put(this.objQuoteDefault).subscribe( 
      res=>{
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Parametri salvati', panelClass: ['green-snackbar']})
      },
      err=>{
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      }
    );

    /*
    export interface _UT_Parametro {
    id:                 number;
    parName:            string;
    parDescr:           string;
    parValue:           string;
  }

     save(){

    var formData = {
      userID:     this.currUser.userID,   
      UserName:   this.form.controls.username.value,
      Email:      this.form.controls.email.value,
      FullName:   this.form.controls.fullname.value,
    };

    this.svcUser.put(formData).subscribe(
      ()=> {
        this.currUser.username = this.form.controls.username.value;
        this.currUser.email =this.form.controls.email.value;
        this.currUser.fullname = this.form.controls.fullname.value;

        localStorage.setItem('currentUser', JSON.stringify(this.currUser));
      },
      err => {
        console.log("ERRORE this.svcUser.put", formData);
      }
    );

    if(this.immagineDOM != undefined){
      this.fotoObj.userID = this.currUser.userID;
      this.fotoObj.foto = this.immagineDOM.nativeElement.src;

      this.svcUser.saveUserFoto(this.fotoObj)
      .subscribe(() => {
          this.eventEmitterService.onAccountSaveProfile();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Profilo salvato', panelClass: ['green-snackbar']});
        }
      );
    }
  }
    */
  }
}  
