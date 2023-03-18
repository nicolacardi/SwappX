import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren }             from '@angular/core';
import { Observable }                           from 'rxjs';

//components

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PagineService }                        from '../pagine.service';
import { BlocchiService }                       from '../blocchi.service';
import { BlocchiTestiService }                  from '../blocchitesti.service';
import { BlocchiFotoService }                   from '../blocchifoto.service';
import { BlocchiCelleService }                  from '../blocchicelle.service';

//models
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';
import { TEM_BloccoCella }                      from 'src/app/_models/TEM_BloccoCella';
import { TEM_BloccoTesto }                      from 'src/app/_models/TEM_BloccoTesto';
import { TEM_BloccoFoto }                       from 'src/app/_models/TEM_BloccoFoto';


import { immaginebase }                         from 'src/environments/environment';


@Component({
  selector: 'app-pagina',
  templateUrl: './pagina.component.html',
  styleUrls: ['../templates.css']
})
export class PaginaComponent implements OnInit {

//#region ----- Variabili ----------------------
  public obsBlocchi$!:                          Observable<TEM_Blocco[]>;
  public blocchiArr!:                           TEM_Blocco[];
  public nLineeVert!:                           number[];
  public nLineeHor!:                            number[];

  defaultBloccoCella: TEM_BloccoCella = {
    bloccoID: 0,
    testo: '',
    col: 1,
    row: 1,
    w: 95,
    h: 10,
    fontSize: '12px'
  }

  defaultBloccoTesto: TEM_BloccoTesto = {
    bloccoID: 0,
    testo: '',
    fontSize: '12px'
  }

  defaultBloccoFoto: TEM_BloccoFoto = {
    bloccoID: 0,
    foto: immaginebase,
    w: 0,
    h: 0
  }

//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChildren('Blocco') Blocchi!: QueryList<any>;

  @Input() paginaID!:                           number;
  @Input() zoom!:                               number;
  @Input() magnete!:                            boolean;
  @Input() griglia!:                            boolean;

  @Output('deleteEmitted') deleteEmitter = new EventEmitter<number>(); //l'ID della pagina cancellata viene EMESSA quando la si cancella

//#endregion

//#region ----- Constructor --------------------
  constructor(
    private svcBlocchi:                         BlocchiService,
    private svcPagine:                          PagineService,
    private svcBlocchiCelle:                    BlocchiCelleService,
    private svcBlocchiTesti:                    BlocchiTestiService,
    private svcBlocchiFoto:                     BlocchiFotoService,
    private _loadingService :                   LoadingService 
  ) {
    this.nLineeVert = Array(21).fill(0).map((x,i)=>i);
    this.nLineeHor = Array(30).fill(0).map((x,i)=>i);
   }
//#endregion


  ngOnChanges() {

  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    console.log("pagina.component - loadData");
    const obsBlocchiTMP$ = this.svcBlocchi.listByPagina(this.paginaID);
    this.obsBlocchi$ = this._loadingService.showLoaderUntilCompleted( obsBlocchiTMP$);

    this.obsBlocchi$.subscribe(
      res=> {
        console.log ("Pagina-component - Blocchi di pagina numero:", this.paginaID, " -> ", res);
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
      x: 10,
      y: 10,
      w: 95,
      h: 50,
      ckFill: false,
      tipoBloccoID: tipoBloccoID,
      borderTop: false,
      borderRight: false,
      borderBottom: false,
      borderLeft: false
    }
    if (tipoBloccoID == 1) { //blocco testo
      this.svcBlocchi.post(objBlocco).subscribe(
        res => {
          this.defaultBloccoTesto.bloccoID = res.id;
          this.svcBlocchiTesti.post(this.defaultBloccoTesto).subscribe( res=> this.loadData());
           //questa combina un casino! perchè?
        }
      )
    }

    if (tipoBloccoID == 2) { //blocco immagine
      this.svcBlocchi.post(objBlocco).subscribe(
        res => {
          this.defaultBloccoFoto.bloccoID = res.id;
          this.svcBlocchiFoto.post(this.defaultBloccoFoto).subscribe(res=> this.loadData());
          //questa combina un casino!

        }
      )
    }

    if (tipoBloccoID == 3) { //table
      this.svcBlocchi.post(objBlocco).subscribe(
        res=> {
          this.defaultBloccoCella.bloccoID = res.id;
          this.defaultBloccoCella.row = 1;
          this.svcBlocchiCelle.post (this.defaultBloccoCella).subscribe(); //occhio alla sincronia
          this.defaultBloccoCella.row = 2;
          this.svcBlocchiCelle.post (this.defaultBloccoCella).subscribe(); //occhio alla sincronia
          console.log ("pagina.component - addBlock - subscribe");
          this.loadData();
        });
    }
    


  }

  bloccoEditedEmitted(bloccoID: number){
    console.log ("bloccoEditedEmitted");
    let zoomStore = this.zoom;
    this.loadData();
    this.zoom = zoomStore;
  }


}
