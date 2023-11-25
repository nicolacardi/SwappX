//#region ----- IMPORTS ------------------------

import { Component, Input }                            from '@angular/core';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//services
import { PagelleService }                       from '../pagelle.service';
import { PagellaVotiService }                   from '../pagella-voti.service';
import { ClassiSezioniAnniService }             from '../../classi/classi-sezioni-anni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { IscrizioniService } from '../../iscrizioni/iscrizioni.service';
import { Observable, concatMap } from 'rxjs';
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';
import { MatTableDataSource } from '@angular/material/table';

//#endregion

@Component({
  selector: 'app-pagelle-alunno-list',
  templateUrl: './pagelle-alunno-list.component.html',
  styleUrls: ['../pagelle.css']
})
export class PagelleAlunnoListComponent {
  matDataSource =                               new MatTableDataSource<DOC_Pagella>();

  displayedColumns:                             string[] =  [
    "actionsColumn",
    "annoscolastico", 
    "classe",
    "periodo"
  ];

//#region ----- ViewChild Input Output ---------
  @Input('alunnoID') alunnoID!:                 number;
//#endregion


//#region ----- Constructor --------------------

  constructor(private svcPagelle:               PagelleService,


              private _loadingService:          LoadingService,
              private _snackBar:                MatSnackBar) { 
  }

  //#endregion

    ngOnInit() {
      this.loadData();
    }

    loadData() {



        if (this.alunnoID) {
          let obsPagelle$: Observable<DOC_Pagella[]>;
          obsPagelle$= this.svcPagelle.listByAlunno(this.alunnoID);
          let loadPagelle$ =this._loadingService.showLoaderUntilCompleted(obsPagelle$);
    
          loadPagelle$.subscribe( 
            pagelle =>   {
              this.matDataSource.data = pagelle;
            }
          );
        }

    }
}
