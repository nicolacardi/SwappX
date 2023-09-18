//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { AnniScolasticiService } from '../anni-scolastici.service';

//classes
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { DialogDataAnnoEdit } from 'src/app/_models/DialogData';
import { FormatoData, Utility } from '../../utilities/utility.component';

//#endregion

@Component({
  selector: 'app-annoscolastico-edit',
  templateUrl: './annoscolastico-edit.component.html',
  styleUrls: ['../anniscolastici.css']
})
export class AnnoscolasticoEditComponent implements OnInit {

  //#region ----- Variabili ----------------------

  anno$!:                     Observable<ASC_AnnoScolastico>;
  obsAnni$!:                  Observable<ASC_AnnoScolastico[]>;

  form! :                     UntypedFormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  
//#endregion


//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<AnnoscolasticoEditComponent>,
                    @Inject(MAT_DIALOG_DATA) public data:   DialogDataAnnoEdit,
                    private svcAnni :                       AnniScolasticiService,
                    private _loadingService :               LoadingService,
                    private fb:                             UntypedFormBuilder, 
                    public _dialog:                         MatDialog,
                    private _snackBar:                      MatSnackBar ) { 

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
        id:                                     [null],
        anno1:                                  ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
        anno2:                                  [''],
        annoscolastico:                         [''],
        dtInizio:                               [''],
        dtFineQ1:                               [''],
        dtFine:                                 ['']
      });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    this.obsAnni$ = this.svcAnni.list();

    if (this.data.annoID && this.data.annoID + '' != "0") {

      const obsAnno$: Observable<ASC_AnnoScolastico> = this.svcAnni.get(this.data.annoID);
      const loadAnno$ = this._loadingService.showLoaderUntilCompleted(obsAnno$);
      this.anno$ = loadAnno$
        .pipe(
          tap(
            anno => {
              this.form.patchValue(anno);
              console.log ("annoscolastico-edit - loadData - anno", anno)
            }
          )
      );
    } 
    else 
        this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save(){

    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Funzione non abilitata', panelClass: ['red-snackbar']})

    //TODO!!!
    /*
    if (this.form.controls['id'].value == null) {
      this.svcAnni.post(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
        });
    }
    else {
      this.svcAnni.put(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
        });
    }
    */
  }

  delete(){

    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Funzione non abilitata', panelClass: ['red-snackbar']})
    /*
    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          this.svcAnni.delete(Number(this.data.materiaID)).subscribe({
            next: res=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
    */
  }


  updateDt(dt: string, control: string){

    //prendo la stringa e ne estraggo i pezzi
    const parts = dt.split('/'); // Split the input string by '/'
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    // creo la nuova data con i valori estratti (assumendo l'ordine day/month/year)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // formatto la data al tipo richiesto dal controllo data ('yyyy-MM-dd')
    let formattedDate = date.toISOString().slice(0, 10);

    //piccolo step per evitare che 1/1/2008 diventi 31/12/2007
    formattedDate = Utility.formatDate(date, FormatoData.yyyy_mm_dd);

    //impostazione della data finale
    this.form.controls[control].setValue(formattedDate);
  }

//#endregion


}