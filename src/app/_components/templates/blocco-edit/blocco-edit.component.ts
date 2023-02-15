import { Component, ElementRef, Inject, OnInit, ViewChild }            from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn }               from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { iif, Observable } from 'rxjs';
import { concatMap, tap }                                  from 'rxjs/operators';

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






@Component({
  selector: 'app-blocco-edit',
  templateUrl: './blocco-edit.component.html',
  styleUrls: ['../templates.css']
})
export class BloccoEditComponent implements OnInit {
//#region ----- Variabili -------
  blocco$!:                                     Observable<TEM_Blocco>
  form! :                                       FormGroup;
  imgFile!:                                     string;
  tipoBloccoDesc!:                              string;
  bloccoFotoID!:                                number;


//#endregion


@ViewChild('myImg', {static: false}) immagineDOM!: ElementRef;


  constructor(
    private svcBlocchi:                         BlocchiService,
    private svcBlocchiFoto:                     BlocchiFotoService,

    public _dialogRef:                          MatDialogRef<BloccoEditComponent>,
    @Inject(MAT_DIALOG_DATA) public bloccoID:   number,
    private fb:                                 FormBuilder, 


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
        ckFill:                                 [],
        tipoBloccoID:                           [0],
        bloccoFotoID:                           [0]
      }, { validators: [tooWideValidator, tooHighValidator]});


  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    if (this.bloccoID && this.bloccoID + '' != "0") {

      const obsBlocco$: Observable<TEM_Blocco> = this.svcBlocchi.get(this.bloccoID);
      const loadBlocco$ = this._loadingService.showLoaderUntilCompleted(obsBlocco$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.blocco$ = loadBlocco$
      .pipe(
          tap(
            blocco => {
              console.log ("blocco edit - loadData - blocco:", blocco);
              this.tipoBloccoDesc = blocco.tipoBlocco!.descrizione;
              this.bloccoFotoID = blocco.bloccoFotoID!;
              this.form.patchValue(blocco)

            }
          )
      );
    }

  }
//#endregion

save(){
  console.log("form blocco da salvare", this.form.value);


  if (this.tipoBloccoDesc == "Immagine" && this.immagineDOM != undefined) {

    //in teoria se c'è lID blocco foto devo fare una put e non una post, quindi l'obj sarebbe diverso nei due casi 
    //visto che chiamo sempre la save che decide lei cosa fare

    let fotoObj : TEM_BloccoFoto = {
      foto: this.immagineDOM.nativeElement.src
    }
    console.log (this.immagineDOM.nativeElement.src);
    this.svcBlocchiFoto.save(fotoObj)
      .pipe(
        tap(id=> {
          if (this.bloccoFotoID == null) this.bloccoFotoID = id
          this.form.controls.bloccoFotoID.setValue(this.bloccoFotoID)
          console.log ("blocco-edit save this.bloccoID:", this.bloccoFotoID)
        }),
        concatMap( ()=> this.svcBlocchi.put(this.form.value))
      )
      .subscribe(res=> {
        this._dialogRef.close(this.bloccoID);
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      err=> (
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      );


  } else {
    this.svcBlocchi.put(this.form.value)
      .subscribe(res=> {
        this._dialogRef.close(this.bloccoID);
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      err=> (
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      );
  }




}

  delete() {

    //serve la delete anche dei record di BlocchiFoto correlati TODO
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
