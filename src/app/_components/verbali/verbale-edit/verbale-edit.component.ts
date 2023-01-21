import { Component, Inject, OnInit }            from '@angular/core';
import { FormBuilder, FormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { iif, Observable, of }                           from 'rxjs';
import { concatMap, tap }                                  from 'rxjs/operators';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { VerbaliService }                       from '../verbali.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { DOC_TipoVerbale, DOC_Verbale, DOC_VerbalePresente }         from 'src/app/_models/DOC_Verbale';
import { Utility }                              from '../../utilities/utility.component';
import { PersoneService } from '../../persone/persone.service';
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { DialogDataVerbale } from 'src/app/_models/DialogData';
import { VerbaliPresentiService } from '../verbali-presenti.service';

@Component({
  selector: 'app-verbale-edit',
  templateUrl: './verbale-edit.component.html',
  styleUrls: ['../verbali.css']
})

export class VerbaleEditComponent implements OnInit {

//#region ----- Variabili -------
  obsVerbale$!:                                 Observable<DOC_Verbale>;
  obsTipiVerbale$!:                             Observable<DOC_TipoVerbale[]>;
  obsPersonaleScuola$!:                         Observable<PER_Persona[]>;
  obsClassiSezioniAnni$!:                       Observable<CLS_ClasseSezioneAnno[]>;
  obsGenitoriClasse$!:                          Observable<PER_Persona[]>;
  classeSezioneAnnoSelected!:                   number;
  mostraClassiEGenitori:                        boolean = false;
  form! :                                       FormGroup;
  personaID!:                                   number;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  breakpoint!:                                  number;
//#endregion

  constructor( 
    public _dialogRef:                          MatDialogRef<VerbaleEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data:       DialogDataVerbale,
    private fb:                                 FormBuilder, 
    private svcVerbali:                         VerbaliService,
    private svcVerbaliPresenti:                 VerbaliPresentiService,

    private svcPersone:                         PersoneService,
    private svcClassiSezioniAnni:               ClassiSezioniAnniService,

    private _loadingService:                    LoadingService,
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group(
    {
      id:                                       [null],
      annoID:                                   [],
      tipoVerbaleID:                            [],
      nomeCognome:                              [{ value: '', disabled: true }],
      personaID:                                [],
      personale:                                [],
      genitori:                                 [],
      dtVerbale:                                [],
      classeSezioneAnnoID:                      [],
      hVerbale:                                 [],
      titolo:                                   [],
      contenuti:                                []
    });
  }

  ngOnInit() {
    this.loadData();

    
  }

  loadData() {

    this.form.controls.tipoVerbaleID.valueChanges
    .pipe(
      concatMap( val => this.svcVerbali.getTipoVerbale(val)),
    )
    .subscribe(
      val => {
          this.form.controls.classeSezioneAnnoID.setValue(null);
          this.form.controls.genitori.setValue(null);
        if (val.ckMostraGenitori) {
          this.mostraClassiEGenitori = false;
        } else {
          this.mostraClassiEGenitori = true;
        }
      }
    );

    this.obsTipiVerbale$ = this.svcVerbali.listTipiVerbale();

    this.obsPersonaleScuola$ = this.svcPersone.listPersonaleScuola();

    this.obsClassiSezioniAnni$ = this.svcClassiSezioniAnni.listByAnno(this.data.annoID);

    this.form.controls.classeSezioneAnnoID.valueChanges
    .pipe(
      tap(val => {this.classeSezioneAnnoSelected = val? val: 0}),
      //concatMap( (val:number) => iif( ()=> val!= null, this.obsGenitoriClasse$ = this.svcPersone.listGenitoriByClasseSezioneAnno(val), of())),
      concatMap( () => this.obsGenitoriClasse$ = this.svcPersone.listGenitoriByClasseSezioneAnno(this.classeSezioneAnnoSelected))
    )
    .subscribe(
      //val => console.log(val)
    );
    // this.obsGenitoriClasse$ = this.svcPersone.listGenitoriByClasseSezioneAnno();


    if (this.data.verbale) {

      //in teoria potrei anche fare a meno dell'observable e dell'async nel form: potrei passare TUTTI i valori tramite DialogData...tanto li ho già...ma non sarebbe rxJs
      const obsVerbale$: Observable<DOC_Verbale> = this.svcVerbali.get(this.data.verbale.id);
      const loadVerbale$ = this._loadingService.showLoaderUntilCompleted(obsVerbale$);
      
      this.obsVerbale$ = loadVerbale$
      .pipe( tap(
        verbale => {
          console.log ("estraggo verbale:", verbale);
          this.form.patchValue(verbale);
          this.form.controls.nomeCognome.setValue (verbale.persona.nome + ' ' + verbale.persona.cognome)
        } )
      );
    } 
    else {
     
      this.emptyForm = true;
      this.form.controls.nomeCognome.setValue (Utility.getCurrentUser().fullname);
      this.form.controls.personaID.setValue (Utility.getCurrentUser().personaID);

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
          this.svcVerbali.delete (this.data.verbale.id).subscribe(
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

    if (this.form.controls.id.value == null) {
      
      //imposto per default l'anno corrente
      let objAnno = localStorage.getItem('AnnoCorrente');
      this.form.controls.annoID.setValue(JSON.parse(objAnno!).id);


      this.svcVerbali.post(this.form.value).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );

      }
    else { 

      //cancello le presenze e le ripristino
      console.log("cancello presenze con verbaleID:",this.form.controls.id.value);
      this.svcVerbaliPresenti.deleteByVerbale(this.form.controls.id.value);
      this.form.controls.personale.value.forEach(
        ((personaID: number) => {
          let objVerbalePresente: DOC_VerbalePresente = {
            personaID: personaID,
            verbaleID : this.form.controls.id.value
          }
          console.log ("post di:", objVerbalePresente);
          this.svcVerbaliPresenti.post(objVerbalePresente).subscribe();
        })
      )

      this.svcVerbali.put(this.form.value).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }
  }
}
