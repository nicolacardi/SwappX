import { ChangeDetectorRef, Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { concatMap, take, tap } from 'rxjs/operators';

//components
import { DialogDataLezione, DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { Utility } from '../../utilities/utility.component';

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
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

@Component({
  selector: 'app-lezione',
  templateUrl: './lezione.component.html',
  styleUrls: ['../lezioni.component.css'],

})
export class LezioneComponent implements OnInit {

//#region ----- Variabili -------

  form! :                     FormGroup;

  lezione$!:                  Observable<CAL_Lezione>;
  obsMaterie$!:               Observable<MAT_Materia[]>;
  obsClassiDocentiMaterie$!:  Observable<CLS_ClasseDocenteMateria[]>;
  obsDocenti$!:               Observable<PER_Docente[]>;
  obsSupplenti$!:             Observable<PER_Docente[]>;

  strDtStart!:                string;
  strDtEnd!:                  string;

  strH_Ini!:                  string;
  strH_End!:                  string;

  dtStart!:                   Date;
  dtEnd!:                     Date;
  strClasseSezioneAnno!:       string;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  public docenteView: boolean = false;
  breakpoint!:                number;
  idClasseSezioneAnno!:       number;


  @ViewChild('autosize') autosize!: CdkTextareaAutosize;


//#endregion

  constructor( public _dialogRef: MatDialogRef<LezioneComponent>,
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
              private cdRef :                         ChangeDetectorRef,
              private _ngZone:                        NgZone ) {

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
  
      docenteID:                  [{value: '', disabled: true}],
      materiaID:                  [''],
      ckEpoca:                    [''],
      ckFirma:                    [''],
      dtFirma:                    [''],
      ckAssente:                  [''],
      argomento:                  [''],
      compiti:                    [''],
      supplenteID:                [''],
      start:                      [''],
      end:                        ['']
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

    this.form.controls.docenteID.valueChanges.subscribe( 
      val =>{
        //ora devo estrarre i supplenti: i docenti che per l'ora selezionata NON sono già impegnati
        this.obsSupplenti$ = this.svcDocenti.listSupplentiDisponibili(this.data.idLezione? this.data.idLezione: 0, val, this.data.dtCalendario, this.data.h_Ini, this.data.h_End)
        .pipe(
          tap (x=> console.log ("supplenti", x))
        );
      }
    );


    if (this.data.idClasseSezioneAnno != null && this.data.idClasseSezioneAnno != undefined) {
      this.svcClasseSezioneAnno.get(this.data.idClasseSezioneAnno)
      .subscribe(
        (val) => {
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

    if (this.data.dove == "orario") {

      this.form.controls.ckFirma.disable();
      this.form.controls.compiti.disable();
      this.form.controls.argomento.disable();

    } 
    else {
      this.form.controls.h_Ini.disable();
      this.form.controls.h_End.disable();
      this.form.controls.materiaID.disable();
      this.form.controls.supplenteID.disable();
      this.form.controls.ckEpoca.disable();
    }

    if (this.data.idLezione && this.data.idLezione + '' != "0") {
      const obsLezione$: Observable<CAL_Lezione> = this.svcLezioni.get(this.data.idLezione);
      const loadLezione$ = this._loadingService.showLoaderUntilCompleted(obsLezione$);
      this.lezione$ = loadLezione$
      .pipe(
        tap(
          lezione => {
            this.form.patchValue(lezione)

            //oltre ai valori del form vanno impostate alcune variabili: una data e alcune stringhe
            this.dtStart = new Date (this.data.start);
            this.strDtStart = Utility.UT_FormatDate(this.dtStart);
            this.strH_Ini = Utility.UT_FormatHour(this.dtStart);

            this.dtEnd = new Date (this.data.end);
            this.strH_End = Utility.UT_FormatHour(this.dtEnd);
          }
        )
      );
    } 
    else {
      //caso nuova Lezione

      this.emptyForm = true;
      //LA RIGA QUI SOPRA DETERMINAVA UN ExpressionChangedAfterItHasBeenCheckedError...con il DetectChanges si risolve!  
      this.cdRef.detectChanges();     

      this.dtStart = new Date (this.data.start);
      this.strDtStart = Utility.UT_FormatDate(this.dtStart);
      this.strH_Ini = Utility.UT_FormatHour(this.dtStart);

      this.dtEnd = new Date (this.dtStart.setHours(this.dtStart.getHours() + 1));  //in caso di nuova lezione per default impostiamo la durata a un'ora
      this.strDtEnd = Utility.UT_FormatDate(this.dtEnd);
      this.strH_End = Utility.UT_FormatHour(this.dtEnd);

      this.form.controls.classeSezioneAnnoID.setValue(this.data.idClasseSezioneAnno);
      this.form.controls.dtCalendario.setValue(this.dtStart);
      this.form.controls.h_Ini.setValue(this.strH_Ini);
      this.form.controls.h_End.setValue(this.strH_End);

    }
  }

  save() {

    this.strH_Ini = this.form.controls.h_Ini.value;
    this.strH_End = this.form.controls.h_End.value;

    const promise  = this.svcLezioni.listByDocenteAndOraOverlap (this.data.idLezione? this.data.idLezione: 0 , this.form.controls['docenteID'].value, this.strDtStart, this.strH_Ini, this.strH_End)
      .toPromise();

    promise.then( (val: CAL_Lezione[]) => {
      if (val.length > 0) {
        let strMsg = "il Maestro " + val[0].docente.persona.nome + " " + val[0].docente.persona.cognome + " \n è già impegnato in questo slot in ";
        val.forEach (x =>
          {strMsg = strMsg + "\n - " + x.classeSezioneAnno.classeSezione.classe.descrizione2 + ' ' + x.classeSezioneAnno.classeSezione.sezione;}
        )

        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: strMsg}
        });
      } 
      else {

        //https://thecodemon.com/angular-get-value-from-disabled-form-control-while-submitting/
        //i campi disabled non vengono più passati al form!
        //va prima lanciato questo loop che "ripopola" il form anche con i valori dei campi disabled
        for (const prop in this.form.controls) {
          this.form.value[prop] = this.form.controls[prop].value;
        }


        if (this.form.controls['id'].value == null) {          
          this.svcLezioni.post(this.form.value)
            .subscribe(res=> {
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            err=> (
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
            )
          );
        } 
        else  {
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
        this.svcLezioni.delete (this.data.idLezione).subscribe(
          res=>{
            this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
            this._dialogRef.close();
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          )
        );
      }
    });
  }

  dp1Change() {

    //prendo la data corrente
    let dtTMP = new Date (this.data.start);

    //ci metto l'H_End
    dtTMP.setHours(this.form.controls.h_End.value.substring(0,2));
    dtTMP.setMinutes(this.form.controls.h_End.value.substring(3,5));

    let setHours = 0;
    let setMinutes = 0;

    //tolgo un'ora, ma se vado sotto le 8 devo impostare le 8
    if ((dtTMP.getHours() - 1) < 8) { 
      setHours = 8;
      setMinutes = 0;
    } else { 
      setHours = (dtTMP.getHours() - 1)
      setMinutes = (dtTMP.getMinutes())
    }

    let dtTMP2 = new Date (dtTMP.setHours(setHours));
    dtTMP2.setMinutes(setMinutes);
    let dtISO = dtTMP2.toLocaleString();
    let dtTimeNew = dtISO.substring(11,19);   //tutto quanto sopra per arrivare a questa dtTimeNew da impostare nel caso 3 sottostante

    if (this.form.controls.h_Ini.value < "08:00") {this.form.controls.h_Ini.setValue ("08:00") }   //ora min di inizio 08:00:  sarà parametrica
    if (this.form.controls.h_Ini.value > "15:30") {this.form.controls.h_Ini.setValue ("15:30") }   //ora max di inizio 15:30: sarà parametrica
    if (this.form.controls.h_Ini.value >= this.form.controls.h_End.value) { this.form.controls.h_Ini.setValue (dtTimeNew) }
  }

  dp2Change() {

    //prendo la data corrente
    let dtTMP = new Date (this.data.start);

    //ci metto l'H_Ini
    dtTMP.setHours(this.form.controls.h_Ini.value.substring(0,2));
    dtTMP.setMinutes(this.form.controls.h_Ini.value.substring(3,5));

    let setHours = 0;
    let setMinutes = 0;

    //tolgo un'ora, ma se vado sopra le 15 devo impostare le 15
    if ((dtTMP.getHours() - 1) > 15) { 
      setHours = 15;
      setMinutes = 0;
    } else { 
      setHours = (dtTMP.getHours() + 1)
      setMinutes = (dtTMP.getMinutes())
    }
    let dtTMP2 = new Date (dtTMP.setHours(setHours));
    dtTMP2.setMinutes(setMinutes);
    let dtISO = dtTMP2.toLocaleString();
    let dtTimeNew = dtISO.substring(11,19); //tutto quanto sopra per arrivare a questa dtTimeNew da impostare nel caso 3 sottostante

    if (this.form.controls.h_End.value < "08:30") {this.form.controls.h_End.setValue ("08:30") } //ora min di fine 08:30:  sarà parametrica
    if (this.form.controls.h_End.value > "16:00") {this.form.controls.h_End.setValue ("16:00") } //ora max di fine 16:00:  sarà parametrica
    if (this.form.controls.h_End.value <= this.form.controls.h_Ini.value) { this.form.controls.h_End.setValue (dtTimeNew) }

  }

  ckAssenteChange() {
    if (this.form.controls.ckAssente.value != true) 
      this.form.controls.supplenteID.setValue("");
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

}
