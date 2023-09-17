//#region ----- IMPORTS ------------------------

import { Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable, firstValueFrom }                           from 'rxjs';
import { concatMap, finalize, take, tap }                            from 'rxjs/operators';

import { registerLocaleData }                   from '@angular/common';
import localeIt                                 from '@angular/common/locales/it';
registerLocaleData(localeIt, 'it');

import { CdkTextareaAutosize }                  from '@angular/cdk/text-field';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
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
import { CAL_TipoScadenza }                     from 'src/app/_models/CAL_TipoScadenza';
import { ParametriService } from 'src/app/_components/impostazioni/parametri/parametri.service';

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

  hMinStartScadenza!:                           string;
  hMaxStartScadenza!:                           string;
  hMinEndScadenza!:                             string;
  hMaxEndScadenza!:                             string;

  @ViewChild('autosize') autosize!:             CdkTextareaAutosize;





//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef:                MatDialogRef<ScadenzaEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data:       DialogDataScadenza,

              private fb:                       UntypedFormBuilder, 
              private svcScadenze:              ScadenzeService,
              private svcPersone:               PersoneService,
              private svcTipiPersona:           TipiPersonaService,

              private svcScadenzePersone:       ScadenzePersoneService,
              private svcTipiScadenza:          TipiScadenzaService,
              private svcParametri:             ParametriService,

              private svcTipiPersone:           TipiPersonaService,

              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar,
              private _loadingService:          LoadingService,
              private _ngZone:                  NgZone ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      id:                                       [null],
      dtCalendario:                             [''],
      gruppi:                                   [''],
      ckPromemoria:                             [false],
      ckRisposta:                               [false],
      tipoScadenzaID:                           [''],
      personaID:                                [''],
       personeList:                              [[]],
       personeListSel:                           [[]],

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

    this.setArrayBase(); //imposta la lista delle persone di destra (da listbyScadenza(this.data.scadenzaID)) e quella di destra togliendone le persone che sono già a destra

    this.obsTipiPersone$ = this.svcTipiPersone.list();
    this.obsTipiScadenza$ = this.svcTipiScadenza.list();


    this.svcParametri.getByParName('hMinStartScadenza').subscribe(par=>{this.hMinStartScadenza = par.parValue;});
    this.svcParametri.getByParName('hMaxStartScadenza').subscribe(par=>{this.hMaxStartScadenza = par.parValue;});
    this.svcParametri.getByParName('hMinEndScadenza').subscribe(par=>{this.hMinEndScadenza = par.parValue;});
    this.svcParametri.getByParName('hMaxEndScadenza').subscribe(par=>{this.hMaxEndScadenza = par.parValue;});



  }

  setArrayBase () {
    //estraggo le persone da selezionare, le metto in personeListArr che poi popoleranno la lista di sinsitra
    //poi inserisco le persone nella personeListArr e per ciascuna vado a vedere se già c'è l'id in personeListArr, per toglierlo
    this.svcScadenzePersone.listByScadenza(this.data.scadenzaID)
    .pipe(
      tap( sel=>{     
        //sel è l'elenco delle persone selezionate (viene da listByScadenza(this.data.scadenzaID))   
        this.personeListSelArr = sel;
        this.personeListSelArr.sort((a,b) => (a.persona!.cognome > b.persona!.cognome)?1:((b.persona!.cognome > a.persona!.cognome) ? -1 : 0) );
        }
      ),
      concatMap(() =>
        this.svcPersone.list()
        .pipe(
          tap( val => {
          //ora estraggo l'elenco di TUTTE le persone
          this.personeListArr = val;
          //il forEach va in avanti e non va bene: scombussola gli index visto che si fa lo splice...bisogna usare un for i--
          //splice SOTTRAE da personeListArr ciascun elemento che è stato trovato in personeListSelArr
          for (let i= this.personeListArr.length -1; i >= 0; i--) {
              if (this.personeListSelArr.filter(e => e.persona!.id === this.personeListArr[i].id).length > 0) {
                this.personeListArr.splice(i, 1);
              }
              this.addMyself(i);
          }
          //ordino per cognome
          this.personeListArr.sort((a,b) => (a.cognome > b.cognome)?1:((b.cognome > a.cognome) ? -1 : 0) );
        }))
      )
    )
    .subscribe();
  }

  addMyself(i: number){
    //devo SEMPRE aggiungere me stesso se l'i-esimo sono io allora lo/mi aggiungo e mi tolgo da personeListArr
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
      // //caso nuova Scadenza

      this.emptyForm = true;

      this.dtStart = new Date (this.data.start);
      this.strDtStart = Utility.formatDate(this.dtStart,  FormatoData.yyyy_mm_dd);
      this.strH_Ini = Utility.formatHour(this.dtStart);

       //in caso di nuova scadenza per default impostiamo la durata a un'ora
      this.dtEnd = new Date (this.dtStart.setHours(this.dtStart.getHours() + 1)); 
      this.strDtEnd = Utility.formatDate(this.dtEnd, FormatoData.yyyy_mm_dd);
      this.strH_End = Utility.formatHour(this.dtEnd);

      this.form.controls.dtCalendario.setValue(this.dtStart);
      this.form.controls.h_Ini.setValue(this.strH_Ini);
      this.form.controls.h_End.setValue(this.strH_End);
    } 
    else {
      //caso Scadenza esistente
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
          
          //oltre ai valori del form (patchValue) vanno impostate alcune variabili: una data e alcune stringhe
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

    //qualcosa non funziona nel valorizzare form.controls.end e form.controls.start ma solo su nuova scadenza
    if (this.form.controls['id'].value == null) {   
      
      objScadenza.id = 0;
      //this.svcLezioni.post(this.form.value).subscribe(
      this.svcScadenze.post(objScadenza).subscribe({
        next: res => {
          this.insertPersone(res.id);
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      });
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
        .subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      });
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
          .subscribe({
            next: res =>{
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });

        }
      }
    );
  }
