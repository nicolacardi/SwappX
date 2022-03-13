import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { MAT_Materia } from 'src/app/_models/MAT_Materia';
import { PER_Docente } from 'src/app/_models/PER_Docente';
import { MaterieService } from 'src/app/_services/materie.service';
import { DocentiService } from '../../persone/docenti.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { EventiService } from '../eventi.service';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.css']
})
export class EventoComponent implements OnInit {

//#region ----- Variabili -------

  form! :                     FormGroup;

  evento$!:                   Observable<CAL_Lezione>;
  obsMaterie$!:               Observable<MAT_Materia[]>;
  obsDocenti$!:               Observable<PER_Docente[]>;


  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  breakpoint!:                number;

//#endregion

  constructor(
    public _dialogRef: MatDialogRef<EventoComponent>,
    @Inject(MAT_DIALOG_DATA) public idEvento: number,

    private fb:                             FormBuilder, 

    private svcEventi:                      EventiService,
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
      selectDocente:              ['']

    });
   }

  ngOnInit () {

    

    this.loadData();
  }


  loadData(): void {

    this.breakpoint = (window.innerWidth <= 800) ? 2 : 2;

    this.obsMaterie$ = this.svcMaterie.list();
    this.obsDocenti$ = this.svcDocenti.list();


    if (this.idEvento && this.idEvento + '' != "0") {
      const obsEvento$: Observable<CAL_Lezione> = this.svcEventi.get(this.idEvento);
      const loadEvento$ = this._loadingService.showLoaderUntilCompleted(obsEvento$);
      this.evento$ = loadEvento$
      .pipe(
          tap(
            evento => {
              this.form.patchValue(evento)
              this.form.controls['docente'].setValue(evento.docente.persona.nome+" "+evento.docente.persona.cognome)
              this.form.controls['selectMateria'].setValue(evento.materiaID);  //in verità siamo fortunati che svcMaterie.list() è già arrivato...
              this.form.controls['selectDocente'].setValue(evento.docenteID);  //in verità siamo fortunati che svcDocenti.list() è già arrivato...

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
