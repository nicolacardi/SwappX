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
  selector:     'app-compiti-list',
  templateUrl:  './compiti-list.component.html',
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

  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;

  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    dtCalendario: '',
    materia: '',
    argomento: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatSort) sort!:                    MatSort;
  @Input() classeSezioneAnnoID!:                number;
//#endregion

  constructor( private svcLezioni:                         LezioniService,
               private _loadingService:                    LoadingService ) {  
  }
  
//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    this.loadData();
  }

  ngOnInit () {
//    this.loadData();
  }

  loadData () {
    let obsLezioni$: Observable<CAL_Lezione[]>;

    if (this.classeSezioneAnnoID != undefined) {
      obsLezioni$= this.svcLezioni.listByClasseSezioneAnnoCkCompito(this.classeSezioneAnnoID);
      const loadLezioni$ =this._loadingService.showLoaderUntilCompleted(obsLezioni$);

      loadLezioni$.subscribe(
        res =>  {
          console.log ("Compiti-list - loadData: ", res);
          this.matDataSource.data = res;
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
        }
      );
    } 
  }
//#endregion

  

//#region ----- Filtri & Sort -------

sortCustom() {
  this.matDataSource.sortingDataAccessor = (item:any, property) => {
    switch(property) {
      case 'nome':                            return item.alunno.persona.nome;
      case 'cognome':                         return item.alunno.persona.cognome;
      default:                                return item[property]
    }
  };
}


applyFilter(event: Event) {

  this.filterValue = (event.target as HTMLInputElement).value;
  this.filterValues.filtrosx = this.filterValue.toLowerCase();
  this.matDataSource.filter = JSON.stringify(this.filterValues)
}

filterPredicate(): (data: any, filter: string) => boolean {
  let filterFunction = function(data: any, filter: any): boolean {

    let searchTerms = JSON.parse(filter);
    let foundAlunno : boolean = false;
     
   let dtNotaddmmyyyy!: string;
    if (data.dtNota){
      let dArrN = data.dtNota.split("-");
       dtNotaddmmyyyy = dArrN[2].substring(0,2)+ "/" +dArrN[1]+"/"+dArrN[0];
    } else {
       dtNotaddmmyyyy = '';
    }

    let dtFirmaddmmyyyy!: string;
    if (data.dtFirma){
      let dArrF = data.dtFirma.split("-");
       dtFirmaddmmyyyy = dArrF[2].substring(0,2)+ "/" +dArrF[1]+"/"+dArrF[0];
    } else {
       dtFirmaddmmyyyy = '';
    }

    console.log ("st", searchTerms);
    console.log ("data", data);

    let boolSx = String(dtNotaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                || String(data.nota).indexOf(searchTerms.filtrosx) !== -1
                || (data.periodo == searchTerms.periodo)
                || String(data.persona.nome.toLowerCase() + ' ' + data.persona.cognome.toLowerCase()).indexOf(searchTerms.filtrosx) !== -1
                || String(dtFirmaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                || String(data.iscrizione.alunno.persona.nome.toLowerCase() + ' ' + data.iscrizione.alunno.persona.cognome.toLowerCase()).indexOf(searchTerms.filtrosx) !== -1;
                
    // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
    let boolDx = String(dtNotaddmmyyyy).indexOf(searchTerms.dtNota) !== -1
                  && String(data.nota.toLowerCase()).indexOf(searchTerms.nota) !== -1
                  && ((data.periodo == searchTerms.periodo) || searchTerms.periodo == '' || searchTerms.periodo == null)
                  && String(data.persona.nome.toLowerCase() + ' ' + data.persona.cognome.toLowerCase()).indexOf(searchTerms.docente) !== -1
                  && String(dtFirmaddmmyyyy).indexOf(searchTerms.dtFirma) !== -1
                  && String(data.iscrizione.alunno.persona.nome.toLowerCase() + ' ' + data.iscrizione.alunno.persona.cognome.toLowerCase()).indexOf(searchTerms.alunno) !== -1 ;

    return boolSx && boolDx;
  }
  return filterFunction;
}

//#endregion


}



