import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggle, MatButtonToggleChange } from '@angular/material/button-toggle';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { PagelleService } from '../pagelle.service';

//classes
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';

@Component({
  selector: 'app-pagelle-edit',
  templateUrl: './pagelle-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class PagellaEditComponent implements OnInit {
//#region ----- Variabili -------
  periodo!:                                      number;
  dtIns!:                                        string;
  toggleQuadVal!:                                number;
  pagellaID!:                                    number; 
//#endregion  
//#region ----- ViewChild Input Output -------
  @Input('iscrizioneID') iscrizioneID!:          number;
  @Input('classeSezioneAnnoID') classeSezioneAnnoID!:          number;
  @ViewChild('toggleQuad') toggleQuad!:           MatButtonToggle;
//#endregion  

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

    this.periodo = toggleQuad;
    let obsPagelle$: Observable<DOC_Pagella[]>;
    obsPagelle$= this.svcPagelle.listByIscrizione(this.iscrizioneID);
    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagelle$);

    loadPagella$
    .pipe (
      map(val=>val.filter(val=>(val.periodo == toggleQuad)))
    )
    .subscribe(val =>  {
        if (val.length != 0)  {
          this.pagellaID = val[0].id!;
          this.dtIns = val[0].dtIns!;
        }
        else {
          this.pagellaID = -1;
          this.dtIns = '';
        }
      }
    );
  }

  quadClick(e: MatButtonToggleChange) {
    this.loadData(e.value);
    this.periodo = e.value;
  }
  
}
