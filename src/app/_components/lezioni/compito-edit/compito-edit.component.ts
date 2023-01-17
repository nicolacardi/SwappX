import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

//components
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService } from '../../utilities/loading/loading.service';

//models
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { LezioniService } from '../lezioni.service';
import { VotiCompitiService } from '../voti-compiti.service';

@Component({
  selector: 'app-compito-edit',
  templateUrl: './compito-edit.component.html',
  styleUrls: ['./../lezioni.css']
})
export class CompitoEditComponent implements OnInit {

//#region ----- Variabili -------

  obsLezioni$!:                                 Observable<CAL_Lezione[]>;
  lezione$!:                                    Observable<CAL_Lezione>;
  
  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  breakpoint!:                number;
//#endregion

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data:       CAL_Lezione,
    public _dialogRef:                          MatDialogRef<CompitoEditComponent>,
    private fb:                                 FormBuilder,
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    private _loadingService :                   LoadingService,
    private svcLezioni:                         LezioniService,
    private svcVotiCompiti:                     VotiCompitiService,

  ) { 
    _dialogRef.disableClose = true;
    this.form = this.fb.group({
      id:                                       [null],
      ckCompito:                                [false],
      argomentoCompito:                         [''],
    });

  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    this.obsLezioni$= this.svcLezioni.listByDocente(this.data.docenteID);
    //********************* POPOLAMENTO FORM *******************
    if (this.data.id) {

      const obsLezione$: Observable<CAL_Lezione> = this.svcLezioni.get(this.data.id);
      const loadLezione$ = this._loadingService.showLoaderUntilCompleted(obsLezione$);
      
      this.lezione$ = loadLezione$
      .pipe( 
        tap( val => this.form.patchValue(val) )
      );
    
    } 
    else this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD -------
  save(){

    //ATTENZIONISSIMA!
    //QUI LA SAVE DI UN NUOVO RECORD IMPLICA IMPOSTARE IL CKCOMPITO A TRUE
    //MENTRE LA SAVE DI UNO ESISTENTE IMPLICA FARE LA PUT DEL CAMPO ARGOMENTO
    //ATTENZIONISSIMA: SE UNO "CAMBIA" L'ID LEZIONE IN TEORIA BISOGNEREBBE METTERE A FALSE IL CKCOMPITO DELLA LEZIONE IN CUI SI TROVAVA
    //E POI METTERE A TRUE QUELLO NUOVO

    //TUTTE DA RIVEDERE QUINDI
    if (this.form.controls.id.value == null){

      this.svcLezioni.put(this.form.value)
      .subscribe(
        val => this._dialogRef.close(),
        err=>  this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }
    else {
      this.svcLezioni.put(this.form.value)
      .subscribe(
        val => this._dialogRef.close(),
        err=>  this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
  }

  delete(){
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del compito ?"}
    });
    //TODO: vanno cancellati tutti i compiti della lezione
    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcVotiCompiti.deleteByLezione(this.data.id).subscribe();
        for (const prop in this.form.controls) {
          this.form.value[prop] = this.form.controls[prop].value;
        }
        this.form.controls.ckCompito.setValue(false);
        this.svcLezioni.put(this.form.value).subscribe(
          res=> {
            console.log ("ho cancellato i voti");
            this._dialogRef.close();
          },
          //this.VotiCompitoListComponent.loadData(),  //qui non serve fare la loadData, c'è un ngIf e quindi è nascosto, e poi non funzionerebbe per questo stesso motivo
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        );
      } 
      else {
        this.form.controls.ckCompito.setValue(true);
      }
    });
  }

  
  
//#endregion

}