//#endregion

//#region ----- Altri metodi -------------------

  dp1Change() {

    // //verifico anzitutto se l'ora che sto scrivendo è entro i limiti 8-15.30 altrimenti sistemo
    if (this.form.controls.h_Ini.value < this.hMinStartScadenza) {this.form.controls.h_Ini.setValue (this.hMinStartScadenza) }   //ora min di inizio 08:00:  parametrica
    if (this.form.controls.h_Ini.value > this.hMaxStartScadenza) {this.form.controls.h_Ini.setValue (this.hMaxStartScadenza) }   //ora max di inizio 15:30:  parametrica
    this.checkDurata();

  }

  dp2Change() {

    // //verifico anzitutto se l'ora che sto scrivendo è entro i limiti 8-15.30 altrimenti sistemo
    if (this.form.controls.h_End.value < this.hMinEndScadenza) {this.form.controls.h_End.setValue (this.hMinEndScadenza) } //ora min di fine 08:30:   parametrica
    if (this.form.controls.h_End.value > this.hMaxEndScadenza) {this.form.controls.h_End.setValue (this.hMaxEndScadenza) } //ora max di fine 16:00:   parametrica
    this.checkDurata();

  }

  checkDurata() {

  //se la durata è > 30min imposto l'ora di fine a 30 min dopo 

    if (this.form.controls.h_End.value) {
      //prendo la data
      let dtTMPEnd = new Date (this.data.start);
      //ci metto l'H_End
      dtTMPEnd.setHours(this.form.controls.h_End.value.substring(0,2));
      dtTMPEnd.setMinutes(this.form.controls.h_End.value.substring(3,5));

      let dtTMPStart = new Date (this.data.start);
      //ci metto l'H_Ini
      dtTMPStart.setHours(this.form.controls.h_Ini.value.substring(0,2));
      dtTMPStart.setMinutes(this.form.controls.h_Ini.value.substring(3,5));

      //calcolo la durata, se meno di 30 minuti modifico H_end
      let durata = (dtTMPEnd.getTime() - dtTMPStart.getTime())/1000/60;
      if (durata < 30) {
        dtTMPEnd.setTime(dtTMPStart.getTime()+(30*1000*60));
        let dtTimeNew = Utility.zeroPad(dtTMPEnd.getHours(), 2)+":"+Utility.zeroPad(dtTMPEnd.getMinutes(), 2);
        this.form.controls.h_End.setValue (dtTimeNew)
      }
    }
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
        async (val:number) => {
          for (let i = this.personeListArr.length - 1; i>0; i--) {
            

            // this.currUser.persona?._LstRoles!.forEach(
            //   role=> {this.svcTipiPersona.getByDescrizione(role).subscribe(
            //     res=> {
            //       this.almenoUnRuoloEditor = true;
            //       //se uno solo dei ruoli ha diritto di editor gli viene concesso
            //       if (res.ckEditor) {
            //       this.calendarOptions.editable =             true;             //consente modifiche agli eventi presenti
            //       this.calendarOptions.selectable =           true;             //consente di creare eventi
            //       this.calendarOptions.eventStartEditable =   true;             //consente di draggare eventi
            //       this.calendarOptions.eventDurationEditable =true;             //consente di modificare la lunghezza eventi
            //     }}
            //   )}
            // );

            //cerco val  e ne estraggo al descrizione poi guardo se c'è tra quelle di lstRoles della persona
            let descrTipo!: string;
            
            await firstValueFrom(this.svcTipiPersona.get(val).pipe(tap(tipoPersona => descrTipo = tipoPersona.descrizione)));

            //se il tipo è uguale a quello che sto caricando (val) OPPURE se trovo me stesso lo aggiungo
            //if (this.personeListArr[i].tipoPersona!.id == val  || this.personeListArr[i].id === this.currUser.personaID) { 
            if (this.personeListArr[i]._LstRoles!.includes(descrTipo)  || this.personeListArr[i].id === this.currUser.personaID) { 

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
      }})
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
