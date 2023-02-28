import { Component, ElementRef, Inject, OnInit, ViewChild }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                      from 'rxjs';
import { concatMap, tap }                       from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { tooWideValidator, tooHighValidator}    from '../../utilities/crossfieldvalidators/tooWide';
import { ColorPickerComponent }                 from '../../color-picker/color-picker.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { Utility }                              from '../../utilities/utility.component';
import { QuillEditorComponent }                 from 'ngx-quill'

//services
import { BlocchiService }                       from '../blocchi.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { BlocchiFotoService }                   from '../blocchifoto.service';
import { BlocchiTestiService }                  from '../blocchitesti.service';

//models
import { A4 }                                   from 'src/environments/environment';
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';
import { TEM_BloccoFoto }                       from 'src/app/_models/TEM_BloccoFoto';
import { TEM_BloccoTesto }                      from 'src/app/_models/TEM_BloccoTesto';


@Component({
  selector: 'app-blocco-edit',
  templateUrl: './blocco-edit.component.html',
  styleUrls: ['../templates.css']
})
export class BloccoEditComponent implements OnInit {
//#region ----- Variabili --------------------
  blocco$!:                                     Observable<TEM_Blocco>;
  form! :                                       UntypedFormGroup;
  imgFile!:                                     string;

  imgSize = {
    w:                                          0,
    h:                                          0
  }
  ritorno = {
    //tipo:                                       "",
    operazione:                                 "",
    //contenuto:                                  "",
    //bloccoSize:                                 this.imgSize,
    //bloccoPos:                                  {
    //    x:0,
    //    y:0
    //  }
  }
  
                                        

  tipoBloccoDesc!:                              string;

  htmlText!:                                    string;        
  


  //QUILL

  //la customOption abilita l'effettiva applicazione di quello che viene selezionato
  public customOptions = [{
    import: 'attributors/style/size',
    whitelist: ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px']
  }];

  currIndex:                                   number = 0;
  // quillOptions = {                              //non servirà più

  //   toolbar: 

  //   [
  //     ['bold', 'italic', 'underline', 'strike'],          // toggled buttons
  //     //['blockquote', 'code-block'],
  //     //[{ 'header': 1 }, { 'header': 2 }],               // custom button values
  //     [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  //     [{ 'script': 'sub'}, { 'script': 'super' }],        // superscript/subscript
  //     //[{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  //     //[{ 'direction': 'rtl' }],                         // text direction
  //     [{ size: ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px'] }],      // toggled buttons
  //     // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  //     // [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  //     [{ 'font': [] }],
  //     [{ 'align': [] }],
  //     ['clean'],                                          // remove formatting button
  //     //['link', 'image', 'video']                         // link and image, video
  //   ],
    
  // };
  


//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('myImg', {static: false}) immagineDOM!: ElementRef;
  @ViewChild('QuillEditor', { static: false }) editor!: QuillEditorComponent
  //@ViewChild('QuillEditor', { static: false }) quill!: Quill

//#endregion

//#region ----- Constructor ------------------
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
        bloccoTestoID:                          [0],
        borderTop:                              [],
        borderRight:                            [],
        borderBottom:                           [],
        borderLeft:                             [],
        fontSize:                               []
      }, { validators: [tooWideValidator, tooHighValidator]});
  }
//#endregion 

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    if (this.bloccoID && this.bloccoID + '' != "0") {
      const obsBlocco$: Observable<TEM_Blocco> = this.svcBlocchi.get(this.bloccoID);
      const loadBlocco$ = this._loadingService.showLoaderUntilCompleted(obsBlocco$);
      this.blocco$ = loadBlocco$
      .pipe(
          tap(
            blocco => {
              console.log ("blocco edit - loadData - blocco:", blocco);
              this.tipoBloccoDesc = blocco.tipoBlocco!.descrizione;

              this.form.patchValue(blocco);
              if (blocco.bloccoFoto) {
                this.imgFile = blocco.bloccoFoto.foto; 
                this.imgSize.h = blocco.bloccoFoto.h;
                this.imgSize.w = blocco.bloccoFoto.w;
              }
              if (blocco.bloccoTesto) {
                this.form.controls.testo.setValue(blocco.bloccoTesto.testo);
                this.form.controls.fontSize.setValue(blocco.bloccoTesto.fontSize);
              }

            }
          )
      );
    }

  }
//#endregion

