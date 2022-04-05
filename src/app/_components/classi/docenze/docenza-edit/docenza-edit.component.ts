import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CLS_ClasseDocenteMateria } from 'src/app/_models/CLS_ClasseDocenteMateria';
import { LoadingService } from '../../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../../utilities/snackbar/snackbar.component';
import { DocenzeService } from '../docenze.service';

@Component({
  selector: 'app-docenza-edit',
  templateUrl: './docenza-edit.component.html',
  styleUrls: ['../../classi.css']
})
export class DocenzaEditComponent implements OnInit {

//#region ----- Variabili -------

  docenza$!:                  Observable<CLS_ClasseDocenteMateria>;
  strMateria!:                string;
  strDocente!:                string;
  strClasseSezioneAnno!:      string;

  form! :                     FormGroup;
//#endregion

  constructor(
    @Inject(MAT_DIALOG_DATA) public idDocenza: number,
    public _dialogRef:                          MatDialogRef<DocenzaEditComponent>,
    private svcDocenze:                         DocenzeService,
    private _loadingService :                   LoadingService,
    private fb:                                 FormBuilder,
    private _snackBar:                          MatSnackBar,



  ) { 
    this.form = this.fb.group({
      id:                         [null],
      ckPagella:                  [''],
      ckOrario:                   [''],
      docenteID:                  [''],
      materiaID:                  [''],
      classeSezioneAnnoID:        ['']
    });
  }

  ngOnInit(){
    this.loadData();
  }

  loadData() {

    if (this.idDocenza && this.idDocenza + '' != "0") {

      const obsDocenza$: Observable<CLS_ClasseDocenteMateria> = this.svcDocenze.get(this.idDocenza);
      const loadDocenza$ = this._loadingService.showLoaderUntilCompleted(obsDocenza$);
      
      this.docenza$ = loadDocenza$.pipe(
          tap(
            docenza => {
              this.form.patchValue(docenza);
              this.strMateria = docenza.materia.descrizione;
              this.strDocente = docenza.docente.persona.nome + ' ' + docenza.docente.persona.cognome;
              this.strClasseSezioneAnno = docenza.classeSezioneAnno.classeSezione.classe.descrizione + ' ' + docenza.classeSezioneAnno.classeSezione.sezione;

            }
          )
      );
    }

  }

  save() {

    // if (this.form.controls['id'].value == null) //ma non sarebbe == 0?
    // this.svcAlunni.post(this.form.value)
    //   .subscribe(res=> {
    //     this._dialogRef.close();
    //     this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
    //   },
    //   err=> (
    //     this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    //   )
    // );
    // else 

    //TODO QUI BISOGNA INSERIRE UNA SERIE DI CONTROLLI:
    //-se uno toglie la materia dall'orario......
    //        - verificare se ci sono già compiti inseriti, firme eseguite e, nel caso, bloccare l'operazione
    //        - in alternativa informare l'utente che se procede cancellerà eventuali record inseriti e procedere cancellando nelle varie tabelle 
    //-se uno toglie la materia dalla pagella....
    //        - verificare che non siano state inseriti già record in qualche pagella con questa materia in questa classeSezioneAnno
    //        - chiedere all'utente se questa modifica la vuole fare SOLO per questa classeSezioneAnno oppure per tutte le classi uguali DELL'ANNO 
    //          (di norma così sarebbe, perchè non ha senso che si voglia togliere dalla pagella di una I A e non della I C...) 
    //          (attenzione, stiamo parlando di quelle uguali dello stesso anno)

      this.svcDocenze.put(this.form.value)
        .subscribe(res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      );
  }

  delete() {
    this.svcDocenze.delete(this.form.controls.id.value)
    .subscribe(res=> {
      this._dialogRef.close();
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record Elieminato', panelClass: ['green-snackbar']});
    },
    err=> (
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore durante la cancellazione', panelClass: ['red-snackbar']})
    )
    );
  }

}
