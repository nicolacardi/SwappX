import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

//components
import { DialogDataLezione, DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { MaterieService } from 'src/app/_services/materie.service';
import { ClassiDocentiMaterieService } from '../../classi/classi-docenti-materie.service';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { DocentiService } from '../../persone/docenti.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { LezioniService } from '../lezioni.service';

//models
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { MAT_Materia } from 'src/app/_models/MAT_Materia';
import { PER_Docente } from 'src/app/_models/PER_Docente';
import { CLS_ClasseDocenteMateria } from 'src/app/_models/CLS_ClasseDocenteMateria';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

@Component({
  selector: 'app-lezione',
  templateUrl: './lezione.component.html',
  styleUrls: ['../calendario.component.css'],

})
export class LezioneComponent implements OnInit {

//#region ----- Variabili -------

  form! :                     FormGroup;

  lezione$!:                  Observable<CAL_Lezione>;
  obsMaterie$!:               Observable<MAT_Materia[]>;
  obsClassiDocentiMaterie$!:  Observable<CLS_ClasseDocenteMateria[]>;
  obsDocenti$!:               Observable<PER_Docente[]>;
  strDataOra!:                string;
  strH_Ini!:                  string;
  strH_end!:                  string;
  strClasseSezioneAnno!:       string;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  breakpoint!:                number;
  idClasseSezioneAnno!:       number;

//#endregion

  constructor(
    public _dialogRef: MatDialogRef<LezioneComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataLezione,
    
    private fb:                             FormBuilder, 

    private svcLezioni:                     LezioniService,
    private svcMaterie:                     MaterieService,
    private svcDocenti:                     DocentiService,
    private svcClassiDocentiMaterie:        ClassiDocentiMaterieService,
    private svcClasseSezioneAnno:           ClassiSezioniAnniService,

    public _dialog:                         MatDialog,
    private _snackBar:                      MatSnackBar,
    private _loadingService:                LoadingService,

    private cdRef : ChangeDetectorRef  ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      id:                         [null],
      classeSezioneAnnoID:        [''],
      dtCalendario:               [''],
    
      //campi di FullCalendar
      title:                      [''],
      h_Ini:                      [''],     
      h_End:                      [''],    
      colore:                     [''],
  
      docenteID:                  [''],
      materiaID:                  [''],
      ckEpoca:                    [''],
      ckFirma:                    [''],
      dtFirma:                    [''],
      ckAssente:                  [''],
      argomento:                  [''],
      compiti:                    [''],
      supplenteID:                ['']
    });

  }

  ngOnInit () {
    this.form.controls.materiaID.valueChanges.subscribe( 
      val =>{

        if (this.form.controls.classeSezioneAnnoID.value != null && this.form.controls.classeSezioneAnnoID.value != undefined) {

          //verifica se già non è impegnato in quest'ora o FRAZIONI DI ORA in qualche altro posto.
          

          this.svcClassiDocentiMaterie.getByClasseSezioneAnnoAndMateria(this.form.controls.classeSezioneAnnoID.value, val)
          .subscribe(val => {
            if (val)
              this.form.controls['docenteID'].setValue(val.docenteID);
            else 
              this.form.controls['docenteID'].setValue("")
          });
        }
      }
    );

    if (this.data.idClasseSezioneAnno != null && this.data.idClasseSezioneAnno != undefined) {
      this.svcClasseSezioneAnno.get(this.data.idClasseSezioneAnno)
      .subscribe(
        (val) => {
          console.log ("val", val);
          this.strClasseSezioneAnno = val.classeSezione.classe.descrizione2 + " " + val.classeSezione.sezione;
        }
      );
    }

    this.loadData();

  }


  loadData(): void {

    this.breakpoint = (window.innerWidth <= 800) ? 2 : 2;
    this.obsClassiDocentiMaterie$ = this.svcClassiDocentiMaterie.listByClasseSezioneAnno(this.data.idClasseSezioneAnno);
    this.obsMaterie$ = this.svcMaterie.list();  //questo forse non servirà più
    this.obsDocenti$ = this.svcDocenti.list();

    if (this.data.idLezione && this.data.idLezione + '' != "0") {
      const obsLezione$: Observable<CAL_Lezione> = this.svcLezioni.get(this.data.idLezione);
      const loadLezione$ = this._loadingService.showLoaderUntilCompleted(obsLezione$);
      this.lezione$ = loadLezione$
      .pipe(
        tap(
          lezione => {
            this.form.patchValue(lezione)
            this.strDataOra = lezione.dtCalendario;         //c'era anche in this.data.dtCalendario
            this.strH_Ini = lezione.h_Ini.substring(0,5);   //c'era anche in this.data.h_Ini
            this.strH_end = lezione.h_End.substring(0,5);   //c'era anche in this.data.h_End?
          }
        )
      );
    } else {
      //caso nuova Lezione

      this.emptyForm = true;
      //LA RIGA QUI SOPRA DETERMINAVA UN ExpressionChangedAfterItHasBeenCheckedError...con il DetectChanges si risolve!  
      //NON SO SE SIA IL METODO MIGLIORE MA FUNZIONA
      this.cdRef.detectChanges();     

      this.form.controls.classeSezioneAnnoID.setValue(this.data.idClasseSezioneAnno);
      this.form.controls.dtCalendario.setValue(this.data.start.substring(0,10));

      this.strH_Ini = this.data.start.substring(11,16);
      this.form.controls.h_Ini.setValue(this.data.start.substring(11,19));

      this.strDataOra = this.data.start;

      //4 righe per aumentare start di un'ora
      let dtStart = new Date (this.data.start);
      let dtEnd = new Date (dtStart.setHours(dtStart.getHours() + 1));
      let strDtEnd = dtEnd.toLocaleString('sv').replace(' ', 'T')

      this.strH_end = strDtEnd.substring(11,16);
      this.form.controls.h_End.setValue(strDtEnd.substring(11,19));

    }
  }

  save() {
    let dtStart = new Date (this.data.start);
    let strData = dtStart.toLocaleString('sv').substring(0,10);
    let dtEnd = new Date (dtStart.setHours(dtStart.getHours() + 1));
    let strDtEnd = dtEnd.toLocaleString('sv').replace(' ', 'T')
    this.strH_end = strDtEnd.substring(11,19);
    let idLezione: number;
    
    if (this.data.idLezione)
      idLezione = this.data.idLezione;
    else
      idLezione = 0;

    const promise  = this.svcLezioni.listByDocenteAndOraOverlap (idLezione, this.form.controls['docenteID'].value, strData, this.data.start.substring(11,19), this.strH_end)
      .toPromise();

    promise.then( (val: CAL_Lezione[]) => {
      if (val.length > 0) {
        //console.log (val);
        let strMsg = "il Maestro " + val[0].docente.persona.nome + " " + val[0].docente.persona.cognome + " \n è già impegnato in questo slot in ";
        val.forEach (x =>
          {strMsg = strMsg + "\n - " + x.classeSezioneAnno.classeSezione.classe.descrizione2 + ' ' + x.classeSezioneAnno.classeSezione.sezione;}
        )

        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: strMsg}
        });
      } else {

        if (this.form.controls['id'].value == null)
        {
          //console.log (this.form.value);
          
          this.svcLezioni.post(this.form.value)
            .subscribe(res=> {
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            err=> (
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
            )
          );
        } else 
        {
          this.svcLezioni.put(this.form.value)
            .subscribe(res=> {
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            err=> (
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
            )
          );
        }
      }
    });
   

  }

  delete() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result){
        this.svcLezioni.delete (this.data.idLezione)
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
}
