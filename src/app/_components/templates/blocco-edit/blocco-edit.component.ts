//#region ----- IMPORTS ------------------------

import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild }             from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }                         from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA }    from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { concatMap, tap }                       from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { tooWideValidator, tooHighValidator}    from '../../utilities/crossfieldvalidators/tooWide';
import { ColorPickerComponent }                 from '../../color-picker/color-picker.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { Utility }                              from '../../utilities/utility.component';
import { QuillEditorComponent }                 from 'ngx-quill'
import 'quill-mention'

//components
import { TableComponent }                       from '../table/table.component';


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
import { BlocchiCelleService } from '../blocchicelle.service';

//#endregion
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

  ritorno = {                                   //oggetto che viene restituito in chiusura di dialog (volendo si può arricchire)
    operazione:                                 "",
  }
                              
  tipoBloccoDesc!:                              string;
  htmlText!:                                    string;        
  bloccoTestoID!:                               number;
  bloccoFotoID!:                                number;

  //QUILL (se il blocco è di Testo)
  //la customOption abilita l'effettiva applicazione di quello che viene selezionato
  public customOptions = [{
    import: 'attributors/style/size',
    whitelist: ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px']
  }];

  modules = {
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      onSelect: (item:any, insertItem:any) => {
        const editor = this.editor.quillEditor
        insertItem(item)
        // necessary because quill-mention triggers changes as 'api' instead of 'user'
        editor.insertText(editor.getLength() - 1, '', 'user')
      },
      source: (searchTerm:any, renderList:any) => {
        const values = [
          { id: 1, value: 'anno_scolastico' },
          { id: 2, value: 'nomeecognome_alunno' },
          { id: 3, value: 'datadinascita_alunno' },
          { id: 4, value: 'codicefiscale_alunno' }
        ]

        if (searchTerm.length === 0) {
          renderList(values, searchTerm)
        } else {
          const matches :any = []

          values.forEach((entry) => {
            if (entry.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
              matches.push(entry)
            }
          })
          renderList(matches, searchTerm)
        }
      }
    },
    toolbar: []
  }

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

  @ViewChild(TableComponent) TableComponent!: TableComponent; 

//#endregion

//#region ----- Constructor ------------------
  constructor(
    @Inject(MAT_DIALOG_DATA) public bloccoID:   number,
    private fb:                                 UntypedFormBuilder, 
    private svcBlocchi:                         BlocchiService,
    private svcBlocchiFoto:                     BlocchiFotoService,
    private svcBlocchiTesti:                    BlocchiTestiService,
    private svcBlocchiCelle:                    BlocchiCelleService,

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
        borderTop:                              [],
        borderRight:                            [],
        borderBottom:                           [],
        borderLeft:                             [],
        fontSize:                               ['12px']
      }, { validators: [tooWideValidator, tooHighValidator]});
  }
//#endregion 

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }


  loadData(){
    //console.log ("blocco-edit loadData, this.bloccoID:", this.bloccoID);
    if (this.bloccoID && this.bloccoID + '' != "0") {
      const obsBlocco$: Observable<TEM_Blocco> = this.svcBlocchi.get(this.bloccoID);
      const loadBlocco$ = this._loadingService.showLoaderUntilCompleted(obsBlocco$);
      this.blocco$ = loadBlocco$
      .pipe(
          tap(
            blocco => {
              this.tipoBloccoDesc = blocco.tipoBlocco!.descrizione;
              this.form.patchValue(blocco);

              if (this.tipoBloccoDesc == "Immagine") {
                this.imgFile = blocco._BloccoFoto![0].foto; 
                this.imgSize.h = blocco._BloccoFoto![0].h;
                this.imgSize.w = blocco._BloccoFoto![0].w;
                this.bloccoFotoID = blocco._BloccoFoto![0].id!
              }
              if (this.tipoBloccoDesc == "Testo") {
                this.form.controls.testo.setValue(blocco._BloccoTesti![0].testo);
                this.form.controls.fontSize.setValue(blocco._BloccoTesti![0].fontSize);
                this.bloccoTestoID = blocco._BloccoTesti![0].id!

              }

            }
          )
      );
    }

  }
//#endregion

