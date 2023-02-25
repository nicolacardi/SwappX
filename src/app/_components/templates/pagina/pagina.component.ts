import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren }             from '@angular/core';
import { Observable }                           from 'rxjs';

//components

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { BlocchiService }                       from '../blocchi.service';

//models
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';
import { PagineService } from '../pagine.service';


@Component({
  selector: 'app-pagina',
  templateUrl: './pagina.component.html',
  styleUrls: ['../templates.css']
})
export class PaginaComponent implements OnInit {

//#region ----- Variabili -------
  public obsBlocchi$!:                          Observable<TEM_Blocco[]>;
  public blocchiArr!:                           TEM_Blocco[];
  public nLineeVert!:                           number[];
  public nLineeHor!:                            number[];

//#endregion

//#region ----- ViewChild Input Output -------

  @Input() paginaID!:                           number;
  @Input() zoom!:                               number;
  @Input() magnete!:                            boolean;
  @Input() griglia!:                            boolean;


  @Output('deleteEmitted') deleteEmitter = new EventEmitter<number>(); //l'ID della pagina cancellata viene EMESSA quando la si cancella

  @ViewChildren('Blocco') Blocchi!: QueryList<any>;


  
//#endregion

  constructor(
    private svcBlocchi:                         BlocchiService,
    private svcPagine:                          PagineService,

    private _loadingService :                   LoadingService 

  ) {

    this.nLineeVert = Array(21).fill(0).map((x,i)=>i);
    this.nLineeHor = Array(30).fill(0).map((x,i)=>i);

   }

  ngOnChanges() {

  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const obsBlocchiTMP$ = this.svcBlocchi.listByPagina(this.paginaID);
    this.obsBlocchi$ = this._loadingService.showLoaderUntilCompleted( obsBlocchiTMP$);

    this.obsBlocchi$.subscribe(
      res=> {
        // console.log ("Blocchi di pagina:", this.paginaID, res);
        this.blocchiArr = res
      }
    )
  }

  deletePage() {
    this.svcPagine.delete(this.paginaID).subscribe(
      res=> {
        // console.log ("emetto", this.paginaID);
        this.deleteEmitter.emit(this.paginaID);
      }
    );
  }

  savePage() {
    let BlocchiArr = this.Blocchi.toArray();
    for(let i = 0; i < BlocchiArr.length; i++) {
      BlocchiArr[i].save();
    }
  }

  addBlock(tipoBloccoID: number) {
    let objBlocco : TEM_Blocco =
    { 
      paginaID: this.paginaID,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      ckFill: false,
      tipoBloccoID: tipoBloccoID,
      borderTop: false,
      borderRight: false,
      borderBottom: false,
      borderLeft: false
    }
    this.svcBlocchi.post(objBlocco).subscribe(
      res=> this.loadData()
    )


  }

  bloccoEditedEmitted(bloccoID: number){
    console.log ("bloccoEditedEmitted");
    let zoomStore = this.zoom;
    this.loadData();
    this.zoom = zoomStore;
  }


}
