import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

//services
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';

//classes
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { LoadingService } from '../../utilities/loading/loading.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-classe-sezione-anno-edit',
  templateUrl: './classe-sezione-anno-edit.component.html',
  styleUrls: ['./../classi.css']
})
export class ClasseSezioneAnnoEditComponent implements OnInit {

//#region ----- Variabili -------

  classeSezioneAnno$!:                    Observable<CLS_ClasseSezioneAnno>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  breakpoint!:                number;
//#endregion

  constructor( @Inject(MAT_DIALOG_DATA) public idClasseSezioneAnno: number,
                private fb:                                 FormBuilder,
                private svcClasseSezioneAnno:               ClassiSezioniAnniService,
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

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form popolato in arrivo da lista alunni
    
    if (this.idClasseSezioneAnno && this.idClasseSezioneAnno + '' != "0") {

      const obsClasseSezioneAnno$: Observable<CLS_ClasseSezioneAnno> = this.svcClasseSezioneAnno.loadClasse(this.idClasseSezioneAnno);
      const loadClasseSezioneAnno$ = this._loadingService.showLoaderUntilCompleted(obsClasseSezioneAnno$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.classeSezioneAnno$ = loadClasseSezioneAnno$
      .pipe(
          tap(
            classe => this.form.patchValue(classe)
          )
      );
    } else {
      this.emptyForm = true
    }
  }

  save(){}

  delete(){}
}
