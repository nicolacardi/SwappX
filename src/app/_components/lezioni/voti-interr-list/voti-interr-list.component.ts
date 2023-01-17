import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';

//components


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { VotiInterrService }                    from '../voti-interr.service';

//models
import { TST_VotoInterr }                   from 'src/app/_models/TST_VotiInterr';


@Component({
  selector:     'app-voti-interr-list',
  templateUrl:  './voti-interr-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class VotiInterrListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<TST_VotoInterr>();
  
  displayedColumns: string[] = [ 
      "nome", 
      "cognome", 
      "voto",
      "giudizio",
      "argomento"
  ];
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatSort) sort!:                    MatSort;
  @Input() lezioneID!:                          number;
//#endregion

  constructor( 
    private svcVotiInterr:                      VotiInterrService,
    private _loadingService:                    LoadingService ) { 
  }
  
//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    if (this.lezioneID != undefined) {
      this.loadData();
    }
  }
  ngOnInit () {
    //this.loadData();
  }

  loadData () {
    let obsVoti$: Observable<TST_VotoInterr[]>;

    if (this.lezioneID != undefined) {
      obsVoti$= this.svcVotiInterr.listByLezione(this.lezioneID);
      const loadVoti$ =this._loadingService.showLoaderUntilCompleted(obsVoti$);

      loadVoti$.subscribe(
        res =>  {
          //console.log ("res", res);
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

  changeVoto(element: TST_VotoInterr, voto: string ) {
    
    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    element.voto = votoN;

    this.svcVotiInterr.put(element).subscribe();

  }

  changeGiudizio(element: TST_VotoInterr, giudizio: string) {
    
    element.giudizio = giudizio;

    this.svcVotiInterr.put(element).subscribe();

  }

  changeArgomento(element: TST_VotoInterr, argomento: string) {
    
    element.argomento = argomento;

    this.svcVotiInterr.put(element).subscribe();

  }

}



