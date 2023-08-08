//#region ----- IMPORTS ------------------------
import { Component, ElementRef, OnInit, ViewChild }                    from '@angular/core';
import { Subscription } from 'rxjs';

//components
import { DialogOkComponent }                    from '../../../_components/utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                    from '../../../_components/utilities/snackbar/snackbar.component';
import { Utility }                              from '../../../_components/utilities/utility.component';

//services
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';
import { ParametriService } from 'src/app/_services/parametri.service';


//#endregion

@Component({
  selector: 'app-fileuploads',
  templateUrl: './fileuploads.component.html',
  styleUrls: ['../impostazioni.component.css']
})

export class FileuploadsComponent implements OnInit {

//#region ----- Variabili ----------------------
  logoScuolaEmail!:                             _UT_Parametro;
  imgFile!:                                     string;
  foto!:                                        string;
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('logoScuolaEmail', {static: false}) logoScuolaEmailDOM!: ElementRef;
//#endregion

//#region ----- Constructor --------------------
  constructor(public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar,
              private svcParametri:             ParametriService ) { }
//#endregion


  ngOnInit(): void {
    this.svcParametri.getByParName("LogoScuolaEmail").subscribe(
      val=> {
        if(val){
          this.logoScuolaEmail = val;
          this.imgFile = val.parValue; 
        }
      }
    );

  }

  onImageChange(e: any) {
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      if(e.target.files[0].size > 200000){
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)"}
        });
        return;
      };

    const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        this.imgFile = reader.result as string;
        await Utility.compressImage( this.imgFile, 200, 200)
          .then(compressed => {
            this.logoScuolaEmailDOM.nativeElement.src = compressed;
            this.save();
          });
      };
    }
  }


  save(){
    let formParameter: _UT_Parametro = {
      id: this.logoScuolaEmail.id,
      parName: "logoScuolaEmail",
      parDescr: "Logo della scuola da inserire nelle email",
      parValue: this.logoScuolaEmailDOM.nativeElement.src
    };

    console.log ("QUI1", formParameter);
    if(this.logoScuolaEmailDOM != undefined){
      this.svcParametri.put(formParameter).subscribe( () => {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'parametro salvato', panelClass: ['green-snackbar']});
        }
      );
    }
    
  }
}