//#region ----- Operazioni CRUD ---------------

  save(){
    //console.log("blocco-edit - save - form blocco da salvare", this.form.value);


    if (this.tipoBloccoDesc == "Immagine" && this.immagineDOM != undefined) {  //********* caso blocco di Foto  *******************

      if (this.form.controls.bloccoFotoID.value) {  // PUT
        let fotoObj : TEM_BloccoFoto = {
          id:this.form.controls.bloccoFotoID.value,
          foto: this.immagineDOM.nativeElement.src,
          w: Math.floor(this.imgSize.w),
          h: Math.floor(this.imgSize.h)
        }
        //console.log ("vado a salvare", fotoObj, "e blocco", this.form.value);
        this.svcBlocchiFoto.put(fotoObj)
        .pipe(
          concatMap( ()=> this.svcBlocchi.put(this.form.value))
        )
        .subscribe( res=> {
          //console.log("sto per chiudere e passare this.imgSize PUT", this.imgSize);
            this.ritorno = {
              //tipo: this.tipoBloccoDesc,
              operazione: "PUT",
              //contenuto: this.immagineDOM.nativeElement.src,
              //bloccoSize:  {
              //  w: Math.floor(this.imgSize.w),
              //  h: Math.floor(this.imgSize.h)
              //},
              //bloccoPos: {
              //  x: this.form.controls.x.value,
              //  y: this.form.controls.y.value
              //}
            }
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']})
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      } else {
        let fotoObj : TEM_BloccoFoto = {          // POST
          foto: this.immagineDOM.nativeElement.src,
          w: Math.floor(this.imgSize.w),
          h: Math.floor(this.imgSize.h)
        }
        //console.log ("vado a salvare", fotoObj, "e blocco", this.form.value);

        this.svcBlocchiFoto.post(fotoObj)
        .pipe(
          tap(bloccoFoto=> this.form.controls.bloccoFotoID.setValue(bloccoFoto.id)),
          concatMap( ()=> this.svcBlocchi.put(this.form.value))
        )
        .subscribe( res=> {
            //console.log("sto per chiudere e passare this.imgSize POST", this.imgSize);
            this.ritorno = {
              //tipo: this.tipoBloccoDesc,
              operazione: "POST",
              // contenuto: this.immagineDOM.nativeElement.src,
              // bloccoSize:  {
              //   w: Math.floor(this.imgSize.w),
              //   h: Math.floor(this.imgSize.h)
              // },
              // bloccoPos: {
              //   x: this.form.controls.x.value,
              //   y: this.form.controls.y.value
              // }
            }
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']})
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
        
      }


    

    } else if (this.tipoBloccoDesc == "Testo") {     //********* caso blocco di Testo *******************
      let testoObj! : TEM_BloccoTesto;

      if (this.form.controls.bloccoTestoID.value) { // PUT
        testoObj = {
          id: this.form.controls.bloccoTestoID.value,
          testo: this.form.controls.testo.value,
          fontSize: this.form.controls.fontSize.value,
        }
        this.svcBlocchiTesti.put(testoObj)
        .pipe (
          concatMap( ()=> this.svcBlocchi.put(this.form.value))
        )
        .subscribe( res=> {
          this.ritorno = {
            //tipo: this.tipoBloccoDesc,
            operazione:"PUT",
            // contenuto: "",
            // bloccoSize:  {
            //   w: this.form.controls.w.value,
            //   h: this.form.controls.h.value
            // },
            // bloccoPos: {
            //   x: this.form.controls.x.value,
            //   y: this.form.controls.y.value
            // }
          }
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']})
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      } else {                                    // POST
        testoObj = {
          testo: this.form.controls.testo.value,
          fontSize: this.form.controls.fontSize.value
        }
        this.svcBlocchiTesti.post(testoObj)
        .pipe (
          tap(bloccoTesto=> {this.form.controls.bloccoTestoID.setValue(bloccoTesto.id)}),
          concatMap( ()=> this.svcBlocchi.put(this.form.value))
        )
        .subscribe( res=> {
          this.ritorno = {
            //tipo: this.tipoBloccoDesc,
            operazione: "POST",
            // contenuto: "",
            // bloccoSize:  {
            //   w: this.form.controls.w.value,
            //   h: this.form.controls.h.value
            // },
            // bloccoPos: {
            //   x: this.form.controls.x.value,
            //   y: this.form.controls.y.value
            // }
          }
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']})
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      }
    }
  }

  delete() {

    //serve la delete anche dei record di BlocchiFoto e BlocchiTesti correlati TODO
    if (this.form.controls.bloccoFoto != null) this.svcBlocchiFoto.delete(this.form.controls.bloccoFotoID.value).subscribe();
    if (this.form.controls.bloccoTesto != null) this.svcBlocchiTesti.delete(this.form.controls.bloccoTestoID.value).subscribe();

    this.svcBlocchi.delete(this.bloccoID)
    .subscribe(
      res=>{
        this._snackBar.openFromComponent(SnackbarComponent,
          {data: 'Blocco cancellato', panelClass: ['red-snackbar']}
        );
        this.ritorno = {
          //tipo: this.tipoBloccoDesc,
          operazione: "DELETE",
          // contenuto: "",
          // bloccoSize:  {
          //   w: this.form.controls.w.value,
          //   h: this.form.controls.h.value
          // },
          // bloccoPos: {
          //   x: this.form.controls.x.value,
          //   y: this.form.controls.y.value
          // }
        }
        this._dialogRef.close(this.ritorno);
      },
      err=> (
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
      )
    );
  }
//#endregion

//#region ----- Altri metodi (ColorPicker, imgChange, bordi ...) -------

  openColorPicker() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '350px',
      height: '475px',
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
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (300kb)"}
        });
        return;
      };

    const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile = reader.result as string;

        Utility.loadImage( this.imgFile, 500)
               .then((compressed: any) => {

                this.immagineDOM.nativeElement.src = compressed[0];
                
                let larghezzaDisp = A4.width - this.form.controls.x.value;
                let altezzaDisp = A4.height - this.form.controls.y.value;
                let ratiodisp = larghezzaDisp/altezzaDisp;

                //ci sono diversi casi da contemplare
                if (compressed[1] > larghezzaDisp && compressed[2] < altezzaDisp) {
                  // console.log ("caso 1", compressed[1], compressed[2]);
                  this.imgSize.w = larghezzaDisp;
                  this.imgSize.h = this.imgSize.w * compressed[2] /compressed[1]
                }
                if (compressed[1] < larghezzaDisp && compressed[2] > altezzaDisp) {
                  // console.log ("caso 2", compressed[1], compressed[2]);

                  this.imgSize.h = altezzaDisp;
                  this.imgSize.w = this.imgSize.h * compressed[1] /compressed[2]
                }
                if (compressed[1] > larghezzaDisp && compressed[2] > altezzaDisp) {

                  let ratio = compressed[1]/compressed[2];
                  if (ratio> ratiodisp) {
                    // console.log ("caso 3a", compressed[1], compressed[2]);

                    this.imgSize.w = larghezzaDisp;
                    this.imgSize.h = this.imgSize.w * compressed[2] /compressed[1]
                  } else {
                    // console.log ("caso 3b", compressed[1], compressed[2]);

                    this.imgSize.h = altezzaDisp;
                    this.imgSize.w = this.imgSize.h * compressed[1] /compressed[2]
                  }
                }
                if (compressed[1] < larghezzaDisp && compressed[2] < altezzaDisp) {
                  // console.log ("caso 4", compressed[1], compressed[2]);

                  this.imgSize.w = compressed[1];
                  this.imgSize.h = compressed[2];
                }
              });
      };
    }
  }

  setTrasparenza(value: any) {
    //console.log(value.checked);
    if (value.checked) {this.form.controls.color.setValue("")}
  }

  bordersChange (event: any){
    console.log("bordersChange", event.source.value, event.source.checked);
    switch(event.source.value) { 
      case 'bordertop': { 
         this.form.controls.borderTop.setValue(event.source.checked);
         break; 
      } 
      case 'borderright': { 
        this.form.controls.borderRight.setValue(event.source.checked);

        break; 
      }   
      case 'borderbottom': { 
        this.form.controls.borderBottom.setValue(event.source.checked);
         break; 
      } 
      case 'borderleft': { 
        this.form.controls.borderLeft.setValue(event.source.checked);
        break; 
      } 

      default: { 
         //statements; 
         break; 
      } 
   } 


  }
//#endregion

//#region ----- Quill -------------------------
  onSelectionChanged = (event: any) =>{
    //salva la posizione in cui si trova il cursore!
    this.currIndex = event.range.index;
  }


  insertPlaceholder(event: any) {
    //conosciamo l'API editor è QuillEditor....
    //    const debug = this.editor.quillEditor.getContents();          //ritorna un fantomatico Delta Array un elemento per ogni riga
    //    const debug = this.editor.quillEditor.getIndex.length;        //ritorna sempre 1
    //    const deubg = this.editor.quillEditor.deleteText(2,3);        //cancella dal secondo carattere per tre caratteri
    //    const debug = this.editor.quillEditor.getSelection()!.length; //non funziona proprio, nemmeno "null"
    //    const debug = this.editor.quillEditor.getLines();             //restituisce il numero di linee
    //    const debug = this.editor.quillEditor.getText();              //restituisce il testo intero
    console.log ("insertPlaceholder", this.currIndex, event.target!.value);
    this.editor.quillEditor.insertText (this.currIndex, event.target!.value, 'bold', true);  
  }

  applicaFontSize() {
    console.log ("selezionatutt")
    this.editor.quillEditor.setSelection(0, this.editor.quillEditor.getLength()) 
  }
  selezionaTutto() {
    console.log("selezionatutto");
  }
//#endregion

}

