import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';

//components


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { VotiService }                          from '../voti.service';

//models
import { CAL_Lezione }                         from 'src/app/_models/CAL_Lezione';
import { LezioniService } from '../lezioni.service';


@Component({
  selector:     'app-voti-list',
  templateUrl:  './voti-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class CompitiListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<CAL_Lezione>();
  
  displayedColumns: string[] = [ 
      "dtCalendario", 
      "materia",
      "argomento"
  ];
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatSort) sort!:                    MatSort;
  @Input() classeSezioneAnnoID!:                number;
//#endregion

  constructor(
    private svcLezioni:                         LezioniService,
    private _loadingService:                    LoadingService,
  ) { }
  
//#region ----- LifeCycle Hooks e simili-------
  ngOnInit () {
    this.loadData();
  }

  loadData () {
    let obsLezioni$: Observable<CAL_Lezione[]>;

    if (this.classeSezioneAnnoID != undefined) {
      obsLezioni$= this.svcLezioni.listByClasseSezioneAnno(this.classeSezioneAnnoID);
      const loadLezioni$ =this._loadingService.showLoaderUntilCompleted(obsLezioni$);

      loadLezioni$.subscribe(
        res =>  {
          console.log ("res", res);
          this.matDataSource.data = res;
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
        }
      );
    } 
  }
//#endregion

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'nome':                            return item.alunno.persona.nome;
        case 'cognome':                         return item.alunno.persona.cognome;
        default:                                return item[property]
      }
    };
  }




}



