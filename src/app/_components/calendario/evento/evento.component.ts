import { Component, Inject, OnInit } from '@angular/core';
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

  constructor(
    public _dialogRef: MatDialogRef<EventoComponent>,
    @Inject(MAT_DIALOG_DATA) public idEvento: number,
    private svcEventi:        EventiService,
    private _loadingService:  LoadingService,


  ) { }

  ngOnInit(): void {


    if (this.idEvento && this.idEvento + '' != "0") {
      // const obsEvento$: Observable<CAL_Lezione> = this.svcEventi.get(this.idEvento);
      // const loadEvento$ = this._loadingService.showLoaderUntilCompleted(obsEvento$);
      // this.evento$ = loadEvento$
      // .pipe(
      //     tap(
      //       evento => this.form.patchValue(evento)
      //     )
      // );
    } else {
      // this.emptyForm = true
    }


  }

}
