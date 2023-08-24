//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { iif, Observable, of, throwError }                  from 'rxjs';
import { catchError, concatMap, tap }                       from 'rxjs/operators';

//components
import { ClassiSezioniAnniListComponent }       from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { GenitoreEditComponent }                from '../../genitori/genitore-edit/genitore-edit.component';
import { GenitoriListComponent }                from '../../genitori/genitori-list/genitori-list.component';
import { PersonaFormComponent }                 from '../../persone/persona-form/persona-form.component';

import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { AlunniService }                        from 'src/app/_components/alunni/alunni.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni }                           from 'src/app/_models/_UT_Comuni';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ALU_GenitoreAlunno } from 'src/app/_models/ALU_GenitoreAlunno';
import { error } from 'console';
import { HttpErrorResponse } from '@angular/common/http';

//#endregion

@Component({
  selector:     'app-alunno-edit',
  templateUrl:  './alunno-edit.component.html',
  styleUrls:    ['./../alunni.css']
})

export class AlunnoEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  genitore!:                                    ALU_GenitoreAlunno;
  alunno$!:                                     Observable<ALU_Alunno>;
  filteredComuni$!:                             Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:                      Observable<_UT_Comuni[]>;
  genitoriArr :                                 ALU_GenitoreAlunno[] = []
  public personaID!:                            number;

  alunnoNomeCognome:                            string = "";
  formPersona! :                                UntypedFormGroup;
  formAlunno! :                                 UntypedFormGroup;

  isValid!:                                     boolean;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  breakpoint!:                                  number;
  breakpoint2!:                                 number;

  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;
  selectedTab:                                  number = 0;

//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChild('genitoriFamiglia') genitoriFamigliaComponent!:            GenitoriListComponent; 
  @ViewChild('genitoriDisponibili') genitoriDisponibiliComponent!:      GenitoriListComponent; 

  @ViewChild('iscrizioniAlunno') classiAttendedComponent!:              ClassiSezioniAnniListComponent; 
  @ViewChild('classiSezioniAnniList') classiSezioniAnniListComponent!:  ClassiSezioniAnniListComponent; 
  @ViewChild(PersonaFormComponent) personaFormComponent!:               PersonaFormComponent; 

//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef:                          MatDialogRef<AlunnoEditComponent>,
              @Inject(MAT_DIALOG_DATA) public alunnoID:   number,
              private fb:                                 UntypedFormBuilder, 
              private svcIscrizioni:                      IscrizioniService,
              private svcAlunni:                          AlunniService,

              public _dialog:                             MatDialog,
              private _snackBar:                          MatSnackBar,
              private _loadingService :                   LoadingService ) {

    _dialogRef.disableClose = true;
    
    this.formAlunno = this.fb.group(
    {
      id:                                     [null],
      scuolaProvenienza:                      ['', Validators.maxLength(255)],
      indirizzoScuolaProvenienza:             ['', Validators.maxLength(255)],

      personaID:                              [null],
      ckDSA:                                  [false],
      ckDisabile:                             [false],
      // ckAuthFoto:                             [false],
      // ckAuthUsoMateriale:                     [false],
      // ckAuthUscite:                           [false]
    });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit () {
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;
 
    if (this.alunnoID && this.alunnoID + '' != "0") {

      const obsAlunno$: Observable<ALU_Alunno> = this.svcAlunni.getWithParents(this.alunnoID);
      const loadAlunno$ = this._loadingService.showLoaderUntilCompleted(obsAlunno$);
      this.alunno$ = loadAlunno$
      .pipe(
          tap(
            alunno => {
              this.personaID = alunno.personaID;
              this.alunnoNomeCognome = alunno.persona.nome + " " + alunno.persona.cognome;
              this.formAlunno.patchValue(alunno);
              //console.log (alunno);
            }       
          ),
          // tap(
          //   alunno => {
              
          //     this.genitoriArr = [
          //       ...(this.genitoriArr || []), // Ensure genitoriArr is initialized as an array
          //       ...(alunno._Genitori || []).filter(genitore => genitore !== undefined)
          //     ];

          //   }
          // )
      );
    }
    else this.emptyForm = true
        
  }

//#endregion

//#region ----- Operazioni CRUD ----------------
  
save(){

    if (this.alunnoID == null || this.alunnoID == 0)    {

      this.personaFormComponent.save()
      .pipe(
        tap(persona => {
          this.formAlunno.controls.personaID.setValue(persona.id)
        }),
        concatMap( () => this.svcAlunni.post(this.formAlunno.value))
      )
      .subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      })
    }
    else {
      this.personaFormComponent.save()
      .pipe(
        concatMap( () => this.svcAlunni.put(this.formAlunno.value))
      )
      .subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      })
    }
  }

  delete()
  {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });

    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcAlunni.delete(Number(this.alunnoID))
        .pipe(
          concatMap(()=> this.personaFormComponent.delete())
        ).subscribe({
          next: res=>{
            this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
            this._dialogRef.close();
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
        });
      }
    });
  }

