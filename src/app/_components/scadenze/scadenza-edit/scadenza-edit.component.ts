//#region ----- IMPORTS ------------------------

import { Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { concatMap, finalize, take, tap }                            from 'rxjs/operators';

import { registerLocaleData }                   from '@angular/common';
import localeIt                                 from '@angular/common/locales/it';
registerLocaleData(localeIt, 'it');

import { CdkTextareaAutosize }                  from '@angular/cdk/text-field';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { ColorPickerComponent }                 from '../../color-picker/color-picker.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { ScadenzeService }                      from '../scadenze.service';
import { ScadenzePersoneService }               from '../scadenze-persone.service';
import { PersoneService }                       from '../../persone/persone.service';
import { TipiPersonaService }                   from '../../persone/tipi-persona.service';
import { TipiScadenzaService }                  from '../tipiscadenza.service';

//models
import { CAL_Scadenza, CAL_ScadenzaPersone }                          from 'src/app/_models/CAL_Scadenza';
import { DialogDataScadenza }                   from 'src/app/_models/DialogData';
import { PER_Persona, PER_TipoPersona }         from 'src/app/_models/PER_Persone';
import { User }                                 from 'src/app/_user/Users';
import { CAL_TipoScadenza } from 'src/app/_models/CAL_TipoScadenza';
import { GenitoriService } from '../../genitori/genitori.service';

//#endregion
@Component({
  selector: 'app-scadenza-edit',
  templateUrl: './scadenza-edit.component.html',
  styleUrls: ['../scadenze.css'],

})
export class ScadenzaEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!:                                    User;
  form! :                                       UntypedFormGroup;
  personaIDArr!:                                number[];
  colorSample:                                  string = '#FFFFFF'
  personeListArr!:                              PER_Persona[];
  personeListSelArr!:                           CAL_ScadenzaPersone[];

  tipoPersonaIDArr!:                            number[];

  scadenza$!:                                   Observable<CAL_Scadenza>;
  obsPersone$!:                                 Observable<PER_Persona[]>;
  obsTipiPersone$!:                             Observable<PER_TipoPersona[]>;
  obsTipiScadenza$!:                            Observable<CAL_TipoScadenza[]>;

  strDtStart!:                                  string;
  strDtEnd!:                                    string;

  strH_Ini!:                                    string;
  strH_End!:                                    string;

  dtStart!:                                     Date;
  dtEnd!:                                       Date;
  strClasseSezioneAnno!:                        string;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  ckAppello:                                    boolean = false;
  ckCompito:                                    boolean = false;

  public docenteView:                           boolean = false;
  breakpoint!:                                  number;
  selectedTab:                                  number = 0;

  @ViewChild('autosize') autosize!:             CdkTextareaAutosize;



//#endregion

//#region ----- Constructor --------------------

  constructor( 
    public _dialogRef:                          MatDialogRef<ScadenzaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data:       DialogDataScadenza,

    private fb:                                 UntypedFormBuilder, 
    private svcScadenze:                        ScadenzeService,
    private svcPersone:                         PersoneService,
    private svcGenitori:                        GenitoriService,

    private svcScadenzePersone:                 ScadenzePersoneService,
    private svcTipiScadenza:                    TipiScadenzaService,

    private svcTipiPersone:                     TipiPersonaService,

    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    private _loadingService:                    LoadingService,
    private _ngZone:                            NgZone ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      id:                                       [null],
      dtCalendario:                             [''],
      gruppi:                                   [''],
      ckPromemoria:                             [false],
      ckRisposta:                               [false],
      tipoScadenzaID:                           [''],
      personaID:                                [''],
      personeList:                              [''],
      personeListSel:                           [''],

      //campi di FullCalendar
      title:                                    [''],
      h_Ini:                                    [''],     
      h_End:                                    [''],    
      
  
      start:                                    [''],
      end:                                      [''],
      color:                                    ['']
    });

    this.currUser = Utility.getCurrentUser();
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit () {
    this.loadData();



    this.tipoPersonaIDArr = [];

    //estraggo la lista delle persone che NON sono associate a questa scadenza
    this.setArrayBase();

    this.obsTipiPersone$ = this.svcTipiPersone.list();
    this.obsTipiScadenza$ = this.svcTipiScadenza.list();


  }

  setArrayBase () {

    //estraggo le persone da selezionare, le metto in personeListSelArr
    //poi inserisco le persone nella personeListArr e per ciascuna vado a veder se già c'è l'id in personeListArr, per toglierlo

    this.svcScadenzePersone.listByScadenza(this.data.scadenzaID)
    .pipe(
      tap( sel=>{
        
        this.personeListSelArr = sel;
        this.personeListSelArr.sort((a,b) => (a.persona!.cognome > b.persona!.cognome)?1:((b.persona!.cognome > a.persona!.cognome) ? -1 : 0) );
        }
      ),
      concatMap(sel => //sel è l'array delle selezionate
        this.svcPersone.list()
        .pipe(
          tap( val => {
          

          this.personeListArr = val;
          //il forEach va in avanti e non va bene: scombussola gli index visto che si fa lo splice...bisogna usare un for i--
          for (let i= this.personeListArr.length -1; i >= 0; i--) {
              if (this.personeListSelArr.filter(e => e.persona!.id === this.personeListArr[i].id).length > 0) {
              this.personeListArr.splice(i, 1);
              }
              this.addMyself(i);

          }
          //ordino per cognome
          this.personeListArr.sort((a,b) => (a.cognome > b.cognome)?1:((b.cognome > a.cognome) ? -1 : 0) );
          }
          )
        )

      )
    )
    .subscribe();
  }


  addMyself(i: number){
    //devo SEMPRE aggiungere me stesso se c'è in listArr a listSelArr
    if (this.personeListArr[i].id === this.currUser.personaID) {
      let objScadenzaPersona: CAL_ScadenzaPersone = {
        personaID: this.personeListArr[i].id,
        scadenzaID : this.data.scadenzaID,
        ckLetto: false,
        ckAccettato: false,
        ckRespinto: false,
        persona:  this.personeListArr[i]
      }
      this.personeListSelArr.push(objScadenzaPersona);
      this.personeListArr.splice(i, 1);
    }
  }

  loadData(): void {

    this.breakpoint = (window.innerWidth <= 800) ? 2 : 2;

    
    if (!this.data.scadenzaID || this.data.scadenzaID + '' == "0") {
      //caso nuova Scadenza
      this.emptyForm = true;
      //LA RIGA QUI SOPRA DETERMINAVA UN ExpressionChangedAfterItHasBeenCheckedError...con il DetectChanges si risolve!  
      //this.cdRef.detectChanges();     ///DEVO TOGLIERLO! BLocca tutto!

      this.dtStart = new Date (this.data.start);
      //this.strDtStart = Utility.UT_FormatDate(this.dtStart, "yyyy-mm-dd");
      this.strDtStart = Utility.formatDate(this.dtStart,  FormatoData.yyyy_mm_dd);
      this.strH_Ini = Utility.formatHour(this.dtStart);

      this.dtEnd = new Date (this.dtStart.setHours(this.dtStart.getHours() + 1));  //in caso di nuova lezione per default impostiamo la durata a un'ora
      //this.strDtEnd = Utility.UT_FormatDate(this.dtEnd, "yyyy-mm-dd");
      this.strDtEnd = Utility.formatDate(this.dtEnd, FormatoData.yyyy_mm_dd);
      this.strH_End = Utility.formatHour(this.dtEnd);

      
      this.form.controls.dtCalendario.setValue(this.dtStart);
      this.form.controls.h_Ini.setValue(this.strH_Ini);
      this.form.controls.h_End.setValue(this.strH_End);
    } 
    else {
      const obsScadenza$: Observable<CAL_Scadenza> = this.svcScadenze.get(this.data.scadenzaID);
      const loadScadenza$ = this._loadingService.showLoaderUntilCompleted(obsScadenza$);
      this.scadenza$ = loadScadenza$
      .pipe( tap(
        scadenza => {
          //console.log ("scadenza-edit - loadData - scadenza", scadenza)
          this.form.patchValue(scadenza)

          if (scadenza.tipoScadenza!.ckNota) {
            this.form.controls.tipoScadenzaID.disable();
            this.form.controls.h_Ini.disable();
            this.form.controls.h_End.disable();

          }
          this.colorSample = scadenza.tipoScadenza!.color;
          //this.form.controls.tipoScadenza.setValue(scadenza.tipoScadenza);
          //oltre ai valori del form vanno impostate alcune variabili: una data e alcune stringhe
          this.dtStart = new Date (this.data.start);
          this.strDtStart = Utility.formatDate(this.dtStart, FormatoData.yyyy_mm_dd);
          this.strH_Ini = Utility.formatHour(this.dtStart);

          this.dtEnd = new Date (this.data.end);
          this.strH_End = Utility.formatHour(this.dtEnd);
        } )
      );
    }
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save() {

    this.strH_Ini = this.form.controls.h_Ini.value;
    this.strH_End = this.form.controls.h_End.value;


    //https://thecodemon.com/angular-get-value-from-disabled-form-control-while-submitting/
    //i campi disabled non vengono più passati al form!
    //va prima lanciato questo loop che "ripopola" il form anche con i valori dei campi disabled
    
    // for (const prop in this.form.controls) {
    //   this.form.value[prop] = this.form.controls[prop].value;
    // }

    

    const objScadenza = <CAL_Scadenza>{
      dtCalendario: this.form.controls.dtCalendario.value,
      title: this.form.controls.title.value,
      start: this.form.controls.start.value,
      end: this.form.controls.end.value,
      color: this.form.controls.tipoScadenzaID.value,
      ckPromemoria: this.form.controls.ckPromemoria.value,
      ckRisposta: this.form.controls.ckRisposta.value,
      h_Ini: this.form.controls.h_Ini.value,
      h_End: this.form.controls.h_End.value,
      PersonaID: this.currUser.personaID,
      TipoScadenzaID: this.form.controls.tipoScadenzaID.value
    }



    console.log("scadenza-edit - save() - objScadenza", objScadenza);
    //qualcosa non funziona nel valorizzare form.controls.end e form.controls.start ma solo su nuova scadenza

    if (this.form.controls['id'].value == null) {   


      
      objScadenza.id = 0;
      //this.svcLezioni.post(this.form.value).subscribe(
      this.svcScadenze.post(objScadenza).subscribe(
        res => {
          this.insertPersone(res.id);
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    } 
    else  {



      let cancellaeRipristinaPersone = this.svcScadenzePersone.deleteByScadenza(this.form.controls.id.value)
      .pipe(
        finalize(()=>{
          this.insertPersone(this.form.controls.id.value);
        })
      );


      //this.svcLezioni.put(this.form.value).subscribe(
        objScadenza.id = this.form.controls.id.value;
        this.svcScadenze.put(objScadenza)
        .pipe(
          concatMap(()=>cancellaeRipristinaPersone)
        )
        .subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }
  }


  delete() {

    //vanno cancellate tutte le scadenze persone!
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(
      result => {
        if(result){

          this.svcScadenzePersone.deleteByScadenza(this.form.controls.id.value)
          .pipe(
            concatMap(()=>this.svcScadenze.delete (this.data.scadenzaID)
            )
          )
          .subscribe(
            res =>{
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          );;

        }
      }
    );
  }
//#endregion

//#region ----- Altri metodi -------------------

  dp1Change() {

    //prendo la data corrente
    let dtTMP = new Date (this.data.start);

    //ci metto l'H_End
    dtTMP.setHours(this.form.controls.h_End.value.substring(0,2));
    dtTMP.setMinutes(this.form.controls.h_End.value.substring(3,5));

    let setHours = 0;
    let setMinutes = 0;

    //tolgo un'ora, ma se vado sotto le 8 devo impostare le 8
    if ((dtTMP.getHours() - 1) < 8) { 
      setHours = 8;
      setMinutes = 0;
    } 
    else { 
      setHours = (dtTMP.getHours() - 1)
      setMinutes = (dtTMP.getMinutes())
    }

    let dtTMP2 = new Date (dtTMP.setHours(setHours));
    dtTMP2.setMinutes(setMinutes);
    let dtISO = dtTMP2.toLocaleString();
    let dtTimeNew = dtISO.substring(11,19);   //tutto quanto sopra per arrivare a questa dtTimeNew da impostare nel caso 3 sottostante

    if (this.form.controls.h_Ini.value < "08:00") {this.form.controls.h_Ini.setValue ("08:00") }   //ora min di inizio 08:00:  sarà parametrica
    if (this.form.controls.h_Ini.value > "15:30") {this.form.controls.h_Ini.setValue ("15:30") }   //ora max di inizio 15:30: sarà parametrica
    if (this.form.controls.h_Ini.value >= this.form.controls.h_End.value) { this.form.controls.h_Ini.setValue (dtTimeNew) }
  }

  dp2Change() {

    //prendo la data corrente
    let dtTMP = new Date (this.data.start);

    //ci metto l'H_Ini
    dtTMP.setHours(this.form.controls.h_Ini.value.substring(0,2));
    dtTMP.setMinutes(this.form.controls.h_Ini.value.substring(3,5));

    let setHours = 0;
    let setMinutes = 0;

    //tolgo un'ora, ma se vado sopra le 15 devo impostare le 15
    if ((dtTMP.getHours() - 1) > 15) { 
      setHours = 15;
      setMinutes = 0;
    } 
    else { 
      setHours = (dtTMP.getHours() + 1)
      setMinutes = (dtTMP.getMinutes())
    }
    let dtTMP2 = new Date (dtTMP.setHours(setHours));
    dtTMP2.setMinutes(setMinutes);
    let dtISO = dtTMP2.toLocaleString();
    let dtTimeNew = dtISO.substring(11,19); //tutto quanto sopra per arrivare a questa dtTimeNew da impostare nel caso 3 sottostante

    if (this.form.controls.h_End.value < "08:30") {this.form.controls.h_End.setValue ("08:30") } //ora min di fine 08:30:  sarà parametrica
    if (this.form.controls.h_End.value > "16:00") {this.form.controls.h_End.setValue ("16:00") } //ora max di fine 16:00:  sarà parametrica
    if (this.form.controls.h_End.value <= this.form.controls.h_Ini.value) { this.form.controls.h_End.setValue (dtTimeNew) }
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  optChanged() {

    //devo aggiungere a personeListSelArr tutti quelli di personeListArr che hanno il tipoPersona come quello selezionato
    let count: number = 0;
    //devo annullare le precedenti selezioni, facendo reset di tutto

    //azzero le selezioni
    this.personeListSelArr =[];
    //ricarico TUTTE le persone
    this.svcPersone.list()
    .pipe(
      tap( val => {
      this.personeListArr = val;
      this.personeListArr.sort((a,b) => (a.cognome > b.cognome)?1:((b.cognome > a.cognome) ? -1 : 0) );


      //aggiungo alle selezioni quelli dei gruppi e tolgo dalle persone contemporaneamente
      this.form.controls.gruppi.value.forEach(
        (val:number) => {
          for (let i = this.personeListArr.length - 1; i>0; i--) {
            
            //se il tipo è uguale a quello che sto guardando OPPURE se trovo me stesso lo aggiungo
            if (this.personeListArr[i].tipoPersona!.id == val  || this.personeListArr[i].id === this.currUser.personaID) { 
              count++; 
              let objScadenzaPersona: CAL_ScadenzaPersone = {
                personaID: this.personeListArr[i].id,
                scadenzaID : this.data.scadenzaID,
                ckLetto: false,
                ckAccettato: false,
                ckRespinto: false,
                persona:  this.personeListArr[i]
              }
              this.personeListSelArr.push(objScadenzaPersona);
              this.personeListArr.splice(i, 1);
              
            }
            
          }
        }
      )

      //se non ci sono selezioni devo aggiungere almeno me stesso
      if (this.form.controls.gruppi.value.length==0) {
        for (let i = this.personeListArr.length - 1; i>0; i--) {
          //se trovo me stesso lo aggiungo
          if (this.personeListArr[i].id === this.currUser.personaID) { 
            count++; 
            let objScadenzaPersona: CAL_ScadenzaPersone = {
              personaID: this.personeListArr[i].id,
              scadenzaID : this.data.scadenzaID,
              ckLetto: false,
              ckAccettato: false,
              ckRespinto: false,
              persona:  this.personeListArr[i]
            }
            this.personeListSelArr.push(objScadenzaPersona);
            this.personeListArr.splice(i, 1);
          }
        }
      }



      }
      )
    )
    .subscribe();

    //ordino per cognome
    this.personeListArr.sort((a,b) => (a.cognome > b.cognome)?1:((b.cognome > a.cognome) ? -1 : 0) );
    
  }


  insertPersone(scadenzaID: number) {
    for (let i = 0; i<this.personeListSelArr.length; i++) {
      let objScadenzaPersona: CAL_ScadenzaPersone = {
        personaID: this.personeListSelArr[i].persona!.id,
        scadenzaID : scadenzaID,
        ckLetto: false,
        ckAccettato: false,
        ckRespinto: false,
      }
      this.svcScadenzePersone.post(objScadenzaPersona).subscribe();
    }
  }

  addToSel(element: PER_Persona) {
    //console.log (element);
    let objScadenzaPersona: CAL_ScadenzaPersone = {
      personaID: element.id,
      scadenzaID : this.data.scadenzaID,
      ckLetto: false,
      ckAccettato: false,
      ckRespinto: false,
      persona: element
    }
    this.personeListSelArr.push(objScadenzaPersona);
    const index = this.personeListArr.indexOf(element);
    this.personeListArr.splice(index, 1);
    this.personeListSelArr.sort((a,b) => (a.persona!.cognome > b.persona!.cognome)?1:((b.persona!.cognome > a.persona!.cognome) ? -1 : 0) );
  }


  removeFromSel(element: CAL_ScadenzaPersone) {
    if (element.personaID == this.currUser.personaID) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Non è possibile rimuovere se stessi"}
      });
    } else {
      //console.log (element);
      this.personeListArr.push(element.persona!);
      const index = this.personeListSelArr.indexOf(element);
      this.personeListSelArr.splice(index, 1);
      this.personeListArr.sort((a,b) => (a.cognome > b.cognome)?1:((b.cognome > a.cognome) ? -1 : 0) );
    }

  }

  changeColor() {
    this.svcTipiScadenza.get(this.form.controls.tipoScadenzaID.value)
    .subscribe(
      val=> this.colorSample = val.color
    );
  }
//#endregion

  



}
