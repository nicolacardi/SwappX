import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';

export interface DialogData {
  idAnno:               number;
  idClasseSezioneAnno:  number;
  arrAlunniChecked:     CLS_Iscrizione[];

}


@Component({
  selector: 'app-iscrizioni-classe-calcolo',
  templateUrl: './iscrizioni-classe-calcolo.component.html',
  styleUrls: ['../classi.css']
})
export class IscrizioniClasseCalcoloComponent implements OnInit {

  public obsClassiSezioniAnni$!:            Observable<CLS_ClasseSezioneAnnoGroup[]>;
  classeSezioneAnno!:                       CLS_ClasseSezioneAnno;
  form! :                                   FormGroup;

  public tmpObs$!:                           Observable<CLS_ClasseSezioneAnnoGroup[]>;
  constructor(
    public _dialogRef:                      MatDialogRef<IscrizioniClasseCalcoloComponent>,
    @Inject(MAT_DIALOG_DATA)                public data: DialogData,

    private fb:                             FormBuilder, 
    private svcAnni:                        AnniScolasticiService,
    private svcClasseSezioneAnno:           ClassiSezioniAnniService,
    private _snackBar:                      MatSnackBar,
    private _loadingService :               LoadingService


  ) { 

    this.form = this.fb.group({
      selectClasseSezioneAnno:       [null]
    })
  }

  ngOnInit(): void {
    console.log (this.data);

    const obsClasseSezioneAnno$: Observable<CLS_ClasseSezioneAnno> = this.svcClasseSezioneAnno.loadClasse(this.data.idClasseSezioneAnno);
    obsClasseSezioneAnno$.subscribe(
      val => this.classeSezioneAnno = val
    );
    
    let annoSucc: ASC_AnnoScolastico;

    this.tmpObs$ = this.svcAnni.getAnnoSucc(this.data.idAnno)
      .pipe (
        tap( val => {
            annoSucc =  val;
          }),
        concatMap( ()  =>
            this.svcClasseSezioneAnno.listByAnnoGroupByClasse(annoSucc.id)))
            .pipe (

              tap(()=>{
                this.form.controls['selectClasseSezioneAnno'].setValue(this.classeSezioneAnno.classeSezioneAnnoSuccID);
              }  
              )
            )


            // .pipe(
            //   map(val=>val.filter(x=>(x.annoID == this.data.idAnno  || x.annoID == annoSucc.id)))  
            // )
            //.subscribe()
        
      ;


    // this.obsClassiSezioniAnni$ = this.svcClasseSezioneAnno.listByAnnoGroupByClasse(this.data.idAnno)
    //                                 .pipe(
    //                                   map(val=>val.filter(x=>x.annoID == this.data.idAnno))
                                      
    //                                 );

              //this.svcAlunni.hasFratelloMaggiore(iscrizione.alunnoID )
              // .pipe (
              //   tap (val=> {
              //     hasFratelloMaggiore = val;
              //   }),  
              //   concatMap(() => this.svcRette.loadByAlunnoAnno(iscrizione.alunnoID, annoID )))

  }


  iscrivi() {
  }

}
