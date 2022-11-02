import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Classe } from 'src/app/_models/CLS_Classe';
import { MAT_Materia } from 'src/app/_models/MAT_Materia';

//components

//services


//classes
import { MAT_Obiettivo } from 'src/app/_models/MAT_Obiettivo';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { ClassiService } from '../../classi/classi.service';
import { MaterieService } from '../../materie/materie.service';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { ObiettiviService } from '../obiettivi.service';

@Component({
  selector: 'app-obiettivo-edit',
  templateUrl: './obiettivo-edit.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettivoEditComponent implements OnInit {

//#region ----- Variabili -------

obiettivo$!:                Observable<MAT_Obiettivo>;
obsClassi$!:                Observable<CLS_Classe[]>;
obsAnni$!:                  Observable<ASC_AnnoScolastico[]>;
obsMaterie$!:               Observable<MAT_Materia[]>;


form! :                     FormGroup;
emptyForm :                 boolean = false;
loading:                    boolean = true;
//#endregion

constructor(
  public _dialogRef: MatDialogRef<ObiettivoEditComponent>,
  @Inject(MAT_DIALOG_DATA) public obiettivoID: number,
  private svcObiettivi:                   ObiettiviService,
  private svcClassi:                      ClassiService,
  private svcAnni:                        AnniScolasticiService,
  private svcMaterie:                     MaterieService,


  private _loadingService :               LoadingService,
  private fb:                             FormBuilder, 
  public _dialog:                         MatDialog,
  private _snackBar:                      MatSnackBar,
  
) { 
  _dialogRef.disableClose = true;
  
  this.form = this.fb.group({
    id:                         [null],
    descrizione:                ['', { validators:[ Validators.required, Validators.maxLength(100)]}],
    classeID:                   [''],
    annoID:                     [''],
    materiaID:                  ['']
  });

}

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){


    this.obsClassi$ = this.svcClassi.list();
    this.obsAnni$= this.svcAnni.list();
    this.obsMaterie$ = this.svcMaterie.list();

    if (this.obiettivoID && this.obiettivoID + '' != "0") {

      const obsObiettivo$: Observable<MAT_Obiettivo> = this.svcObiettivi.get(this.obiettivoID);
      const loadObiettivo$ = this._loadingService.showLoaderUntilCompleted(obsObiettivo$);
      this.obiettivo$ = loadObiettivo$
      .pipe(
          tap(
            obiettivo => this.form.patchValue(obiettivo)
          )
      );
    } else {
      this.emptyForm = true
    }

  }
//#endregion

//#region ----- Operazioni CRUD -------

  save(){

    if (this.form.controls['id'].value == null) {
      this.svcObiettivi.post(this.form.value).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }
    else {
      this.svcObiettivi.put(this.form.value).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }
  }

  delete(){

    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result) {
          this.svcObiettivi.delete(Number(this.obiettivoID))
          // .pipe (
          //   finalize(()=>this.router.navigate(['/alunni']))
          // )
          .subscribe(
            res => {
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          );
        }
    });
  }
//#endregion

}
