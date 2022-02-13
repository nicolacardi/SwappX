import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { iif, Observable, of, timer } from 'rxjs';
import { concatMap, filter, finalize, map, tap } from 'rxjs/operators';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { IscrizioniService } from '../iscrizioni.service';

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
    public annoSucc!:                          ASC_AnnoScolastico;
    form! :                                   FormGroup;

    public obsClassiAnniSucc$!:                           Observable<CLS_ClasseSezioneAnnoGroup[]>;


    private nRecOK=   0;
    private nRecKO =  0;


    constructor(
    public _dialogRef:                      MatDialogRef<IscrizioniClasseCalcoloComponent>,
    @Inject(MAT_DIALOG_DATA)                public data: DialogData,
    public _dialog:                         MatDialog,

    private fb:                             FormBuilder, 
    private svcAnni:                        AnniScolasticiService,
    private svcClasseSezioneAnno:           ClassiSezioniAnniService,
    private svcIscrizioni:                  IscrizioniService,
    private _snackBar:                      MatSnackBar,
    private _loadingService :               LoadingService,


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
    
    

    this.obsClassiAnniSucc$ = this.svcAnni.getAnnoSucc(this.data.idAnno)
      .pipe (
        tap( val => {
            this.annoSucc =  val;
          }),
        concatMap( ()  =>
            this.svcClasseSezioneAnno.listByAnnoGroupByClasse(this.annoSucc.id)),
      //       )
      // .pipe (
        tap(()=>{
          this.form.controls['selectClasseSezioneAnno'].setValue(this.classeSezioneAnno.classeSezioneAnnoSuccID);
        }  
        )
      )
  }


  iscrivi() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma promozione degli alunni selezionati ?"}
    });
    dialogYesNo.afterClosed().subscribe(async result => {



      //this.data.arrAlunniChecked.forEach( element => this.elaboraIscrizione(element))
      //https://advancedweb.hu/how-to-use-async-functions-with-array-foreach-in-javascript/   BOH!
      //https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971

      


    //1.Metodo suggerito per eseguire le chiamate in maniera SERIALE: non funziona
    // for (const element of this.data.arrAlunniChecked) {
    //   await this.elaboraIscrizione(element);
    // }

    //2.Metodo suggerito per eseguire le chiamate in maniera PARALLELA: non funziona
    // await Promise.all(this.data.arrAlunniChecked.map(async (element) => {
    //   await this.elaboraIscrizione(element);
    // }));

    //3.Altro metodo suggerito per eseguire le chiamate in maniera SERIALE: non funziona

    await this.data.arrAlunniChecked.reduce(async (a, element) => {
      // Wait for the previous item to finish processing
      await a;
      // Process this item
      await this.elaboraIscrizione(element);
    }, Promise.resolve());

      


      // let waitforthis = new Promise ((res, rej) => {
      //   this.data.arrAlunniChecked.forEach(element => this.elaboraIscrizione(element))
      // });
      
      // waitforthis.then (
      //   () => 
      //     {
      //       console.log("finalmente ho finito");
      //       this._snackBar.openFromComponent(SnackbarComponent, {data: 'Iscrizione eseguita per '+this.nRecOK+' alunni su '+(this.nRecOK +this.nRecKO), panelClass: ['green-snackbar']});
      //     }
      // );
      
      console.log ("passo di qua");
      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Iscrizione eseguita per '+this.nRecOK+' alunni su '+(this.nRecOK +this.nRecKO), panelClass: ['green-snackbar']});
    })
  }


  async elaboraIscrizione (element: CLS_Iscrizione){
      console.log ("step1", element.alunno);
        let objIscrizione = {
          AlunnoID: element.alunnoID,
          ClasseSezioneAnnoID: this.form.controls['selectClasseSezioneAnno'].value
        };
      console.log ("step2", element.alunno);
         await this.svcIscrizioni.getByAlunnoAndAnno(this.annoSucc.id, element.alunnoID)

          .pipe (
            tap(res=> {
              if (res != null) {this.nRecKO++}
              console.log ("step3", element.alunno);
            }
            ),
            concatMap(  async res => iif (()=> res == null,
              await this.svcIscrizioni.post(objIscrizione)
                .pipe(
                  tap(()=>{this.nRecOK++;
                  console.log("step4", element.alunno);})
                )
              ,
              of()
              )
            )
          )
          .subscribe(
            () => {console.log ("nRecKO:"+this.nRecKO, "nrecOK:"+this.nRecOK);}
          )  }
  }


