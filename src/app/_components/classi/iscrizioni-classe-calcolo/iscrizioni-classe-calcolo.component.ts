import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { iif, Observable, of } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';

//components
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { IscrizioniService } from '../iscrizioni.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';

//classes
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
export interface DialogData {
  idAnno:               number;
  classeSezioneAnno:    CLS_ClasseSezioneAnno;
  idClasseSezioneAnno:  number;
  arrAlunniChecked:     CLS_Iscrizione[];
}

@Component({
  selector: 'app-iscrizioni-classe-calcolo',
  templateUrl: './iscrizioni-classe-calcolo.component.html',
  styleUrls: ['../classi.css']
})
export class IscrizioniClasseCalcoloComponent implements OnInit {

//#region ----- Variabili -------

    public obsClassiSezioniAnni$!:          Observable<CLS_ClasseSezioneAnnoGroup[]>;
    classeSezioneAnno!:                     CLS_ClasseSezioneAnno;
    public annoSucc!:                       ASC_AnnoScolastico;
    public anno!:                       ASC_AnnoScolastico;

    form! :                                 FormGroup;
    public obsClassiAnniSucc$!:             Observable<CLS_ClasseSezioneAnnoGroup[]>;
    private nRecOK=   0;
    private nRecKO =  0;

//#endregion

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
    
    const seq = this.data.classeSezioneAnno.classeSezione.classe.seq; //questo è il valore seq della classe a cui è iscritto...vale uguale o +1
    
    console.log ("data:", this.data);
    const obsClasseSezioneAnno$: Observable<CLS_ClasseSezioneAnno> = this.svcClasseSezioneAnno.getWithClasseSezioneAnno(this.data.idClasseSezioneAnno);
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
        map(val=>val.filter(val=>(val.seq == seq || val.seq == seq +1))),
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

    //https://advancedweb.hu/how-to-use-async-functions-with-array-foreach-in-javascript/

    //Metodo suggerito per eseguire le chiamate in maniera SERIALE
    //serve trasformare in questo modo la foreach +
    //trasformare la subscribe nella elaboraIscrizione in una Promise() +
    //attenderla con await async sia nel ciclo for sia nella elaboraIscrizione

    for (const element of this.data.arrAlunniChecked) {
      await this.elaboraIscrizione(element);
    }

    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Iscrizione eseguita per '+this.nRecOK+' alunni su '+(this.nRecOK +this.nRecKO), panelClass: ['green-snackbar']});
    })
  }



  async elaboraIscrizione (element: CLS_Iscrizione){
        let objIscrizione = {
          AlunnoID: element.alunnoID,
          ClasseSezioneAnnoID: this.form.controls['selectClasseSezioneAnno'].value
        };
          await this.svcIscrizioni.getByAlunnoAndAnno(this.annoSucc.id, element.alunnoID)

          .pipe (
            tap(res=> {if (res != null) {this.nRecKO++}
            }
            ),
            concatMap(  res => iif (()=> res == null,
              this.svcIscrizioni.post(objIscrizione)
                .pipe(
                  tap(()=>{this.nRecOK++;})
                )
                ,
                of()
                )
            )
          )
          .toPromise(); //necessario per ATTENDERE che finisca insieme alla await e async a inizio funzione
  }
}