//#region ----- Operazioni CRUD ---------------

  save(){


//     console.log ("a paragone con", this.editor.quillEditor.getContents());



//     const quillContents = this.editor.quillEditor.getContents();
// let spansWithFontSize = [];

// quillContents.ops!.forEach((op) => {
//   if (op.attributes && op.attributes.size) {
//     const fontSize = op.attributes.size;
//     const span = `<span style="font-size:${fontSize}">${op.insert}</span>`;
//     spansWithFontSize.push(span);
//   } else {
//     spansWithFontSize.push(op.insert);
//   }
// });





    //return;
    //console.log("blocco-edit - save - form blocco da salvare", this.form.value);
    if (this.tipoBloccoDesc == "Tabella") {
      //il salvataggio delle celle di una tabella viene delegato al component tableComponent
      this.TableComponent.save()
      .subscribe(() => {
        this.ritorno = {operazione: "SAVE TABELLA"}
        this._dialogRef.close(this.ritorno);
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Blocco Tabella salvato', panelClass: ['green-snackbar']})
        }
      )
    }

    if (this.tipoBloccoDesc == "Immagine" && this.immagineDOM != undefined) {  //********* caso blocco di Foto  *******************

      if (this.bloccoFotoID) {  // PUT
        let fotoObj : TEM_BloccoFoto = {
          id:this.bloccoFotoID,
          bloccoID: this.bloccoID,
          foto: this.immagineDOM.nativeElement.src,
          w: Math.floor(this.imgSize.w),
          h: Math.floor(this.imgSize.h)
        }

        this.svcBlocchiFoto.put(fotoObj)
        .pipe(
          concatMap( ()=> this.svcBlocchi.put(this.form.value))
        )
        .subscribe( res=> {
          //console.log("sto per chiudere e passare this.imgSize PUT", this.imgSize);
            this.ritorno = {operazione: "PUT IMMAGINE"}
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Blocco Immagine salvato', panelClass: ['green-snackbar']})
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      } else {
        let fotoObj : TEM_BloccoFoto = {          // POST
          bloccoID: this.bloccoID,
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
            this.ritorno = {operazione: "POST IMMAGINE"}
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']})
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
        
      }
    } 
    
    if (this.tipoBloccoDesc == "Testo") {     //********* caso blocco di Testo *******************
      let testoObj! : TEM_BloccoTesto;

      if (this.bloccoTestoID) { // PUT
        
        testoObj = {
          id: this.bloccoTestoID,
          bloccoID: this.bloccoID,
          testo: this.form.controls.testo.value,
          fontSize: this.form.controls.fontSize.value,
        }


        
        this.svcBlocchiTesti.put(testoObj)
        .pipe (
          concatMap( ()=> this.svcBlocchi.put(this.form.value))
        )
        .subscribe( res=> {
          this.ritorno = { operazione:"PUT TESTO"}
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']})
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      } else {            
        // POST
        testoObj = {
          bloccoID: this.bloccoID,
          testo: this.form.controls.testo.value,
          fontSize: this.form.controls.fontSize.value
        }
        this.svcBlocchiTesti.post(testoObj)
        .pipe (
          tap(bloccoTesto=> {this.form.controls.bloccoTestoID.setValue(bloccoTesto.id)}),
          concatMap( ()=> this.svcBlocchi.put(this.form.value))
        )
        .subscribe( res=> {

          this.ritorno = { operazione: "POST TESTO" }
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Blocco Testo salvato', panelClass: ['green-snackbar']})
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      }
    }



  }

  delete() {


    if (this.tipoBloccoDesc == "Immagine") {
      this.svcBlocchiFoto.deleteByBlocco(this.bloccoID)
      .pipe(
        concatMap(() => this.svcBlocchi.delete(this.bloccoID))
      )
      .subscribe(
        res=>{this._snackBar.openFromComponent(SnackbarComponent,{data: 'Blocco cancellato', panelClass: ['red-snackbar']});
          this.ritorno = {operazione: "DELETE"};
          this._dialogRef.close(this.ritorno);
        },
        err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}))
      );
    };
    if (this.tipoBloccoDesc == "Testo") {
      this.svcBlocchiTesti.deleteByBlocco(this.bloccoID)
      .pipe(
        concatMap(() => this.svcBlocchi.delete(this.bloccoID))
      )
      .subscribe(
        res=>{this._snackBar.openFromComponent(SnackbarComponent,{data: 'Blocco cancellato', panelClass: ['red-snackbar']});
          this.ritorno = {operazione: "DELETE"};
          this._dialogRef.close(this.ritorno);
        },
        err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}))
      );
    }
    if (this.tipoBloccoDesc == 'Tabella') {
      this.svcBlocchiCelle.deleteByBlocco(this.bloccoID)
      .pipe(
        concatMap(() => this.svcBlocchi.delete(this.bloccoID))
      )
      .subscribe(res=>{this._snackBar.openFromComponent(SnackbarComponent,{data: 'Blocco cancellato', panelClass: ['red-snackbar']});
        this.ritorno = {operazione: "DELETE"};
        this._dialogRef.close(this.ritorno);
      },
      err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})));
    } 
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


  changeFontSize() {
    this.editor.quillEditor.setSelection(0, this.editor.quillEditor.getLength()) 
    this.editor.quillEditor.format('size', this.form.controls.fontSize.value);
    this.form.controls.testo.setValue(this.editor.quillEditor.root.innerHTML);
  }
//#endregion




}

