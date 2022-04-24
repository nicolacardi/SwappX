import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggle, MatButtonToggleChange } from '@angular/material/button-toggle';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';
import { LoadingService } from '../../utilities/loading/loading.service';
import { PagelleService } from '../pagelle.service';

@Component({
  selector: 'app-pagelle-edit',
  templateUrl: './pagelle-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class PagellaEditComponent implements OnInit {

  toggleQuadVal!:                                number;
  pagellaID!:                                    number; 
  @Input('iscrizioneID') iscrizioneID!:          number;
  @Input('classeSezioneAnnoID') classeSezioneAnnoID!:          number;

  @ViewChild('toggleQuad') toggleQuad!:           MatButtonToggle;


  constructor(
    private svcPagelle:               PagelleService,
    private _loadingService:          LoadingService,
  ) { }

  ngOnChanges() {
    if (this.iscrizioneID != undefined) {
      this.loadData(1);
    }
  }

  ngOnInit(): void {
  }

  loadData(toggleQuad: number) {


    let obsPagelle$: Observable<DOC_Pagella[]>;

    obsPagelle$= this.svcPagelle.listByIscrizione(this.iscrizioneID);
    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagelle$);

    loadPagella$
    .pipe (
      map(val=>val.filter(val=>(val.periodo == toggleQuad)))
    )
    .subscribe(val =>  {
        if (val.length != 0)  
          this.pagellaID = val[0].id;
        else
          this.pagellaID = -1;
      }
    );

  }


  quadClick(e: MatButtonToggleChange) {

    this.loadData(e.value);

    // if (e.value == 1) {
    //   this.displayedColumns = [
    //     "materia", 
    //     // "voto1", 
    //     // "tipoGiudizio1ID", 
    //     // "obiettivi",
    //     "multiVoto1",
    //     "note1"
    //   ];
    // } else {
    //   this.displayedColumns = [
    //     "materia", 
    //     // "voto2", 
    //     // "tipoGiudizio2ID", 
    //     // "obiettivi",
    //     "multiVoto2",
    //     "note2"
    //   ];
    // }
  }
  
}
