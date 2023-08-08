//#region ----- IMPORTS ------------------------
import { Component, ElementRef, OnInit, ViewChild }                    from '@angular/core';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatDialog }                            from '@angular/material/dialog';

//components
import { DialogOkComponent }                    from '../../../_components/utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                    from '../../../_components/utilities/snackbar/snackbar.component';
import { Utility }                              from '../../../_components/utilities/utility.component';

//services
import { ParametriService }                     from 'src/app/_services/parametri.service';

//models
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';
//#endregion

@Component({
  selector: 'app-fileuploads',
  templateUrl: './fileuploads.component.html',
  styleUrls: ['../impostazioni.component.css']
})

export class FileuploadsComponent implements OnInit {

//#region ----- Variabili ----------------------
  logoScuolaEmail!:                             _UT_Parametro;
  timbroScuola!:                             _UT_Parametro;

  imgFileLogoScuolaEmail!:                      string;
  imgFileTimbroScuola!:                         string;

  foto!:                                        string;
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('logoScuolaEmail', {static: false}) logoScuolaEmailDOM!: ElementRef;
  @ViewChild('timbroScuola', {static: false}) timbroScuolaDOM!: ElementRef;

//#endregion

//#region ----- Constructor --------------------
  constructor(public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar,
              private svcParametri:             ParametriService ) { }
//#endregion


  ngOnInit(): void {
    this.svcParametri.getByParName("imgFileLogoScuolaEmail").subscribe(
      val=> {
        if(val){
          this.logoScuolaEmail = val;
          this.imgFileLogoScuolaEmail = val.parValue; 
        }
      }
    );

    this.svcParametri.getByParName("imgFileTimbroScuola").subscribe(
      val=> {
        if(val){
          this.timbroScuola = val;
          this.imgFileTimbroScuola = val.parValue; 
        }
      }
    );

  }

  onImageChange(e: any, ctrl: string) {


    if (e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      if (e.target.files[0].size > 200000) {
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: { titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)" }
        });
        return;
      };




    
    const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {

        if (ctrl == 'imgFileLogoScuolaEmail') 
        {this.imgFileLogoScuolaEmail = reader.result as string;
          await Utility.compressImage( this.imgFileLogoScuolaEmail, 200, 200)
          .then(compressed => {
            this.logoScuolaEmailDOM.nativeElement.src = compressed;
            this.save(ctrl);
          });
        }

        if (ctrl == 'imgFileTimbroScuola') 
        {this.imgFileTimbroScuola = reader.result as string;
          await Utility.compressImage( this.imgFileTimbroScuola, 200, 200)
          .then(compressed => {
            this.timbroScuolaDOM.nativeElement.src = compressed;
            this.save(ctrl);
          });
        }

      };
    }
  }


  save(ctrl: string){


    let formParameter: _UT_Parametro = {
      id: ctrl == 'imgFileLogoScuolaEmail'? this.logoScuolaEmail.id : this.timbroScuola.id,
      parName: ctrl,
      parDescr: ctrl == 'imgFileLogoScuolaEmail'? "Logo della scuola" : "Timbro della scuola",
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