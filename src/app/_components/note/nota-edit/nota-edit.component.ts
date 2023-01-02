import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { NoteService }                          from '../note.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { UserService }                          from 'src/app/_user/user.service';

//models
import { DOC_Nota }                             from 'src/app/_models/DOC_Nota';
import { DialogDataNota } from 'src/app/_models/DialogData';


@Component({
  selector: 'app-nota-edit',
  templateUrl: './nota-edit.component.html',
  styleUrls: ['../note.component.css']
})

export class NotaEditComponent implements OnInit {

//#region ----- Variabili -------
  nota$!:                                       Observable<DOC_Nota>;
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

    @Inject(MAT_DIALOG_DATA) public data:       DialogDataNota,
    private fb:                                 FormBuilder, 
    private svcNote:                            NoteService,
    private _loadingService:                    LoadingService,
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar
  ) 
  { 
    _dialogRef.disableClose = true;

    this.form = this.fb.group(
    {
      id:                                       [null],
      iscrizioneID:                             [],
      personaID:                                [],
      dtNota:                                   [],
      periodo:                                  [],
      ckFirmato:                                [],
      dtFirma:                                  [],
      nota:                                     []
    });
  }


  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    if (this.data.notaID && this.data.notaID + '' != "0") {
    
      //in teoria potrei anche fare a meno dell'observable e dell'async nel form: potrei passare TUTTI i valori tramite DialogData...tanto li ho già...ma non sarebbe rxJs
      const obsNota$: Observable<DOC_Nota> = this.svcNote.get(this.data.notaID);
      const loadNota$ = this._loadingService.showLoaderUntilCompleted(obsNota$);
      
      
      this.nota$ = loadNota$
      .pipe( tap(
        nota => {
          this.form.patchValue(nota); //questo è fondamentale. Infatti anche se passassi i dati dal DialogData è il form che va "nutrito", non tanto le variabili
          this.iscrizioneID= this.data.iscrizioneID;
          this.alunnoNomeCognome = nota.iscrizione?.alunno.persona.nome! + ' '+ nota.iscrizione?.alunno.persona.cognome!;
          //this.personaID = nota.persona?.id!;
          this.personaID = this.data.personaID;
          this.personaNomeCognome = nota.persona?.nome! + " " +nota.persona?.cognome!;
        } )
      );
    } else {
      this.form.controls.iscrizioneID.setValue(this.data.iscrizioneID);
      this.form.controls.dtNota.setValue(new Date());

      this.svcUser.obscurrentUser.subscribe( val => {
        this.personaID = val.personaID;
        this.personaNomeCognome = val.fullname;
        this.form.controls.personaID.setValue(val.personaID);
        this.form.controls.ckFirmato.setValue(false);
        this.form.controls.periodo.setValue(1); //per ora ho messo un valore fisso....BELLA MERDA

      });
      this.emptyForm = true;
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
    console.log (this.form.value);
    if (this.form.controls['id'].value == null) 
          this.svcNote.post(this.form.value)
            .subscribe(res=> {
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            err=> (
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
            )
        );
        else 
          this.svcNote.put(this.form.value)
            .subscribe(res=> {
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            err=> (
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
            )
        );
  }
}
