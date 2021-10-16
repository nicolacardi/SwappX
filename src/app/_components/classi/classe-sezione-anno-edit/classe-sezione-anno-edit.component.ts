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


//models
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';




@Component({
  selector: 'app-classe-sezione-anno-edit',
  templateUrl: './classe-sezione-anno-edit.component.html',
  styleUrls: ['./../classi.css']
})
export class ClasseSezioneAnnoEditComponent implements OnInit {

//#region ----- Variabili -------

  classeSezioneAnno$!:                    Observable<CLS_ClasseSezioneAnno>;
  
  obsAnni$!:                Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  breakpoint!:                number;
//#endregion

  constructor( @Inject(MAT_DIALOG_DATA) public idClasseSezioneAnno: number,
                private fb:                                 FormBuilder,
                private svcClasseSezioneAnno:               ClassiSezioniAnniService,
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

    //********************* POPOLAMENTO FORM *******************
    if (this.idClasseSezioneAnno && this.idClasseSezioneAnno + '' != "0") {

      const obsClasseSezioneAnno$: Observable<CLS_ClasseSezioneAnno> = this.svcClasseSezioneAnno.loadClasse(this.idClasseSezioneAnno);
      const loadClasseSezioneAnno$ = this._loadingService.showLoaderUntilCompleted(obsClasseSezioneAnno$);
      
      this.classeSezioneAnno$ = loadClasseSezioneAnno$
      .pipe(
          tap(classe => {

            this.form.patchValue(classe)

            //AS: il patch value non sempbra valorizzare il form group ... ????
            this.form.controls['sezione'].setValue( classe.classeSezione.sezione);
            console.log("[Debug] Sezione = ", classe);
          })
      );
      

    } else {
      this.emptyForm = true
    }
  }

//#endregion

//#region ----- Operazioni CRUD -------
  save(){}

  delete(){}

  
//#endregion

}