//#endregion

//#region ----- Metodi di gestione Genitori, Famiglia e Classi -------
  
  addGenitore(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '650px',
      data: 0
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        () => {
          this.loadData()
          this.genitoriDisponibiliComponent.loadData();
        }
    );
  }

  addToFamily(genitore: ALU_Genitore) {
    //devo fare una verifica prima della post:
    //per caso è già figlio? Per questo faccio una concatMap (la post deve avvenire in sequenza quando la verifica è finita)
    //ma con una condizione: la iif specifica proprio che SE il risultato della verifica è vuoto allora si può procedere con la post
    //altrimenti si mette in successione l'observable vuoto (of())
    
    this.svcAlunni.listByGenitoreAlunno(genitore.id, this.alunnoID)
    .pipe(
      concatMap( res => iif (()=> res.length == 0, this.svcAlunni.postGenitoreAlunno(genitore.id, this.alunnoID), of() ))
    ).subscribe({
      next: res=> this.genitoriFamigliaComponent.loadData(),
      error: err=> { }
    })
  }

  removeFromFamily(genitore: ALU_Genitore) {
    const alunnoID = this.alunnoID;
    this.svcAlunni.deleteByGenitoreAlunno(genitore.id, this.alunnoID).subscribe({
      next: res=> this.genitoriFamigliaComponent.loadData(),
      error: err=> { }
    })
  }

  addToAttended(classeSezioneAnno: CLS_ClasseSezioneAnnoGroup) {
    //così come ho fatto in dialog-add mi costruisco un oggetto "stile" form e lo passo alla postClasseSezioneAnnoAlunno
    //avrei potuto anche passare i valori uno ad uno, ma è già pronta così avendola usata in dialog-add
    let objClasseSezioneAnnoAlunno = {AlunnoID: this.alunnoID, ClasseSezioneAnnoID: classeSezioneAnno.id};
    const checks$ = this.svcIscrizioni.getByAlunnoAndClasseSezioneAnno(classeSezioneAnno.id, this.alunnoID)
    .pipe(
      //se trova che la stessa classe è già presente res.length è != 0 quindi non procede con la getByAlunnoAnno ma restituisce of()
      //se invece res.length == 0 dovrebbe proseguire e concatenare la verifica successiva ch è getByAlunnoAndAnno...
      //invece "test" non compare mai...quindi? sta uscendo sempre con of()?
      tap(res=> {
          if (res != null) {
            this._dialog.open(DialogOkComponent, {
              width: '320px',
              data: {titolo: "ATTENZIONE!", sottoTitolo: "Questa classe è già stata inserita!"}
            });
          } else {
            //l'alunno non frequenta la classe a cui sto cercando di iscriverlo, posso procedere
          }
        }
      ),
      concatMap( res => iif (()=> res == null,
        this.svcIscrizioni.getByAlunnoAndAnno(classeSezioneAnno.annoID, this.alunnoID) , of() )
      ),
      tap(res=> {
        if (res != null) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: "E' già stata inserita una classe in quest'anno!"}
          });
        } else {
          //console.log("l'alunno non frequenta alcuna classe nell'anno a cui sto cercando di iscriverlo, posso procedere
        }
      })

    )
    checks$.pipe(
      concatMap( res => iif (()=> res == null, this.svcIscrizioni.post(objClasseSezioneAnnoAlunno) , of() )
      )
    ).subscribe({
      next: res=> { this.classiAttendedComponent.loadData() },
      error: err=> { }
    })
  }

  removeFromAttended(classeSezioneAnno: CLS_ClasseSezioneAnno) {
    let errorMsg: string;
    this.svcIscrizioni.deleteByAlunnoAndClasseSezioneAnno(classeSezioneAnno.id , this.alunnoID)
      .subscribe({
      next: res=> { this.classiAttendedComponent.loadData() },
      error: err => {this._snackBar.openFromComponent(SnackbarComponent, {data: err.error.errorMessage, panelClass: ['red-snackbar']});}
    })
  }

//#endregion

//#region ----- Eventi -------------------------

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
  }

  selectedTabValue(event: any){
    this.selectedTab = event.index;
  }

  formValidEmitted(isValid: boolean) {
    this.isValid = isValid;
  }

//#endregion
}

