//#region ----- IMPORTS ------------------------

import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild }             from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }                         from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA }    from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { concatMap, map, tap }                       from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { tooWideValidator, tooHighValidator}    from '../../utilities/crossfieldvalidators/tooBig';
import { ColorPickerComponent }                 from '../../utilities/color-picker/color-picker.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { Utility }                              from '../../utilities/utility.component';
import { CustomOption, QuillEditorComponent }   from 'ngx-quill'
import 'quill-mention'

//components
import { TableComponent }                       from '../table/table.component';

//services
import { BlocchiService }                       from '../blocchi.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { BlocchiFotoService }                   from '../blocchifoto.service';
import { BlocchiTestiService }                  from '../blocchitesti.service';
import { BlocchiCelleService }                  from '../blocchicelle.service';
import { TableColsService }                     from '../../utilities/toolbar/tablecols.service';

//models
import { A4V }                                  from 'src/environments/environment';
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';
import { TEM_BloccoFoto }                       from 'src/app/_models/TEM_BloccoFoto';
import { TEM_BloccoTesto }                      from 'src/app/_models/TEM_BloccoTesto';
import { _UT_TableCol }                         from 'src/app/_models/_UT_TableCol';
import { TEM_MentionValue }                     from 'src/app/_models/TEM_MentionValue';

//#endregion
@Component({
  selector: 'app-blocco-edit',
  templateUrl: './blocco-edit.component.html',
  styleUrls: ['../templates.css']
})
export class BloccoEditComponent implements OnInit, AfterViewInit {
//#region ----- Variabili ----------------------
  bloccoID!:                                    number;
  obsCols$!:                                    Observable<_UT_TableCol[]>;
  modules:                                      any = {}
  mentionValues!:                               TEM_MentionValue[];
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
  public customOptions = [
    {
      import: 'attributors/style/size',
      whitelist: ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px']
    }
  ];

  currIndex:                                   number = 0;

  // le quillOptions vengono gestite direttamente nell'HTML
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

//#region ----- ViewChild Input Output ---------
  @ViewChild('myImg', {static: false}) immagineDOM!: ElementRef;
  @ViewChild('QuillEditor', { static: false }) editor!: QuillEditorComponent
  @ViewChild(TableComponent) TableComponent!: TableComponent; 
//#endregion

//#region ----- Constructor --------------------
  constructor(
    @Inject(MAT_DIALOG_DATA) public objPass:   any,
    private fb:                                 UntypedFormBuilder, 
    private svcBlocchi:                         BlocchiService,
    private svcBlocchiFoto:                     BlocchiFotoService,
    private svcBlocchiTesti:                    BlocchiTestiService,
    private svcBlocchiCelle:                    BlocchiCelleService,
    private svcTableCols:                       TableColsService,

    public _dialogRef:                          MatDialogRef<BloccoEditComponent>,
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    private _loadingService :                   LoadingService,
  ) { 
    this.bloccoID = objPass.bloccoID;           //l'oggetto objPass contiene oltre a bloccoID anche il formatoPagina x il Validator
    this.form = this.fb.group(
      {
        id:                                     [null],
        paginaID:                               [0],
        tipoBloccoID:                           [0],

        x:                                      [0],
        y:                                      [0],
        w:                                      [0],
        h:                                      [0],
        color:                                  [''],
        colorBorders:                           [''],

        testo:                                  [''],
        ckTraspFill:                            [true],
        ckNoBorders:                            [true],
        typeBorders:                            [''],
        thicknBorders:                          [],

        latiAttivi:                             [],
        borderTop:                              [],
        borderRight:                            [],
        borderBottom:                           [],
        borderLeft:                             [],
        borderType:                             [],
        fontSize:                               ['12px'],
        alignment:                              ['left'],
        tableNames:                             ['AlunniList']
      }, { validators: [tooWideValidator(objPass.formatoPagina), tooHighValidator(objPass.formatoPagina)]});
  }
//#endregion 

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {

    this.obsCols$ = this.svcTableCols.listTableNames().pipe();
    this.loadData();

    //l'oggetto che segue carica le opzioni e definisce il comportamento della dropdown "mention" che compare quando si digita @
    //estrae i dati da this.mentionValues, che viene popolato dinamicamente
    //this.mentionValues viene anche passato a table-app che usa la stessa estrazione, fatta quindi una sola volta, per ogni cella della tabella
    this.modules = {
      mention: {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@"],
        source: (searchTerm: any, renderList: any) => {
          const values = this.mentionValues;
          if (searchTerm.length === 0) {
            renderList(values, searchTerm);
          } else {
            const matches = [];
            for (let i = 0; i < values.length; i++)
              if (
                values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
              )
                matches.push(values[i]);
            renderList(matches, searchTerm);
          }
        }
      },
      toolbar: []
    }
  }

