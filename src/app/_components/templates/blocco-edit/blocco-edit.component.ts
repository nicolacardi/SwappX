import { Component, ElementRef, Inject, OnInit, ViewChild }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn }               from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { iif, Observable }                      from 'rxjs';
import { concatMap, tap }                       from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { tooWideValidator, tooHighValidator}    from '../../utilities/crossfieldvalidators/tooWide';
import { ColorPickerComponent }                 from '../../color-picker/color-picker.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { BlocchiService }                       from '../blocchi.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { BlocchiFotoService }                   from '../blocchifoto.service';

//models
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';
import { TEM_BloccoFoto }                       from 'src/app/_models/TEM_BloccoFoto';
import { TEM_BloccoTesto } from 'src/app/_models/TEM_BloccoTesto';
import { BlocchiTestiService } from '../blocchitesti.service';






@Component({
  selector: 'app-blocco-edit',
  templateUrl: './blocco-edit.component.html',
  styleUrls: ['../templates.css']
})
export class BloccoEditComponent implements OnInit {
//#region ----- Variabili -------
  blocco$!:                                     Observable<TEM_Blocco>
  form! :                                       UntypedFormGroup;
  imgFile!:                                     string;
  tipoBloccoDesc!:                              string;




//#endregion


@ViewChild('myImg', {static: false}) immagineDOM!: ElementRef;


  constructor(
    @Inject(MAT_DIALOG_DATA) public bloccoID:   number,
    private fb:                                 UntypedFormBuilder, 
    private svcBlocchi:                         BlocchiService,
    private svcBlocchiFoto:                     BlocchiFotoService,
    private svcBlocchiTesti:                    BlocchiTestiService,

    public _dialogRef:                          MatDialogRef<BloccoEditComponent>,
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    private _loadingService :                   LoadingService,
    
  ) { 

    this.form = this.fb.group(
      {
        id:                                     [null],
        paginaID:                               [0],
        x:                                      [0],
        y:                                      [0],
        w:                                      [0],
        h:                                      [0],
        color:                                  [''],
        testo:                                  [''],
        ckFill:                                 [],
        tipoBloccoID:                           [0],
        bloccoFotoID:                           [0],
        bloccoTestoID:                          [0]
      }, { validators: [tooWideValidator, tooHighValidator]});


  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    if (this.bloccoID && this.bloccoID + '' != "0") {

      //SUCCEDE QUALCOSA, FoRSe IL REFRESH (EMIT ecc. va a cancellare bloccotestoID/bloccofotoID)
      const obsBlocco$: Observable<TEM_Blocco> = this.svcBlocchi.get(this.bloccoID);
      const loadBlocco$ = this._loadingService.showLoaderUntilCompleted(obsBlocco$);
      this.blocco$ = loadBlocco$
      .pipe(
          tap(
            blocco => {
              console.log ("blocco edit - loadData - blocco:", blocco);
              this.tipoBloccoDesc = blocco.tipoBlocco!.descrizione;

              this.form.patchValue(blocco);
              //this.form.controls.bloccoFotoID.setValue(blocco.bloccoFotoID?blocco.bloccoFotoID: 0);
              //this.form.controls.bloccoTestoID.setValue(blocco.bloccoTestoID?blocco.bloccoTestoID: 0);
              console.log ("form patched", this.form.value);

            }
          )
      );
    }

  }
//#endregion

save(){
  console.log("form blocco da salvare", this.form.value);


  if (this.tipoBloccoDesc == "Immagine" && this.immagineDOM != undefined) {

    if (this.form.controls.bloccoFotoID.value) {
      let fotoObj : TEM_BloccoFoto = {
        id:this.form.controls.bloccoFotoID.value,
        foto: this.immagineDOM.nativeElement.src
      }
      console.log (this.immagineDOM.nativeElement.src);
      this.svcBlocchiFoto.put(fotoObj)
      .pipe(
        concatMap( ()=> this.svcBlocchi.put(this.form.value))
      )
      .subscribe( res=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']}),
                  err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      )
    } else {
      let fotoObj : TEM_BloccoFoto = {
        id:this.form.controls.bloccoFotoID.value,
        foto: this.immagineDOM.nativeElement.src
      }
      console.log (this.immagineDOM.nativeElement.src);
      this.svcBlocchiFoto.put(fotoObj)
      .pipe(
        tap(bloccoFoto=> {
          this.form.controls.bloccoFotoID.setValue(bloccoFoto.id)
            console.log ("blocco-edit save this.bloccoID:", bloccoFoto.id)
        }),
        concatMap( ()=> this.svcBlocchi.put(this.form.value))
      )
      .subscribe( res=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']}),
                  err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      )
      
    }


  } else if (this.tipoBloccoDesc == "Testo") {
    let testoObj! : TEM_BloccoTesto;

    if (this.form.controls.bloccoTestoID.value) {
      testoObj = {
        id: this.form.controls.bloccoTestoID.value,
        testo: this.form.controls.testo.value
      }
      this.svcBlocchiTesti.put(testoObj)
      .pipe (
        concatMap( ()=> this.svcBlocchi.put(this.form.value))
      )
      .subscribe( res=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']}),
                  err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      )
    } else {
      testoObj = {
        testo: this.form.controls.testo.value
      }
      this.svcBlocchiTesti.post(testoObj)
      .pipe (
        tap(bloccoTesto=> {
          this.form.controls.bloccoTestoID.setValue(bloccoTesto.id);
          console.log ("ho salvato in blocchitesti con id", bloccoTesto.id);
        }),
        concatMap( ()=> this.svcBlocchi.put(this.form.value))
      )
      .subscribe( res=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']}),
                  err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      )
    }



    


   
  }




}

  delete() {

    //serve la delete anche dei record di BlocchiFoto e BlocchiTesti correlati TODO
    this.svcBlocchi.delete(this.bloccoID).subscribe(
      res=>{
        this._snackBar.openFromComponent(SnackbarComponent,
          {data: 'Blocco cancellato', panelClass: ['red-snackbar']}
        );
        this._dialogRef.close(this.bloccoID);
      },
      err=> (
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
      )
    );
  }

  openColorPicker() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '405px',
      height: '460px',
      data: {ascRGB: this.form.controls.color.value},
    };
    const dialogRef = this._dialog.open(ColorPickerComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => { 
        if (result) this.form.controls.color.setValue(result);
        //this.loadData(); 
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
      reader.onload = () => {
        this.imgFile = reader.result as string;

        Utility.compressImage( this.imgFile, 400, 400)
               .then(compressed => this.immagineDOM.nativeElement.src = compressed);
      };
    }
  }

  // cropImage(e: any) {
   
  //   if(e.target.files && e.target.files.length) {
  //     const [file] = e.target.files;
  //     if(e.target.files[0].size > 200000){
  //       this._dialog.open(DialogOkComponent, {
  //         width: '320px',
  //         data: {titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)"}
  //       });
  //       return;
  //     };

  //     const dialogRef = this._dialog.open(PhotocropComponent, {
  //       width: '270px',
  //       height: '400px',
  //       data: {file: e.target.files}
  //     });
  //   }
  // }
  
}
