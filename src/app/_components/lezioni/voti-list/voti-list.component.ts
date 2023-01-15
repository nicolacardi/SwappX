import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';

//components


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { VotiService }                          from '../voti.service';

//models
import { TST_Voto }                         from 'src/app/_models/TST_Voti';


@Component({
  selector:     'app-voti-list',
  templateUrl:  './voti-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class VotiListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<TST_Voto>();
  
  displayedColumns: string[] = [ 
      "nome", 
      "cognome", 
      "voto",
      "giudizio"
  ];
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatSort) sort!:                    MatSort;
  @Input() lezioneID!:                          number;
//#endregion

  constructor(
    private svcVoti:                            VotiService,
    private _loadingService:                    LoadingService,
  ) { }
  
//#region ----- LifeCycle Hooks e simili-------
  ngOnInit () {
    this.loadData();
  }

  loadData () {
    let obsPresenze$: Observable<TST_Voto[]>;

    if (this.lezioneID != undefined) {
      obsPresenze$= this.svcVoti.listByLezione(this.lezioneID);
      const loadPresenze$ =this._loadingService.showLoaderUntilCompleted(obsPresenze$);

      loadPresenze$.subscribe(
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

  changeVoto(element: TST_Voto, voto: string) {
    
    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    element.voto = votoN;
    element.LezioneID = this.lezioneID;

    this.svcVoti.put(element);

  }


}



