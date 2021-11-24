import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

@Component({
  selector: 'app-classe-sezione-anno-edit',
  templateUrl: './classe-sezione-anno-edit.component.html',
  styleUrls: ['./../classi.css']
})
export class ClasseSezioneAnnoEditComponent implements OnInit {

//#region ----- Variabili -------

  classeSezioneAnno$!:                    Observable<CLS_ClasseSezioneAnno>;
  
  obsAnni$!:                Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  obsClassi$!:                Observable<CLS_Classe[]>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  breakpoint!:                number;
//#endregion

  constructor( @Inject(MAT_DIALOG_DATA) public idClasseSezioneAnno: number,
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
      classeSezioneAnnoSucc:      ['', Validators.required],
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
    //forse bisogna prelevare con obsAnni l'id dell'anno della classe che si sta guardando, e poi prendere le classi
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

            //this.form.patchValue(classe);
            this.form.controls['sezione'].setValue(classe.classeSezione.sezione); 
            this.form.controls['classeID'].setValue(classe.classeSezione.classe.id);
            this.form.controls['annoID'].setValue(classe.anno.id);
            
            
            
            //AS: il patch value non sempbra valorizzare il form group ... ????
            //this.form.controls['sezione'].setValue( classe.classeSezione.sezione);
            console.log("[Debug] Sezione = ", classe);
            console.log("form", this.form);
          })
      );
    } else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD -------
  save(){}

  delete(){}

  
//#endregion

}
