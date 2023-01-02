import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DialogDataNota } from 'src/app/_models/DialogData';
import { DOC_Nota } from 'src/app/_models/DOC_Nota';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { NoteService } from '../note.service';

@Component({
  selector: 'app-nota-edit',
  templateUrl: './nota-edit.component.html',
  styleUrls: ['../note.component.css']
})
export class NotaEditComponent implements OnInit {

//#region ----- Variabili -------

  form! :                     FormGroup;

  nota$!:                  Observable<DOC_Nota>;

  emptyForm :                 boolean = false;

//#endregion

  constructor(
    public _dialogRef:              MatDialogRef<NotaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public notaID: number,

    private fb:                     FormBuilder, 
    private svcNote:                NoteService,
    private _loadingService:        LoadingService,
    public _dialog:                 MatDialog,
    private _snackBar:              MatSnackBar,




  ) { 

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      id:                         [null],
      iscrizioneID:               [],
      personaiD:                  [],
      dtNota:                     [],
      periodo:                    [],
      ckFirmato:                  [],
      dtFirma:                    [],
      nota:                       []
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    if (this.notaID && this.notaID + '' != "0") {

      const obsNota$: Observable<DOC_Nota> = this.svcNote.get(this.notaID);
      const loadNota$ = this._loadingService.showLoaderUntilCompleted(obsNota$);
      this.nota$ = loadNota$
      .pipe( tap(
        nota => {
          this.form.patchValue(nota)
          //oltre ai valori del form vanno impostate alcune variabili: una data e alcune stringhe
          // this.dtStart = new Date (this.data.start);
          // this.strDtStart = Utility.formatDate(this.dtStart, FormatoData.yyyy_mm_dd);
          // this.strH_Ini = Utility.formatHour(this.dtStart);

          // this.dtEnd = new Date (this.data.end);
          // this.strH_End = Utility.formatHour(this.dtEnd);
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
          this.svcNote.delete (this.notaID).subscribe(
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

  }
}
