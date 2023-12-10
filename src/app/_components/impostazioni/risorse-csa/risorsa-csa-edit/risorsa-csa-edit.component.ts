//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable, firstValueFrom }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { RisorseCSAService }                    from 'src/app/_components/impostazioni/risorse-csa/risorse-csa.service';
import { TipiDocumentoService }                 from '../tipi-documento.service';

//models
import { DialogDataRisorsaClasseEdit }          from 'src/app/_models/DialogData';
import { CLS_RisorsaCSA }                       from 'src/app/_models/CLS_RisorsaCSA';
import { DOC_TipoDocumento }                    from 'src/app/_models/DOC_TipoDocumento';
import { _UT_Risorsa } from 'src/app/_models/_UT_Risorsa';
import { RisorseService } from '../../risorse/risorse.service';
import { DialogOkComponent } from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';


@Component({
  selector: 'app-risorsa-csa-edit',
  templateUrl: './risorsa-csa-edit.component.html',
  styleUrls: ['../risorse-csa.css']
})
export class RisorsaCSAEditComponent {

//#region ----- Variabili ----------------------

  risorsaCSA$!:                                 Observable<CLS_RisorsaCSA>;
  obsRisorseCSA$!:                              Observable<CLS_RisorsaCSA[]>;
  obsTipiDocumento$!:                           Observable<DOC_TipoDocumento[]>;
  obsRisorse$!:                                 Observable<_UT_Risorsa[]>;

  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;

  //#endregion

  //#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<RisorsaCSAEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data:       DialogDataRisorsaClasseEdit,
              private svcRisorseCSA:            RisorseCSAService,
              private svcRisorse:               RisorseService,
              private svcTipiDocumento:         TipiDocumentoService,
              private _loadingService :         LoadingService,
              private fb:                       UntypedFormBuilder, 
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar ) { 
    
    _dialogRef.disableClose = true;
    
    this.form = this.fb.group({
      id:                                       [null],

      risorsaID:                                ['', { validators:[ Validators.required]}],
      tipoDocumentoID:                          ['', { validators:[ Validators.required]}],
      classeSezioneAnnoID:                      [''],
      userIns:                                  ['']

    });
    this.obsTipiDocumento$ = this.svcTipiDocumento.list();
    this.obsRisorse$ = this.svcRisorse.list();

  }

  //#endregion

  //#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.data.risorsaCSAID && this.data.risorsaCSAID + '' != "0") {
      const obsRisorseCSA$: Observable<CLS_RisorsaCSA> = this.svcRisorseCSA.get(this.data.risorsaCSAID);
      const loadRisorsaCSA$ = this._loadingService.showLoaderUntilCompleted(obsRisorseCSA$);
      this.risorsaCSA$ = loadRisorsaCSA$
      .pipe(
          tap(
            risorsaCSA => {
              console.log ("risorsa-classe-edit - loadData", risorsaCSA);
              this.form.patchValue(risorsaCSA);
            }
          )
      );
    }
    else { 
      this.form.controls.classeSezioneAnnoID.setValue(this.data.classeSezioneAnnoID);
      this.emptyForm = true;
    }
  }

  //#endregion

  //#region ----- Operazioni CRUD ----------------

  async save(){

    let risorsaCSA!: CLS_RisorsaCSA;
    await firstValueFrom(this.svcRisorseCSA.getByTipoDocCSA(this.form.controls.tipoDocumentoID.value, this.data.classeSezioneAnnoID).pipe(tap(res=> risorsaCSA= res)));



    if (this.form.controls['id'].value == null) {
      console.log ("risorsa-csa-edit - save - post - this.form", this.form.value);
      
      if (risorsaCSA) {
        //esiste un ALTRO record con stesso tipoDOC e stessa CSA
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: { titolo: "ATTENZIONE!", sottoTitolo: "Esiste già un documento di questo tipo<br>impostato per questa classe" }
        });
        return;
      }

      this.svcRisorseCSA.post(this.form.value).subscribe({
        next: res=> {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          this._dialogRef.close();
        },
        error: err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      });
    }
    else {
      console.log ("risorsa-csa-edit - save - put - this.form", this.form.value);
      if (risorsaCSA && risorsaCSA.id != this.form.controls.id.value) {
        //esiste un ALTRO record con stesso tipoDOC e stessa CSA
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: { titolo: "ATTENZIONE!", sottoTitolo: "Esiste già un documento di questo tipo<br>impostato per questa classe" }
        });
        return;
      }

      console.log ("risorsa-csa-edit - save - this.form.value", this.form.value);
      this.svcRisorseCSA.put(this.form.value).subscribe({
          next: res=> {
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
        });
    }
  }

  delete(){

    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(
      result => {
        if(result){
          this.svcRisorseCSA.delete(Number(this.data.risorsaCSAID)).subscribe({
            next: () =>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              //this.svcRisorseClassi.renumberSeq().subscribe();
              this._dialogRef.close();
            },
            error: err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }

//#endregion

}
