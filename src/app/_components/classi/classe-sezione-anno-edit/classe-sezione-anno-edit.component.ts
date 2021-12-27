import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { concat, Observable, Subscription } from 'rxjs';
import { concatMap, subscribeOn, switchMap, tap } from 'rxjs/operators';

//components

import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { ClassiSezioniService } from '../classi-sezioni.service';
import { ClassiService } from '../classi.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';

import { LoadingService } from '../../utilities/loading/loading.service';


//models
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Classe } from 'src/app/_models/CLS_Classe';
import { CLS_ClasseSezione } from 'src/app/_models/CLS_ClasseSezione';
import { InputModality } from '@angular/cdk/a11y';

@Component({
  selector: 'app-classe-sezione-anno-edit',
  templateUrl: './classe-sezione-anno-edit.component.html',
  styleUrls: ['./../classi.css']
})
export class ClasseSezioneAnnoEditComponent implements OnInit {

//#region ----- Variabili -------

  classeSezioneAnno$!:        Observable<CLS_ClasseSezioneAnno>;
  
  obsAnni$!:                  Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  obsClassi$!:                Observable<CLS_Classe[]>;
  obsClassiSezioniAnniSucc$!: Observable<CLS_ClasseSezioneAnno[]>;
  
  obsClasseSezione$!:         Observable<CLS_ClasseSezione>;
  obs!: Subscription;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  breakpoint!:                number;
//#endregion

  constructor( 
                @Inject(MAT_DIALOG_DATA) public idClasseSezioneAnno: number,
                public _dialogRef:                          MatDialogRef<ClasseSezioneAnnoEditComponent>,
                private fb:                                 FormBuilder,
                private svcClasseSezioneAnno:               ClassiSezioniAnniService,
                private svcClasseSezione:                   ClassiSezioniService,
                private svcClassi:                          ClassiService,
                private svcAnni:                            AnniScolasticiService,
                public _dialog:                             MatDialog,
                private _snackBar:                          MatSnackBar,
                private _loadingService :                   LoadingService
                 ) { 

    this.form = this.fb.group({
      id:                         [null],
      annoID:                     ['', Validators.required],
      classeSezioneAnnoSuccID:    [''],
      classeSezioneID:            [null],
      
      sezione:                    ['', Validators.required],
      classeID:                   ['', Validators.required]
    });

  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    this.obsAnni$= this.svcAnni.load();
    this.obsClassi$= this.svcClassi.load();
    
    //TODO per ottenere l'elenco di tutte le classi dell'anno scolastico successivo 
    //forse bisogna prelevare l'id dell'anno della classe che si sta guardando, e poi prendere le classi
    //tramite loadClassiByAnnoScolastico a cui si passa l'id + 1? Solo e si è sicuri che gli anni scolastici sono stati inseriti tutti
    //con una sequenza di id...altrimenti serve che ogni anno scolastico abbia l'indicazione dell'id dell'anno successivo...per poter estrarre l'id
    //dell'anno successivo e con quello fare la loadClassiByAnnoScolastico....

    //********************* POPOLAMENTO FORM *******************
    if (this.idClasseSezioneAnno && this.idClasseSezioneAnno + '' != "0") {

      const obsClasseSezioneAnno$: Observable<CLS_ClasseSezioneAnno> = this.svcClasseSezioneAnno.loadClasse(this.idClasseSezioneAnno);
      const loadClasseSezioneAnno$ = this._loadingService.showLoaderUntilCompleted(obsClasseSezioneAnno$);
      
      this.classeSezioneAnno$ = loadClasseSezioneAnno$
      .pipe(
          tap(classe => {
            
            //this.form.patchValue(classe); //non funziona bene, perchè ci sono dei "sotto-oggetti"
            this.form.controls.id.setValue(classe.id); //NB in questo modo si setta il valore di un campo del formBuilder quando NON compare anche come Form-field nell'HTML
            this.form.controls['sezione'].setValue(classe.ClasseSezione.sezione); 
            this.form.controls['classeID'].setValue(classe.ClasseSezione.Classe.id);
            this.form.controls['annoID'].setValue(classe.Anno.id);

            let annoIDsucc=0;
            this.svcAnni.loadAnnoSucc(classe.Anno.id) 
            .pipe (
              tap ( val   =>  annoIDsucc= val.id),
              concatMap(() => this.obsClassiSezioniAnniSucc$ = this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(annoIDsucc))
            ).subscribe(
              res=>{
              },
              err=>{
                this.obs.unsubscribe();  ///NC ??? serve nel caso di errore, ma qui dentro cosa accade se c'è un errore?
              }

            );
            //this.obsClassiSezioniAnniSucc$= this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(classe.anno.id + 1); //sostituita da quella sopra che pesca l'anno successivo a quello della classe

            this.form.controls['classeSezioneAnnoSuccID'].setValue(classe.ClasseSezioneAnnoSucc?.id); 
            
            //console.log("classeSezioneAnno$ estratta : ", classe);
          })
      );
    } else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD -------
  save(){
    //console.log ("form.id", this.form.controls['id'].value );

    var piDClasse = this.form.controls['classeID'].value;
    var pSezione = this.form.controls['sezione'].value;

    if (this.form.controls['id'].value == null){
      this.svcClasseSezione.loadByClasseSezione (piDClasse, pSezione) 
        .pipe (
            tap ( val   =>   this.form.controls['classeSezioneID'].setValue(val.id)),
            concatMap(() => this.svcClasseSezioneAnno.post(this.form.value))
          ).subscribe(
            () => { 
              this._dialogRef.close();
            },
            err=> (
              console.log("ERRORE POST" ),
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
            )
      );
    }
    else{
      this.svcClasseSezione.loadByClasseSezione (piDClasse, pSezione) 
        .pipe (
            tap ( val   =>   this.form.controls['classeSezioneID'].setValue(val.id)),
            concatMap(() => this.svcClasseSezioneAnno.put(this.form.value))
          ).subscribe(
            () => { 
              this._dialogRef.close();
            },
            err=> (
              console.log("ERRORE PUT" ),
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
            )
      );
    }

    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});

  }

  delete(){
    //console.log ("this.idClasseSezioneAnno", this.idClasseSezioneAnno);
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result){
        this.svcClasseSezioneAnno.delete(Number(this.idClasseSezioneAnno))
        .subscribe(
          res=>{
            this._snackBar.openFromComponent(SnackbarComponent,
              {data: 'Record cancellato', panelClass: ['red-snackbar']}
            );
            this._dialogRef.close();
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          )
        );
      }
    });
  }

  

  updateAnnoSucc(selectedAnno: number) {

    console.log("SELECTED ANNO: " , selectedAnno);

    //su modifica della combo dell'anno deve cambiare l'eleco delle classi successive disponibili...e che si fa del valore eventualmente già selezionato? lo si pone a null?
    //comunque? anche se è un valore che sarebbe valido lo perdiamo in caso di modifica dell'anno selezionato?
    //this.obsClassiSezioniAnniSucc$= this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(selectedAnno + 1); 
    let annoIDsucc=0;

  
    this.obs=  this.svcAnni.loadAnnoSucc(selectedAnno) 
      .pipe (
        tap ( val   =>  annoIDsucc= val.id),
        concatMap(() => this.obsClassiSezioniAnniSucc$= this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(annoIDsucc))
      ).subscribe(
        res=>{
        },
        err=>{
          this.obs.unsubscribe();
        }

      );
  }
  
//#endregion

}
