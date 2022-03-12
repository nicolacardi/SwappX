import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { LoadingService } from '../../utilities/loading/loading.service';
import { EventiService } from '../eventi.service';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.css']
})
export class EventoComponent implements OnInit {

//#region ----- Variabili -------

  evento$!:                   Observable<CAL_Lezione>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  breakpoint!:                number;

//#endregion

  constructor(
    public _dialogRef: MatDialogRef<EventoComponent>,
    @Inject(MAT_DIALOG_DATA) public idEvento: number,
    private fb:                           FormBuilder, 

    private svcEventi:        EventiService,
    private _loadingService:  LoadingService,


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
      compiti:                    ['']


    });
   }

  ngOnInit () {
    this.loadData();
  }


  loadData(): void {

    this.breakpoint = (window.innerWidth <= 800) ? 2 : 2;

    if (this.idEvento && this.idEvento + '' != "0") {
      const obsEvento$: Observable<CAL_Lezione> = this.svcEventi.get(this.idEvento);
      const loadEvento$ = this._loadingService.showLoaderUntilCompleted(obsEvento$);
      this.evento$ = loadEvento$
      .pipe(
          tap(
            evento => {
              this.form.patchValue(evento)
              this.form.controls['docente'].setValue(evento.docente.persona.nome+" "+evento.docente.persona.cognome)
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
