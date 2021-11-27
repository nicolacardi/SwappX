import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

//components


//services
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiService } from '../classi.service';

//models
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Classe } from 'src/app/_models/CLS_Classe';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

@Component({
  selector: 'app-classe-sezione-anno-edit',
  templateUrl: './classe-sezione-anno-edit.component.html',
  styleUrls: ['./../classi.css']
})
export class ClasseSezioneAnnoEditComponent implements OnInit {

//#region ----- Variabili -------

  classeSezioneAnno$!:                    Observable<CLS_ClasseSezioneAnno>;
  
  obsAnni$!:                  Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  obsClassi$!:                Observable<CLS_Classe[]>;
  obsClassiSezioniAnniSucc$!: Observable<CLS_ClasseSezioneAnno[]>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  breakpoint!:                number;
//#endregion

  constructor( 
                @Inject(MAT_DIALOG_DATA) public idClasseSezioneAnno: number,
                public _dialogRef:                          MatDialogRef<ClasseSezioneAnnoEditComponent>,
                private fb:                                 FormBuilder,
                private svcClasseSezioneAnno:               ClassiSezioniAnniService,
                private svcClassi:                          ClassiService,
                private svcAnni:                            AnniScolasticiService,
                public _dialog:                             MatDialog,
                private _snackBar:                          MatSnackBar,
                private _loadingService :                   LoadingService
                 ) { 

    this.form = this.fb.group({
      id:                         [null],
      sezione:                    ['', Validators.required],
      classeID:                   ['', Validators.required],
      annoID:                     ['', Validators.required],
      classeSezioneAnnoSuccID:    [''],
    });

  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    this.obsAnni$= this.svcAnni.load();

    this.obsClassi$= this.svcClassi.load();

    //this.obsClassiSezioniAnniSucc$= this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(2);  //PER ORA CABLATO 2 TODO

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
            this.form.controls['sezione'].setValue(classe.classeSezione.sezione); 
            this.form.controls['classeID'].setValue(classe.classeSezione.classe.id);
            this.form.controls['annoID'].setValue(classe.anno.id);
            this.obsClassiSezioniAnniSucc$= this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(classe.anno.id + 1); 
            this.form.controls['classeSezioneAnnoSuccID'].setValue(classe.classeSezioneAnnoSucc?.id); 
            
            console.log("classeSezioneAnno$ estratta : ", classe);
          })
      );
    } else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD -------
  save(){
    console.log ("form.id", this.form.controls['id'].value );
    if (this.form.controls['id'].value == null)
      this.svcClasseSezioneAnno.post(this.form.value)
        .subscribe(res=> {
          this._dialogRef.close();
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      );

    else
      this.svcClasseSezioneAnno.put(this.form.value)
          .subscribe(res=> {
            this._dialogRef.close();
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          )
      );      


  }

  delete(){
    console.log ("this.idClasseSezioneAnno", this.idClasseSezioneAnno);
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


  updateAnnoSucc() {
    //su modifica della combo dell'anno deve cambiare l'eleco delle classi successive disponibili...e che si fa del valore eventualmente già selezionato? lo si pone a null?
    //comunque? anche se è un valore che sarebbe valido lo perdiamo in caso di modifica dell'anno selezionato?

  }
//#endregion

}
