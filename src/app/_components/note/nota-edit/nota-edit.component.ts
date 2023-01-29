import { Component, Inject, OnInit }            from '@angular/core';
import { FormBuilder, FormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { concatMap, finalize, tap }                                  from 'rxjs/operators';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { NoteService }                          from '../note.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { UserService }                          from 'src/app/_user/user.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { GenitoriService }                      from '../../genitori/genitori.service';
import { ScadenzeService }                      from '../../scadenze/scadenze.service';
import { ScadenzePersoneService }               from '../../scadenze/scadenze-persone.service';

//models
import { DOC_Nota }                             from 'src/app/_models/DOC_Nota';
import { DialogDataNota }                       from 'src/app/_models/DialogData';
import { CAL_Scadenza, CAL_ScadenzaPersone }    from 'src/app/_models/CAL_Scadenza';
import { NoteIscrizioniService } from '../noteiscrizioni.service';
import { DOC_NotaIscrizione } from 'src/app/_models/DOC_NotaIscrizione';


@Component({
  selector: 'app-nota-edit',
  templateUrl: './nota-edit.component.html',
  styleUrls: ['../note.css']
})

export class NotaEditComponent implements OnInit {

//#region ----- Variabili -------
  obsNota$!:                                    Observable<DOC_Nota>;
  obsIscrizioni$!:                              Observable<CLS_Iscrizione[]>;

  form! :                                       FormGroup;
  personaNomeCognome!:                          string;
  personaID!:                                   number;
  iscrizioneID!:                                number;
  alunnoNomeCognome!:                           string;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  breakpoint!:                                  number;
//#endregion

  constructor( 
    public _dialogRef:                          MatDialogRef<NotaEditComponent>,
    private svcUser:                            UserService,
    private svcNote:                            NoteService,
    private svcIscrizioni:                      IscrizioniService,
    private svcNoteIscrizioni:                  NoteIscrizioniService,

    private svcScadenze:                        ScadenzeService,
    private svcScadenzePersone:                 ScadenzePersoneService,

    private svcGenitori:                        GenitoriService,

    @Inject(MAT_DIALOG_DATA) public data:       DialogDataNota,
    private fb:                                 FormBuilder, 
    private _loadingService:                    LoadingService,
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group(
    {
      id:                                       [null],
      iscrizioneID:                             [],
      iscrizioni:                               [],
      personaID:                                [],
      alunnoID:                                 [],
      dtNota:                                   [],
      h_Ini:                                    [],
      h_End:                                    [],
      periodo:                                  [],
      ckFirmato:                                [],
      dtFirma:                                  [],
      ckInvioMsg:                               [false],
      nota:                                     []
    });

    this.obsIscrizioni$ = this.svcIscrizioni.listByClasseSezioneAnno(this.data.classeSezioneAnnoID);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {

    if (!this.data.notaID || this.data.notaID + '' == "0") {
      console.log ("nota-edit loadData nota, nuova nota");

      this.form.controls.iscrizioni.setValue(this.data.iscrizioni);
      this.form.controls.dtNota.setValue(new Date());

      this.svcUser.obscurrentUser.subscribe( val => {
        console.log ("current user", val);
        this.form.controls.personaID.setValue(val.personaID);
        this.form.controls.ckFirmato.setValue(false);
        this.form.controls.periodo.setValue(1); //per ora ho messo un valore fisso....TODO
        this.personaID = val.personaID;
        this.personaNomeCognome = val.fullname;

      });
      
      this.emptyForm = true;
    } 
    else {

      let iscrizioniArr : number[] = [];
      //in teoria potrei anche fare a meno dell'observable e dell'async nel form: potrei passare TUTTI i valori tramite DialogData...tanto li ho già...ma non sarebbe rxJs
      const obsNota$: Observable<DOC_Nota> = this.svcNote.get(this.data.notaID);
      const loadNota$ = this._loadingService.showLoaderUntilCompleted(obsNota$);
      this.obsNota$ = loadNota$
      .pipe( tap(
        nota => {
          //console.log ("nota-edit loadData nota", nota);
          this.form.patchValue(nota);
          for (let i=0; i < nota._NotaIscrizioni.length ; i++){ 
            iscrizioniArr.push(nota._NotaIscrizioni[i].iscrizioneID)
          }
          this.form.controls.iscrizioni.setValue(iscrizioniArr);
          this.personaID = this.data.personaID;
          this.personaNomeCognome = nota.persona?.nome! + " " +nota.persona?.cognome!;
        } )
      );
    }
  }

  delete() {

    //Vengono anche cancellate le scadenze (e le scadenzePersone) che eventualmente fossero presenti nel record
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(
      result => {
        if(result){


          //bisogna prima cancellare eventuali scadenze con notaID dentro e conseguentemente scadenzePersone con quelle scadenzeID dentro
          //nell'ordine:
            //1. cancellare da ScadenzePersone
            //2. cancellare da Scadenze
            //3. cancellare da NoteIscrizioni
            //4. cancellare da Note



            // this.svcScadenze.listByNota(this.data.notaID)
            // subscribe(
            //   //ciclo for e non forEach!!
            //   (res: CAL_Scadenza) => res.forEach(
            //     this.svcScadenzePersone.deleteByScadenza(res.id)
            //     this.svcScadenze.delete(res.id)
            //     .subscribe(
            //       //E SE NON CE NE SONO DI SCADENZE?
            //     )
            //   )
            //   //ora posso cancellare le scadenze
            // )


            
            // this.svcScadenzePersone.deleteByScadenza(scadenzaIDTodelete)
            //       .pipe(
            //         concatMap(()=> this.svcScadenze.deleteByNota(this.data.notaID))
            //       )
            //       .subscribe(
            //         res=>{console.log ("cancellazione scadenza e persone a buon fine");},
            //         err=>{console.log ("errore in cancellazione scadenza o cancellazione persone")}
            //       )


          this.svcNoteIscrizioni.deleteByNota(this.data.notaID)
            .pipe(
              concatMap(()=> this.svcNote.delete(this.data.notaID))
            )
          .subscribe(
            res=> {
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}) 
          );


          // let scadenzaIDTodelete = this.form.controls.scadenzaID.value;

          
          // this.svcNote.delete (this.data.notaID).subscribe(
          //   res =>{
          //     //vanno prima cancellati i record di scadenzapersone!
          //     if (scadenzaIDTodelete){
          //       this.svcScadenzePersone.deleteByScadenza(scadenzaIDTodelete)
          //       .pipe(
          //         concatMap(()=> this.svcScadenze.delete(scadenzaIDTodelete))
          //       )
          //       .subscribe(
          //         res=>{console.log ("cancellazione scadenza e persone a buon fine");},
          //         err=>{console.log ("errore in cancellazione scadenza o cancellazione persone")}
          //       )
          //     }

          //     this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
          //     this._dialogRef.close();
          //   },
          //   err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          // );
        }
      }
    );
  }

  save() {


    // ***************calcolo hEnd *****************
    // a prescindere, lo faccio nel caso debba servire impostarla
    //prendo la data corrente
    let dtTMP = new Date (this.form.controls.dtNota.value);

    //ci metto l'H_Ini
    dtTMP.setHours(this.form.controls.h_Ini.value.substring(0,2));
    dtTMP.setMinutes(this.form.controls.h_Ini.value.substring(3,5));

    let setHours = 0;
    let setMinutes = 0;
    let setSeconds = 0;

    //aggiungo un'ora (nelle lezioni si faceva con un limite)
    // if ((dtTMP.getHours() + 1) > 15) { 
    //   setHours = 15;
    //   setMinutes = 0;
    // } 
    // else { 
      setHours = (dtTMP.getHours() + 1)
      setMinutes = (dtTMP.getMinutes())
    // }

    let dtTMP2 = new Date (dtTMP.setHours(setHours));
    dtTMP2.setMinutes(setMinutes);
    dtTMP2.setSeconds(setSeconds);

    let dtISO = dtTMP2.toLocaleString();
    let dtTimeNew = dtISO.substring(11,19); //tutto quanto sopra per arrivare a questa dtTimeNew da impostare come hEnd

    this.form.controls.h_End.setValue (dtTimeNew)
    //**********fine calcolo h_End ***************

    //preparo anche objScadenza a prescindere
    const objScadenza = <CAL_Scadenza>{
      dtCalendario: this.form.controls.dtNota.value,
      title: "NOTA DISCIPLINARE: " + this.form.controls.nota.value,
      start: this.form.controls.dtNota.value,
      end: this.form.controls.dtNota.value,
      color: "#FF0000",
      ckPromemoria: true,
      ckRisposta: false,
      h_Ini: this.form.controls.h_Ini.value,
      h_End: this.form.controls.h_End.value,
      PersonaID: this.personaID,
      TipoScadenzaID: 6,  //Fa schifetto  TODO
    }

    //console.log ("nota-edit - save this.form:", this.form.value);

    //ci possono essere 6 casi
    //00 this.form.controls.scadenzaID == null && this.form.controls.id.value == null && this.form.controls.ckInvioMsg.value == false

    //3 this.form.controls.scadenzaID == null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == true
    //4 this.form.controls.scadenzaID == null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == false
    //5 this.form.controls.scadenzaID != null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == true
    //6 this.form.controls.scadenzaID != null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == false

    //(non è possibile che se scadenzaID != null id sia != null perchè scadenzaID è null se id della nota c'è)
        //caso 00 faccio solo la POST della nota, scadenzaID resta null

    //caso 3 faccio la POST della scadenza e con scadenzaID faccio la PUT della nota    
    //caso 4 scadenzaID resta null, faccio la PUT della nota
    //caso 5 faccio la PUT della scadenza e faccio la PUT della nota, anche asincrone
    //caso 6 faccio la DELETE della scadenza e faccio la PUT della nota, anche asincrone

    // console.log ("nota-edit - this.form.controls.scadenzaID.value:", this.form.controls.scadenzaID);
    // console.log ("nota-edit - this.form.controls.id.value:", this.form.controls.id);
    // console.log ("nota-edit - this.form.controls.ckInvioMsg.value:", this.form.controls.ckInvioMsg.value);



    if (this.form.controls.id.value == null) {
      // caso 00 : Nuova Nota
      console.log ("nuova nota");     
      this.svcNote.post(this.form.value)
      .subscribe(
        nota=> {
            this.form.controls.iscrizioni.value.forEach( (iscrizione: number) => {
            const objNotaIscrizione = <DOC_NotaIscrizione>{
              notaID: nota.id,
              iscrizioneID: iscrizione
            } 
            this.svcNoteIscrizioni.post(objNotaIscrizione).subscribe();
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          })

          if(this.form.controls.ckInvioMsg.value) {
            console.log ("invioMsg");
            //DEVO INSERIRE TANTE SCADENZE QUANTE LE ISCRIZIONI
            //serve notaID appena inserito
            this.form.controls.iscrizioni.value.forEach( (iscrizione: number) => {
              this.svcIscrizioni.get(iscrizione)
              .subscribe(
                (iscrizione:CLS_Iscrizione) => {
                  //console.log ("iscrizione estratta:", iscrizione)
                  //inserisco la scadenza
                  const objScadenzaX = <CAL_Scadenza>{
                    dtCalendario: this.form.controls.dtNota.value,
                    title: "NOTA DISCIPLINARE PER " + iscrizione.alunno!.persona.nome + ' ' + iscrizione.alunno!.persona.cognome +"-" + this.form.controls.nota.value,
                    start: this.form.controls.dtNota.value,
                    end: this.form.controls.dtNota.value,
                    color: "#FF0000",
                    ckPromemoria: true,
                    ckRisposta: false,
                    h_Ini: this.form.controls.h_Ini.value,
                    h_End: this.form.controls.h_End.value,
                    PersonaID: this.personaID,
                    TipoScadenzaID: 6,  //Fa schifetto  TODO
                    NotaID: nota.id
                  }
                  //console.log ("objScadenzaX", objScadenzaX);
                  this.svcScadenze.post(objScadenzaX)
                  .subscribe(
                    scad => {
                      //inserisco i genitori nella tabella ScadenzaPersone
                      this.insertGenitori(iscrizione.alunnoID, scad.id)
                    }
                  )
                }
              ) 
            })
          }
        },
        err=>this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      )
    } else {
      

    }




    // caso 3 : Nota Esistente + ScadenzaID non c'è in precedenza + è stato selezionato l'invio del Messaggio
    if (this.form.controls.scadenzaID.value == null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == true) {
      console.log ("caso3");
      //POST SCADENZA
      objScadenza.id = 0;
      //this.svcLezioni.post(this.form.value).subscribe(
      this.svcScadenze.post(objScadenza).subscribe(
        res => {
          this.insertGenitori(this.form.controls.alunnoID.value, res.id);
          this.form.controls.scadenzaID.setValue(res.id);
          //console.log ("ora faccio la put della nota");
          //PUT NOTA usando ScadenzaID appena creata (callback hell?)
          this.svcNote.put(this.form.value).subscribe(
            res=> {
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          );
          console.log ("inserimento Scadenza a buon fine - ScadenzaID:", res.id);
        },
        err =>  console.log ("errore inserimento Scadenza")
      );
    }

    // caso 4 : Nota Esistente + ScadenzaID non c'è in precedenza + NON è stato selezionato l'invio del Messaggio
    if (this.form.controls.scadenzaID.value == null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == false) {
      console.log ("caso4");
      //PUT NOTA
      this.svcNote.put(this.form.value)
      .pipe(
        concatMap( val=> this.svcNoteIscrizioni.deleteByNota(this.data.notaID))
      )
      .subscribe(
        res=> {
          //nel concatMap ho PULITO tutto, ora vado a ripostare le iscrizioni presenti nella combo multiple
          this.form.controls.iscrizioni.value.forEach( (iscrizione: number) => {
            
            const objNotaIscrizione = <DOC_NotaIscrizione>{
              notaID: this.data.notaID,
              iscrizioneID: iscrizione
            }
            
            this.svcNoteIscrizioni.post(objNotaIscrizione).subscribe();
          }
          )
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }


    // caso 5 : Nota Esistente + ScadenzaID c'è già + è stato selezionato l'invio del Messaggio
    if (this.form.controls.scadenzaID.value != null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == true) {
      console.log ("caso5");
      //PUT SCADENZA
      objScadenza.id = this.form.controls.scadenzaID.value;
      this.svcScadenze.put(objScadenza).subscribe(
        res => {
          //this.insertGenitori(this.form.controls.alunnoID.value, res.id); I genitori già ci sono in scadenzapersone
          //this.form.controls.ScadenzaID.setValue(res.id);
          //PUT NOTA
          this.svcNote.put(this.form.value).subscribe(
            res=> {
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          );
          console.log ("aggiornamento Scadenza a buon fine - ScadenzaID:", res.id);
        },
        err =>  console.log ("errore aggiornamento Scadenza")
      );
    }
    
    //caso 6 : Nota Esistente + ScadenzaID c'è già + è stato selezionato di non inviare il messaggio
    if (this.form.controls.scadenzaID.value != null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == false) {
      console.log ("caso6");
      //PUT SCADENZA
      let scadenzaIDTodelete = this.form.controls.scadenzaID.value;

      this.form.controls.scadenzaID.setValue(null);
      this.svcNote.put(this.form.value).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});

          //Vanno prima cancellati i record di scadenzapersone!
          this.svcScadenzePersone.deleteByScadenza(scadenzaIDTodelete)
          .pipe(
            concatMap(()=> this.svcScadenze.delete(scadenzaIDTodelete))
          )
          .subscribe(
            res=>{console.log ("cancellazione scadenza e persone a buon fine");},
            err=>{console.log ("errore in cancellazione scadenza o cancellazione persone")}
          )
        },
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }
  }


  insertGenitori(alunnoID: number, scadenzaID: number) {

    //Se si volesse inserire il maestro tra coloro che lo ricevono...
    let objScadenzaPersona: CAL_ScadenzaPersone = {
      personaID: this.form.controls.personaID.value,
      scadenzaID : scadenzaID,
      ckLetto: false,
      ckAccettato: false,
      ckRespinto: false,
    }
    this.svcScadenzePersone.post(objScadenzaPersona).subscribe();

    //estraggo i personaID dei genitori
    //console.log ("nota-edit - insertpersone - alunnoID", alunnoID, "scadenzaID", scadenzaID);

    this.svcGenitori.listByAlunno(alunnoID)
    .subscribe(
      res=> {

      if (res.length != 0) {
        res.forEach( genitore => {
          let objScadenzaPersona: CAL_ScadenzaPersone = {
            personaID: genitore.persona.id,
            scadenzaID : scadenzaID,
            ckLetto: false,
            ckAccettato: false,
            ckRespinto: false,
          }
          console.log ("nota-edit - insertpersone - genitore", genitore);

          this.svcScadenzePersone.post(objScadenzaPersona).subscribe();
        })
      } else {
        console.log ("nessun genitore da inserire, ", res);
      }
      return;
    },
      err=> {console.log ("errore in inserimento genitori", err)}
    );  
  }
}