  ngAfterViewInit() {
    this.setCampiMention();
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
              // console.log ("blocco-edit loadData, blocco", blocco);

              this.tipoBloccoDesc = blocco.tipoBlocco!.descrizione;
              this.form.patchValue(blocco);

              if (this.tipoBloccoDesc == "Image") {
                this.imgFile = blocco._BloccoFoto![0].foto; 
                this.imgSize.h = blocco._BloccoFoto![0].h;
                this.imgSize.w = blocco._BloccoFoto![0].w;
                this.bloccoFotoID = blocco._BloccoFoto![0].id!
              }
              if (this.tipoBloccoDesc == "Text") {
                this.form.controls.testo.setValue(blocco._BloccoTesti![0].testo);
                this.form.controls.fontSize.setValue(blocco._BloccoTesti![0].fontSize+'px');
                this.bloccoTestoID = blocco._BloccoTesti![0].id!

              }

            }
          )
      );
    }

  }
//#endregion

//#region ----- Operazioni CRUD ----------------

  save(){

    //console.log("blocco-edit - save - form blocco da salvare", this.form.value);
    if (this.tipoBloccoDesc == "Text") {     //********* caso blocco di Testo *******************
      let testoObj! : TEM_BloccoTesto;
      // console.log("this.form.value", this.form.value);
      testoObj = {
        bloccoID: this.bloccoID,
        testo: this.form.controls.testo.value? this.form.controls.testo.value: '',
        fontSize: this.form.controls.fontSize.value.substring(0, this.form.controls.fontSize.value.length -2)
      }
      if (this.bloccoTestoID) { 
        // PUT
        testoObj.id = this.bloccoTestoID;

        this.svcBlocchiTesti.put(testoObj)
        .pipe (
          concatMap( ()=> this.svcBlocchi.put(this.form.value))
        )
        .subscribe( { 
          next: res=> {
          this.ritorno = { operazione:"PUT TESTO"}
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']})
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        })
      } else {            
        // POST forse di qui non si passa MAI??
        // console.log ("post testo");
        this.svcBlocchiTesti.post(testoObj)
        .pipe (
          tap(bloccoTesto=> {this.form.controls.bloccoTestoID.setValue(bloccoTesto.id)}),
          concatMap( ()=> this.svcBlocchi.put(this.form.value))
        )
        .subscribe({ 
          next: res=> {
            this.ritorno = { operazione: "POST TESTO" }
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Blocco Testo salvato', panelClass: ['green-snackbar']})
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        })
      }
    }

    if (this.tipoBloccoDesc == "Image" && this.immagineDOM != undefined) {  //********* caso blocco di Foto  *******************

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
        .subscribe({ 
          next: res=> {
          //console.log("sto per chiudere e passare this.imgSize PUT", this.imgSize);
            this.ritorno = {operazione: "PUT IMMAGINE"}
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Blocco Immagine salvato', panelClass: ['green-snackbar']})
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        })
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
        .subscribe({ 
          next: res=> {
            //console.log("sto per chiudere e passare this.imgSize POST", this.imgSize);
            this.ritorno = {operazione: "POST IMMAGINE"}
            this._dialogRef.close(this.ritorno);
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']})
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        })
        
      }
    } 

    if (this.tipoBloccoDesc == "Table") {
      //il salvataggio delle celle di una tabella viene delegato al component tableComponent
      this.TableComponent.save()
      .subscribe(() => {
        this.ritorno = {operazione: "SAVE TABELLA"}
        this._dialogRef.close(this.ritorno);
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Blocco Tabella salvato', panelClass: ['green-snackbar']})
        }
      )
    }

  }

  delete() {


    if (this.tipoBloccoDesc == "Image") {
      this.svcBlocchiFoto.deleteByBlocco(this.bloccoID)
      .pipe(
        concatMap(() => this.svcBlocchi.delete(this.bloccoID))
      )
      .subscribe({
        next: res=>{this._snackBar.openFromComponent(SnackbarComponent,{data: 'Blocco cancellato', panelClass: ['red-snackbar']});
          this.ritorno = {operazione: "DELETE"};
          this._dialogRef.close(this.ritorno);
        },
        error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}))
      });
    };
    if (this.tipoBloccoDesc == "Text") {
      this.svcBlocchiTesti.deleteByBlocco(this.bloccoID)
      .pipe(
        concatMap(() => this.svcBlocchi.delete(this.bloccoID))
      )
      .subscribe({
        next: res=>{this._snackBar.openFromComponent(SnackbarComponent,{data: 'Blocco cancellato', panelClass: ['red-snackbar']});
          this.ritorno = {operazione: "DELETE"};
          this._dialogRef.close(this.ritorno);
        },
        error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}))
      });
    }
    if (this.tipoBloccoDesc == "Table") {
      this.svcBlocchiCelle.deleteByBlocco(this.bloccoID)
      .pipe(
        concatMap(() => this.svcBlocchi.delete(this.bloccoID))
      )
      .subscribe({
        next: res=>{this._snackBar.openFromComponent(SnackbarComponent,{data: 'Blocco cancellato', panelClass: ['red-snackbar']});
        this.ritorno = {operazione: "DELETE"};
        this._dialogRef.close(this.ritorno);
      },
        error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}))
      });
    } 
  }
