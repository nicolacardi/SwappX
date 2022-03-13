import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { MAT_Materia } from 'src/app/_models/MAT_Materia';
import { PER_Docente } from 'src/app/_models/PER_Docente';
import { MaterieService } from 'src/app/_services/materie.service';
import { DocentiService } from '../../persone/docenti.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { LezioniService } from '../lezioni.service';

@Component({
  selector: 'app-lezione',
  templateUrl: './lezione.component.html',
  styleUrls: ['../calendario.component.css']
})
export class LezioneComponent implements OnInit {

//#region ----- Variabili -------

  form! :                     FormGroup;

  lezione$!:                  Observable<CAL_Lezione>;
  obsMaterie$!:               Observable<MAT_Materia[]>;
  obsDocenti$!:               Observable<PER_Docente[]>;
  strDataOra!:                string;
  strH_Ini!:                  string;
  strH_end!:                  string;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  breakpoint!:                number;


//#endregion

  constructor(
    public _dialogRef: MatDialogRef<LezioneComponent>,
    @Inject(MAT_DIALOG_DATA) public idLezione: number,

    private fb:                             FormBuilder, 

    private svcLezioni:                     LezioniService,
    private svcMaterie:                     MaterieService,
    private svcDocenti:                     DocentiService,

    private _loadingService:                LoadingService,


  ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      id:                         [null],


      // classeSezioneAnnoID:  number;
      dtCalendario:               [''],
    
      //campi di FullCalendar
      title:                      [''],
      h_Ini:                      [''],     
      h_end:                      [''],    
      colore:                     [''],
    
      docente:                    [''],
      materia:                    [''],
      ckFirma:                    [''],
      dtFirma:                    [''],
      ckAssente:                  [''],
      argomento:                  [''],
      compiti:                    [''],

      selectMateria:              [''],
      selectDocente:              [''],
      selecSupplente:              ['']

    });
   }

  ngOnInit () {

    
    this.form.controls.selectMateria.valueChanges
      .subscribe( val => console.log ("val", val))




    this.loadData();
  }


  loadData(): void {

    this.breakpoint = (window.innerWidth <= 800) ? 2 : 2;

    this.obsMaterie$ = this.svcMaterie.list();
    this.obsDocenti$ = this.svcDocenti.list();


    if (this.idLezione && this.idLezione + '' != "0") {
      const obsLezione$: Observable<CAL_Lezione> = this.svcLezioni.get(this.idLezione);
      const loadLezione$ = this._loadingService.showLoaderUntilCompleted(obsLezione$);
      this.lezione$ = loadLezione$
      .pipe(
          tap(
            lezione => {
              this.form.patchValue(lezione)
              this.form.controls['docente'].setValue(lezione.docente.persona.nome+" "+lezione.docente.persona.cognome)
              this.form.controls['selectMateria'].setValue(lezione.materiaID);  //in verità siamo fortunati che svcMaterie.list() è già arrivato...
              this.form.controls['selectDocente'].setValue(lezione.docenteID);  //in verità siamo fortunati che svcDocentiMaterie.list() è già arrivato...
              this.strDataOra = lezione.dtCalendario;
              this.strH_Ini = lezione.h_Ini;
              this.strH_end = lezione.h_End;

            }
          )
      );
    } else {
      this.emptyForm = true
    }


  }





  save() {


  }

  delete() {

  }
}
