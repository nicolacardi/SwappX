import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, ViewChildren }             from '@angular/core';
import { Observable, switchMap }                           from 'rxjs';

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

import { A4V, A4H, A3V, A3H }                   from 'src/environments/environment';

import { immaginebase }                         from 'src/environments/environment';


@Component({
  selector: 'app-pagina',
  templateUrl: './pagina.component.html',
  styleUrls: ['../templates.css']
})
export class PaginaComponent implements OnInit, OnChanges {

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
    fontSize: 12
  }

  defaultBloccoFoto: TEM_BloccoFoto = {
    bloccoID: 0,
    foto: immaginebase,
    w: 0,
    h: 0
  }

  pageW!:                                       number;
  pageH!:                                       number;
  pageMarginLeft!:                              number;
  pageMarginRight!:                             number;
  pageMarginTop!:                               number;
  pageMarginBottom!:                            number;


//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChildren('Blocco') Blocchi!: QueryList<any>;

  @Input() paginaID!:                           number;
  @Input() zoom!:                               number;
  @Input() snapObjects!:                            boolean;
  @Input() magnete!:                            boolean;
  @Input() griglia!:                            boolean;
  @Input() formatopagina!:                      string;


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
    switch(this.formatopagina) {
      case 'A4V': this.setPageProperties(Object.assign({}, A4V)); break;
      case 'A4H': this.setPageProperties(Object.assign({}, A4H)); break;
      case 'A3V': this.setPageProperties(Object.assign({}, A3V)); break;
      case 'A3H': this.setPageProperties(Object.assign({}, A3H)); break;
    }
   }

   private setPageProperties(page: any): void {
    this.pageW = page.width;
    this.pageH = page.height;
    this.pageMarginLeft = page.marginleft;
    this.pageMarginRight = page.marginright;
    this.pageMarginTop = page.margintop;
    this.pageMarginBottom = page.marginbottom;
    this.nLineeVert = Array(page.lineeVert).fill(0).map((x,i)=>i);
    this.nLineeHor = Array(page.lineeHor).fill(0).map((x,i)=>i);

  }

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const obsBlocchiTMP$ = this.svcBlocchi.listByPagina(this.paginaID);
    this.obsBlocchi$ = this._loadingService.showLoaderUntilCompleted( obsBlocchiTMP$);

    this.obsBlocchi$.subscribe(
      res=> {
        console.log ("pagina-component - loadData - Blocchi di pagina ", this.paginaID, " -> ", res);
        this.blocchiArr = res
      }
    )
  }
//#endregion

//#region ----- Delete Page, Save Page ---------
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
//#endregion

//#region ----- AddBlock -----------------------
  addBlock(tipoBloccoID: number) {
    console.log ("pagina.component - addBlock this.paginaID:", this.paginaID);
    this.svcBlocchi.getMaxPageOrd(this.paginaID)
    .pipe(
      switchMap(pageOrd => {
        let objBlocco : TEM_Blocco =
        { 
          paginaID:                             this.paginaID,
          pageOrd: pageOrd? pageOrd.pageOrd + 1: 1,
          x:                                    10,
          y:                                    10,
          w:                                    95,
          h:                                    50,
          ckTraspFill:                          true,
          typeBorders:                          "solid", 
          thicknBorders:                         "sottili",
          tipoBloccoID:                         tipoBloccoID,
          borderTop:                            false,
          borderRight:                          false,
          borderBottom:                         false,
          borderLeft:                           false
        }

        console.log("addBlock:", objBlocco);
        return this.svcBlocchi.post(objBlocco);
      })
    ).subscribe(res => {
      if (tipoBloccoID == 1) {
        this.defaultBloccoTesto.bloccoID = res.id;
        this.svcBlocchiTesti.post(this.defaultBloccoTesto).subscribe(res => this.loadData());
      }
      else if (tipoBloccoID == 2) {
        this.defaultBloccoFoto.bloccoID = res.id;
        this.svcBlocchiFoto.post(this.defaultBloccoFoto).subscribe(res => this.loadData());
      }
      else if (tipoBloccoID == 3) {
        this.defaultBloccoCella.bloccoID = res.id;
        this.defaultBloccoCella.row = 1;
        this.svcBlocchiCelle.post(this.defaultBloccoCella).subscribe();
        this.defaultBloccoCella.row = 2;
        this.svcBlocchiCelle.post(this.defaultBloccoCella).subscribe();
        console.log("pagina.component - addBlock - subscribe");
        this.loadData();
      }
    })
//#endregion

    // let objBlocco : TEM_Blocco =
    // { 
    //   paginaID: this.paginaID,
    //   pageOrd: 1,
    //   x: 10,
    //   y: 10,
    //   w: 95,
    //   h: 50,
    //   ckTrasp: true,
    //   tipoBloccoID: tipoBloccoID,
    //   borderTop: false,
    //   borderRight: false,
    //   borderBottom: false,
    //   borderLeft: false
    // }

    // if (tipoBloccoID == 1) { //blocco testo
    //   this.svcBlocchi.post(objBlocco).subscribe(
    //     res => {
    //       this.defaultBloccoTesto.bloccoID = res.id;
    //       this.svcBlocchiTesti.post(this.defaultBloccoTesto).subscribe( res=> this.loadData());
    //        //questa combina un casino! perchè?
    //     }
    //   )
    // }

    // if (tipoBloccoID == 2) { //blocco immagine
    //   this.svcBlocchi.post(objBlocco).subscribe(
    //     res => {
    //       this.defaultBloccoFoto.bloccoID = res.id;
    //       this.svcBlocchiFoto.post(this.defaultBloccoFoto).subscribe(res=> this.loadData());
    //       //questa combina un casino!

    //     }
    //   )
    // }

    // if (tipoBloccoID == 3) { //table
    //   this.svcBlocchi.post(objBlocco).subscribe(
    //     res=> {
    //       this.defaultBloccoCella.bloccoID = res.id;
    //       this.defaultBloccoCella.row = 1;
    //       this.svcBlocchiCelle.post (this.defaultBloccoCella).subscribe(); //occhio alla sincronia
    //       this.defaultBloccoCella.row = 2;
    //       this.svcBlocchiCelle.post (this.defaultBloccoCella).subscribe(); //occhio alla sincronia
    //       console.log ("pagina.component - addBlock - subscribe");
    //       this.loadData();
    //     });
    // }
    
  }

  bloccoEditedEmitted(bloccoID: number){
    // console.log ("bloccoEditedEmitted");
    let zoomStore = this.zoom;
    this.loadData();
    this.zoom = zoomStore;
  }

  bloccoMovedEmitted(bloccoID: number){
    // console.log ("bloccoMovedEmitted");
    //quando si muove un blocco bisogna dirlo a tutti gli altri e lanciare tutti i loro metodi setupSnapToObjects 
    this.Blocchi.forEach(blocco => blocco.setupSnapToObjects());
  }



}