//#endregion

//#region ----- Altri metodi (ColorPicker, imgChange, bordi ...) -------

  openColorPickerFill() {
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
      }
    );
  }

  openColorPickerBorders() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '350px',
      height: '475px',
      data: {ascRGB: this.form.controls.color.value},
    };
    const dialogRef = this._dialog.open(ColorPickerComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => { 
        if (result) this.form.controls.colorBorders.setValue(result);
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
                
                let larghezzaDisp = A4V.width - this.form.controls.x.value;
                let altezzaDisp = A4V.height - this.form.controls.y.value;
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

  setTraspFill(value: any) {
    if (value.checked) {this.form.controls.color.setValue("")}
    if (!value.checked) {this.form.controls.color.setValue("#FFFFFF")}
  }

  setNoBorders(value: any) {
    if (value.checked) {this.form.controls.colorBorders.setValue("")}
    if (!value.checked) {
      this.form.controls.colorBorders.setValue("#000000")
      this.form.controls.borderTop.setValue (false);
      this.form.controls.borderRight.setValue (false);
      this.form.controls.borderLeft.setValue (false);
      this.form.controls.borderBottom.setValue (false);
      this.form.controls.borderType.setValue("solid");

    }
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

  bordersTypeChange (event: any){
    this.form.controls.bordersType.setValue(event.source.value)
  }

  thicknBordersChange (event: any) {
    //this.form.controls.thicknBorders.setValue(+this.form.controls.thicknBorders.setValue);

  }

//#endregion

//#region ----- Quill e Mention ----------------
  // onSelectionChanged = (event: any) =>{
  //   this.currIndex = event.range.index;         //salva la posizione in cui si trova il cursore!
  // }

  changeFontSize() {
    this.editor.quillEditor.setSelection(0, this.editor.quillEditor.getLength()) 
    this.editor.quillEditor.format('size', this.form.controls.fontSize.value);
    this.form.controls.testo.setValue(this.editor.quillEditor.root.innerHTML);
  }

  changeAlignment() {
    this.editor.quillEditor.setSelection(0, this.editor.quillEditor.getLength()) 
    this.editor.quillEditor.format('align', this.form.controls.alignment.value);
    this.form.controls.testo.setValue(this.editor.quillEditor.root.innerHTML);
  }

  setCampiMention() {
    // console.log("blocco-edit - setCampiMention: this.form.controls.tableNames.value", this.form.controls.tableNames.value);
    this.svcTableCols.listByTable(this.form.controls.tableNames.value)
    .pipe(
      map( (cols) => cols.map((col, i) => ({id: i+1, value: this.form.controls.tableNames.value+"_"+col.colName})))
    )
    .subscribe(res => {
      this.mentionValues = res;
    })
    
  }
//#endregion


}

