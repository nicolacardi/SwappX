import { Component, Inject, OnInit }            from '@angular/core';
import { FormBuilder, FormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { concatMap, tap }                                  from 'rxjs/operators';

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
import { CAL_Scadenza, CAL_ScadenzaPersone } from 'src/app/_models/CAL_Scadenza';


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
    private svcIscrizioni:                      IscrizioniService,
    private svcScadenze:                        ScadenzeService,
    private svcScadenzePersone:                 ScadenzePersoneService,

    private svcGenitori:                        GenitoriService,

    @Inject(MAT_DIALOG_DATA) public data:       DialogDataNota,
    private fb:                                 FormBuilder, 
    private svcNote:                            NoteService,
    private _loadingService:                    LoadingService,
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group(
    {
      id:                                       [null],
      iscrizioneID:                             [],
      iscrizioneIDMultiple:                     [],
      personaID:                                [],
      alunnoID:                                 [],
      dtNota:                                   [],
      periodo:                                  [],
      ckFirmato:                                [],
      dtFirma:                                  [],
      ckInvioMsg:                               [false],
      ScadenzaID:                               [],    
      nota:                                     []
    });
  }




  ngOnInit() {
    this.loadData();
  }

  loadData() {

    if (!this.data.notaID || this.data.notaID + '' == "0") {
      console.log ("nota-edit loadData nota, nuova nota");
      this.obsIscrizioni$ = this.svcIscrizioni.listByClasseSezioneAnno(this.data.classeSezioneAnnoID);

      this.form.controls.iscrizioneID.setValue(this.data.iscrizioneID);
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

      this.obsIscrizioni$ = this.svcIscrizioni.listByClasseSezioneAnno(this.data.classeSezioneAnnoID);

      //in teoria potrei anche fare a meno dell'observable e dell'async nel form: potrei passare TUTTI i valori tramite DialogData...tanto li ho già...ma non sarebbe rxJs
      const obsNota$: Observable<DOC_Nota> = this.svcNote.get(this.data.notaID);
      const loadNota$ = this._loadingService.showLoaderUntilCompleted(obsNota$);
      
      this.obsNota$ = loadNota$
      .pipe( tap(
        nota => {
          console.log ("nota-edit loadData nota", nota);
          this.form.patchValue(nota);
          this.iscrizioneID= this.data.iscrizioneID;
          this.alunnoNomeCognome = nota.iscrizione?.alunno.persona.nome! + ' '+ nota.iscrizione?.alunno.persona.cognome!;
          this.form.controls.alunnoID.setValue(nota.iscrizione?.alunnoID);
          this.personaID = this.data.personaID;
          this.personaNomeCognome = nota.persona?.nome! + " " +nota.persona?.cognome!;
        } )
      );
    }
  }

  delete() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(
      result => {
        if(result){
          this.svcNote.delete (this.data.notaID).subscribe(
            res =>{
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          );
        }
      }
    );
  }

  save() {

    console.log ("nota-edit - save iscrizioneIDMultiple", this.form.controls['iscrizioneIDMultiple'].value);

    //ci possono essere 6 casi
    //1 this.form.controls.scadenzaID == null && this.form.controls.id.value == null && this.form.controls.ckInvioMsg.value == true
    //2 this.form.controls.scadenzaID == null && this.form.controls.id.value == null && this.form.controls.ckInvioMsg.value == false
    //3 this.form.controls.scadenzaID == null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == true
    //4 this.form.controls.scadenzaID == null && this.form.controls.id.value != null && this.form.controls.ckInvioMsg.value == false
    //5 this.form.controls.scadenzaID != null &&& this.form.controls.id.value == null && this.form.controls.ckInvioMsg.value == true
    //6 this.form.controls.scadenzaID != null && this.form.controls.id.value == null && this.form.controls.ckInvioMsg.value == false
    //(non è possibile che se scadenzaID != null id sia != null perchè scadenzaID è null se id della nota c'è)
    //caso 1 faccio la POST della scadenza e con scadenzaID faccio la POST della nota
    //caso 2 faccio solo la POST della nota, scadenzaID resta null
    //caso 3 faccio la POST della scadenza e con scadenzaID faccio la PUT della nota    
    //caso 4 scadenzaID resta null, faccio la PUT della nota
    //caso 5 scadenzaID resta quello che è, faccio la PUT della nota 
    //caso 6 cancello la scadenza e da scadenzaPersone dove scadenzaID, imposto scadenzaID = null e faccio la PUT della nota


    if (this.form.controls['id'].value == null) {
      //POST NOTA
      this.form.controls['iscrizioneIDMultiple'].value.forEach((iscrizioneID: number) =>{
        this.form.controls.iscrizioneID.setValue(iscrizioneID);
        this.svcNote.post(this.form.value).subscribe(
          res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        );
      });
    }
    else { 
      //PUT NOTA
      this.svcNote.put(this.form.value).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }
  }


  invioNotaGenitori(checked: boolean) {
    return;


    if (checked) {  //devo vedere se non è già stato inviato in precedenza e se non lo è stato inviare
    console.log ("nota-edit - invioNotaGenitori");
    const objScadenza = <CAL_Scadenza>{
      dtCalendario: this.form.controls.dtNota.value,
      title: this.form.controls.nota.value,
      start: this.form.controls.dtNota.value,
      end: this.form.controls.dtNota.value,
      color: "#FF0000",
      ckPromemoria: true,
      ckRisposta: false,
      h_Ini: '12:00:00',
      h_End: '13:00:00',
      PersonaID: this.personaID,
      TipoScadenzaID: 6
    }
    console.log ("nota-edit - invioNotaGenitori objScadenza", objScadenza);

    objScadenza.id = 0;
      //this.svcLezioni.post(this.form.value).subscribe(
      this.svcScadenze.post(objScadenza).subscribe(
        res => {
          console.log ("nota-edit - invioNotaGenitori res", res);
          this.insertPersone(this.form.controls.alunnoID.value, res.id);
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    } else {

    }
  }

  insertPersone(alunnoID: number, scadenzaID: number) {
    //estraggo i personaID dei genitori
    console.log ("nota-edit - insertpersone - alunnoID", alunnoID, "scadenzaID", scadenzaID);

    this.svcGenitori.listByAlunno(alunnoID)
    .subscribe(
      res=> res.forEach( genitore => {
        let objScadenzaPersona: CAL_ScadenzaPersone = {
          personaID: genitore.id,
          scadenzaID : scadenzaID,
          ckLetto: false,
          ckAccettato: false,
          ckRespinto: false,
        }
        console.log ("nota-edit - insertpersone - genitore", genitore);

        this.svcScadenzePersone.post(objScadenzaPersona).subscribe();
      })
    );  
  }
}
