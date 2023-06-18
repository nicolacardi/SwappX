//#region ----- IMPORTS ------------------------

import { Component, Input }                     from '@angular/core';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';


//components

//services
import { PagellaVotoObiettiviService }          from '../../pagelle/pagella-voto-obiettivi.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PagellaVotiService }                   from '../pagella-voti.service';

//models
import { DOC_PagellaVoto } from 'src/app/_models/DOC_PagellaVoto';


//#endregion

@Component({
  selector: 'app-pagelle-classe-edit',
  templateUrl: './pagelle-classe-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class PagelleClasseEditComponent {

//#region ----- Variabili ----------------------

  @Input('classeSezioneAnnoID') classeSezioneAnnoID! : number;
  @Input('materiaID') materiaID! :              number;
  @Input('periodo') periodo! :                  number;


  displayedColumns: string[] = [
    // "actionsColumn", 
    "alunnoID", 
    "nome",
    "cognome", 
    "voto"

  ];


  matDataSource =                               new MatTableDataSource<DOC_PagellaVoto>();

//#endregion

  constructor(

    private svcPagellaVoti:                     PagellaVotiService,
    private _loadingService:                    LoadingService,    
  ) { }


  ngOnChanges() {
    console.log("this.materiaID", this.materiaID)
    this.loadData();
  }

  loadData() {

    let obsPagelleVoti$: Observable<DOC_PagellaVoto[]>;

    obsPagelleVoti$= this.svcPagellaVoti.listByCSAMateria(this.classeSezioneAnnoID, this.materiaID, this.periodo);
      
    const loadPagelleVoti$ =this._loadingService.showLoaderUntilCompleted(obsPagelleVoti$);

    loadPagelleVoti$.subscribe(
        val =>   {
          this.matDataSource.data = val;
          console.log ("estraggo:", val);
        }
      );




  }


}
