//#region ----- IMPORTS ------------------------

import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';

//components
import { BloccoEditComponent }                  from '../blocco-edit/blocco-edit.component';

//services
import { BlocchiService }                       from '../blocchi.service';

//models
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';
import { A4H, A4V , A3H, A3V }                   from 'src/environments/environment';
import { TableShowComponent }                   from '../tableshow/tableshow.component';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { concatMap, switchMap } from 'rxjs';
import { BlocchiCelleService } from '../blocchicelle.service';
import { BlocchiTestiService } from '../blocchitesti.service';
import { BlocchiFotoService } from '../blocchifoto.service';
import { TEM_BloccoTesto } from 'src/app/_models/TEM_BloccoTesto';
import { TEM_BloccoFoto } from 'src/app/_models/TEM_BloccoFoto';
import { TEM_BloccoCella } from 'src/app/_models/TEM_BloccoCella';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2
}


//#endregion
@Component({
  selector: 'app-blocco',
  templateUrl: './blocco.component.html',
  styleUrls: ['../templates.css']
})
export class BloccoComponent implements OnInit {

//#region ----- Variabili ----------------------

  public width!:                                number;
  public widthImg!:                             number;
  public snapToObject:                         boolean= true;
  public height!:                               number;
  public left!:                                 number;
  public top!:                                  number;
  public color!:                                string;
  public tipoBloccoID!:                         number;
  public ckTrasp!:                               boolean;
  public testo!:                                string;
  public fontSizeN:                             number = 1;
  private oldZoom:                              number = 1;
  public zoomratio:                             number =1 ;
  public objFormatoPagina!:                     any;
  public classTipo!:                             string;

  public verticiAltriBlocchi: { x: number, y: number }[] = [];
  private boxPos!: { left: number, top: number }; //la posizione del blocco
  private contPos!: { left: number, top: number, right: number, bottom: number };  //le 4 coordinate dei due punti alto sx e basso dx del contenitore
  public mouse!: {x: number, y: number}
  public status: Status = Status.OFF;
  private mouseClick!: {x: number, y: number, left: number, top: number}  //le 4 coordinate del click del mouse

  menuTopLeftPosition =  {x: '0', y: '0'} 

  pageW!:                                       number;
  pageH!:                                       number;
  pageMarginLeft!:                              number;
  pageMarginRight!:                             number;
  pageMarginTop!:                               number;
  pageMarginBottom!:                            number;
  
//#endregion

//#region ----- ViewChild Input Output ---------

  @Input('blocco') public blocco!:              TEM_Blocco;
  @Input() zoom!:                               number;
  @Input() magnete!:                            boolean;
  @Input() griglia!:                            boolean;
  @Input() formatopagina!:                      string;

  @Output('recordEdited') recordEdited = new EventEmitter<number>();

  @ViewChild("box") public box!: ElementRef;

  @ViewChild(TableShowComponent) public tableShowComponent!: TableShowComponent;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 


  //https://medium.com/swlh/create-a-resizable-and-draggable-angular-component-in-the-easiest-way-bb67031866cb
  //https://stackblitz.com/edit/angular-resizable-draggable?file=src%2Fapp%2Fapp.component.ts
//#endregion
  
//#region ----- Constructor --------------------

  constructor(
    private svcBlocchi:                         BlocchiService,
    private svcBlocchiCelle:                    BlocchiCelleService,
    private svcBlocchiTesti:                    BlocchiTestiService,
    private svcBlocchiFoto:                     BlocchiFotoService,
    public _dialog:                             MatDialog, 
    private _snackBar:                          MatSnackBar,
  ) { }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
    //console.log ("blocco-component ngOnChanges");


    //viene chiamata sia su SAVE che su cambio ZOOM
    this.zoomratio = this.zoom/this.oldZoom;
    this.width = this.blocco.w * this.zoomratio;
    this.height = this.blocco.h * this.zoomratio;
    this.top =  this.blocco.y* this.zoomratio;
    this.left = this.blocco.x* this.zoomratio;
    // this.width = this.blocco.w ;
    // this.height = this.blocco.h ;
    // this.top =  this.blocco.y ;
    // this.left = this.blocco.x ;

    this.tipoBloccoID = this.blocco.tipoBloccoID;
    
    this.classTipo = "tipo"+this.tipoBloccoID; 
    
    if (this.blocco._BloccoTesti![0]) this.testo = this.blocco._BloccoTesti![0]?.testo;
    if (this.blocco._BloccoTesti![0]) this.fontSizeN = this.blocco._BloccoTesti![0]?.fontSize;


    this.storeCurrPosSize()
    this.oldZoom = this.zoom;
    //console.log ("blocco-component fine di ngOnChanges");

    switch(this.formatopagina) {
      case 'A4V': this.setPageProperties(Object.assign({}, A4V)); break;
      case 'A4H': this.setPageProperties(Object.assign({}, A4H)); break;
      case 'A3V': this.setPageProperties(Object.assign({}, A3V)); break;
      case 'A3H': this.setPageProperties(Object.assign({}, A3H)); break;
    }



    //estraggo per lo snaptoObject le coppie x e y dei quattro vertici tutti gli ALTRI blocchi (!==this.blocco.id)
    // this.svcBlocchi.listByPagina(this.blocco.paginaID)
    // .pipe(
    //   mergeMap(listaBlocchi => {
    //     const listaAltriBlocchi = listaBlocchi.filter(blocco => blocco.id !== this.blocco.id);
    //     return from(listaAltriBlocchi).pipe(
    //       flatMap(blocco => [
    //         { x: blocco.x, y: blocco.y },
    //         { x: blocco.x + blocco.w, y: blocco.y },
    //         { x: blocco.x, y: blocco.y + blocco.h },
    //         { x: blocco.x + blocco.w, y: blocco.y + blocco.h }
    //       ]),
    //       toArray()
    //     );
    //   })
    // )
    // .subscribe(elencoCoppieValori => {
    //   this.verticiAltriBlocchi = elencoCoppieValori;
    // });



   }

   private setPageProperties(page: any): void {
    this.pageW = page.width;
    this.pageH = page.height;
    this.pageMarginLeft = page.marginleft;
    this.pageMarginRight = page.marginright;
    this.pageMarginTop = page.margintop;
    this.pageMarginBottom = page.marginbottom;
    this.objFormatoPagina = page;
  }


  ngOnInit(): void {

    



  }

  // ngAfterViewInit(): void {
  //   this.handleClickAndDoubleClick();
  // }

  // handleClickAndDoubleClick(){
  //   const el = this.box.nativeElement;
  //   const clickEvent = fromEvent<MouseEvent>(el, 'mouseup');
  //   const dblClickEvent = fromEvent<MouseEvent>(el, 'dblclick');
  //   const eventsMerged = merge(clickEvent, dblClickEvent).pipe(debounceTime(250));
  //   eventsMerged.subscribe(
  //     (event) => {
  //       if(event.type === 'dblclick'){
  //         this.openDetail()
  //       }

  //       if(event.type === 'mouseup'){
  //         this.setStatus(event, 0);
  //       }
  //     }
  //   );
  // }

  setStatus(event: MouseEvent, status: number){

    //console.log("blocco.component - setStatus");

    this.loadBox();
    this.loadContainer();

    this.status = status;
    if(status === 1) //RESIZE
      {
        event.stopPropagation();
        return;
      }
    else if(status === 2)  //MOVE
      {
        this.mouseClick = { x: event.clientX, y: event.clientY, left: this.left, top: this.top }; //MOVE imposta this.MouseClick con le coordinate iniziali
        return;
      }
    else { //LIBERO
      //per di qua passa anche alla fine del move quindi SALVO la posizione in DB ma solo se lo status è 0 (ho liberato la selezione)
      // console.log("blocco - setStatus - lancio la save");
      this.save();
    }
  }


  reloadData(w: number, h: number, x: number, y: number) {
    //console.log("blocco.component - reloadData");

    //viene chiamata su save di ritorno da blocco-edit,
    // NON su cambio di zoom
    //serve perchè potrei aver modificato posizione e dimensioni

      this.blocco.w = w *this.zoom;
      this.blocco.h = h *this.zoom;
      this.blocco.x = x *this.zoom;
      this.blocco.y = y *this.zoom;

      this.oldZoom = this.zoom;
      this.ngOnChanges();

  }

  loadBox(){
    //console.log("blocco.component - loadBox");
    //imposta l'oggetto boxPos tratteggiato estraendo la posizione in pixel (left, top) del box
    const {left, top} = this.box.nativeElement.getBoundingClientRect();
    this.boxPos = {left, top};
    // console.log ("this.boxPos", this.box.nativeElement.getBoundingClientRect());
    // console.log ("this.left", this.left);

  }

  loadContainer(){
    //console.log("blocco.component - loadContainer");
    //imposta la dimensione del container bianco a partire da boxPos in quanto sottrae dalla x della box la x relativa al container (this.left)
    const left = this.boxPos.left - this.left;
    // console.log ("this.boxPos.left", this.boxPos.left);
    // console.log ("this.left", this.left);
    const top = this.boxPos.top - this.top;
    const right = left + this.pageW *this.zoom;
    const bottom = top + this.pageH *this.zoom;
    this.contPos = { left, top, right, bottom };
    // console.log ("this.contPos", this.contPos);

  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent){
    //console.log("blocco.component - window:mousemove");

    this.mouse = { x: event.clientX, y: event.clientY };
    if(this.status === Status.RESIZE) this.resize();
    else if(this.status === Status.MOVE) this.move();
  }

  // @HostListener('box:mousedown', ['$event'])
  // onMouseDown(event: MouseEvent){
  //   this.setStatus(event, 2);
  // }
  
  // @HostListener('box:mouseup', ['$event'])
  // onMouseUp(event: MouseEvent){
  //   this.setStatus(event, 0);
  // }
  
//#endregion

  private resize(){
    //console.log("blocco.component - resize");

    //console.log (Math.abs( (this.mouse.x - this.boxPos.left)/this.zoom + this.left/this.zoom - (this.pageW-10)));
    console.log (this.boxPos.left);

    //console.log (this.mouse.x - this.boxPos.left*this.zoom + this.left*this.zoom - (this.pageH-10)*this.zoom);
    if (this.mouse.x - this.boxPos.left <0) this.width = 0 //evita che si possa fare un rettangolo di larghezza negativa
    else if (this.mouse.x > this.contPos.right) {
      // console.log ("this.contPos.right", this.contPos.right);
      // console.log ("this.contPos.left", this.contPos.left);
      // console.log ("this.left", this.left);
      this.width = this.contPos.right - this.contPos.left - this.left
      // console.log ("this.width", this.width);
    }
    else this.width = this.mouse.x - this.boxPos.left;

    
    if (this.magnete){ 
      //magnetismo a destra
      if (Math.abs( (this.mouse.x - this.boxPos.left)/this.zoom + this.left/this.zoom - (this.pageW-10)) < 5) this.width = (this.pageW-10)*this.zoom -this.left; 
      //magnetismo a metà
      if (Math.abs( (this.mouse.x - this.boxPos.left)/this.zoom + this.left/this.zoom - (this.pageW/2)) < 5) this.width = (this.pageW/2)*this.zoom -this.left; 
    }

    if (this.griglia) { this.width = Math.round(this.width/10/this.zoom)*10*this.zoom}


    if (this.mouse.y - this.boxPos.top <0) this.height = 0
    else if (this.mouse.y > this.contPos.bottom) {
      // console.log ("this.contPos.top", this.contPos.top);
      // console.log ("this.contPos.bottom", this.contPos.bottom);
      // console.log ("this.top", this.top);
      this.height = this.contPos.bottom - this.contPos.top - this.top
    }
    else this.height = this.mouse.y - this.boxPos.top;
    //console.log ("this.width", this.width);
    //console.log ("this.height", this.height);

    //magnetismo in basso
    if (this.magnete){ 
      if (Math.abs( (this.mouse.y - this.boxPos.top)/this.zoom + this.top/this.zoom - (this.pageH-10)) < 5) this.height = (this.pageH-10)*this.zoom -this.top; 
      if (Math.abs( (this.mouse.y - this.boxPos.top)/this.zoom + this.top/this.zoom - (this.pageH/2)) < 5) this.height = (this.pageH/2)*this.zoom -this.top; 

    }

    if (this.griglia) { this.height = Math.round(this.height/10/this.zoom)*10*this.zoom}


    this.storeCurrPosSize();

  }

  move(){
    //console.log("blocco.component - move");

    //this.mouse.x - this.mouseClick.x rappresenta quanta strada ha fatto il mouse verso dx da quando ha cliccato
    //questa va aggiunta alla posizione in cui si trovava il box (this.mouseClick.left) quando ha cliccato
    let xTemp = this.mouseClick.left + this.mouse.x - this.mouseClick.x;
    
    //magnetismo su Bordi e centro
    let mezzeriaX = (this.contPos.right+ this.contPos.left)/2;
    let quartoX = this.contPos.left + (this.contPos.right - this.contPos.left)/4;
    let trequartiX = this.contPos.left + (this.contPos.right - this.contPos.left)/4*3;

    if (this.magnete){ 

      //in generale per fermarsi in un punto a distanza xSet con la x del blocco
      //if (Math.abs(xTemp - xSet*this.zoom) < 5*this.zoom) xTemp = xSet*this.zoom; 
      //in generale per fermarsi in un punto a distanza xSet con la x+w del blocco
      //if (Math.abs(xTemp + this.width - xSet*this.zoom) < 5*this.zoom) xTemp = xSet*this.zoom - this.width;


      if (Math.abs(xTemp - 10*this.zoom) < 5*this.zoom) xTemp = 10*this.zoom; 
      if (Math.abs(xTemp + this.width - (this.pageW-10)*this.zoom) < 5*this.zoom) xTemp = (this.pageW-10)*this.zoom - this.width;
      //magnete sulla mezzeria
      if (Math.abs(xTemp + 0.5*this.width +this.contPos.left - mezzeriaX) < 5*this.zoom)   xTemp = mezzeriaX - this.contPos.left - this.width*0.5;
      //magnete sul quarto
      if (Math.abs(xTemp + 0.5*this.width +this.contPos.left - quartoX) < 5*this.zoom)   xTemp = quartoX - this.contPos.left - this.width*0.5;
      //magnete sui 3/4
      if (Math.abs(xTemp + 0.5*this.width +this.contPos.left - trequartiX) < 5*this.zoom)   xTemp = trequartiX - this.contPos.left - this.width*0.5;
    }

    if (this.griglia) { xTemp = Math.round(xTemp/10/this.zoom)*10*this.zoom}
     
    //viene verificata xTemp per essere sicuri che non vada oltre i limiti consentiti
    if (xTemp+this.contPos.left+this.width>this.contPos.right) this.left = this.contPos.right - this.contPos.left - this.width;
    else if (xTemp <0) this.left = 0
    else this.left = xTemp;

    let yTemp = this.mouseClick.top - this.mouseClick.y + this.mouse.y ;

    let mezzeriaY = (this.contPos.bottom+ this.contPos.top)/2;
    let quartoY = this.contPos.top + (this.contPos.bottom - this.contPos.top)/4;
    let trequartiY = this.contPos.top + (this.contPos.bottom - this.contPos.top)/4*3;

    //magnetismo su Bordi e centro
    if (this.magnete){ 
      if (Math.abs(yTemp - 10*this.zoom) < 5*this.zoom) yTemp = 10*this.zoom; 
      if (Math.abs(yTemp + this.height - (this.pageH-10)*this.zoom) < 5*this.zoom) yTemp = (this.pageH-10)*this.zoom - this.height;
      //magnete sulla mezzeria
      if (Math.abs(yTemp + 0.5*this.height +this.contPos.top - mezzeriaY) < 5*this.zoom)   yTemp = mezzeriaY - this.contPos.top - this.height*0.5;
      //magnete sul quarto
      if (Math.abs(yTemp + 0.5*this.height +this.contPos.top - quartoY) < 5*this.zoom)   yTemp = quartoY - this.contPos.top - this.height*0.5;
      //magnete sui 3/4
      if (Math.abs(yTemp + 0.5*this.height +this.contPos.top - trequartiY) < 5*this.zoom)   yTemp = trequartiY - this.contPos.top - this.height*0.5;
    }

    if (this.griglia) { yTemp = Math.round(yTemp/10/this.zoom)*10*this.zoom}

    
    if (yTemp+this.contPos.top+this.height>this.contPos.bottom) this.top = this.contPos.bottom - this.contPos.top - this.height;
    else if (yTemp <0) this.top = 0
    else this.top = yTemp;



    // if (this.snapToObject) {

    //   const snapDistance = 20 * this.zoom;
    //   const filteredVertice1 = this.verticiAltriBlocchi.filter(coppia => {
    //     const { x, y } = coppia;
    //     return (
    //       Math.abs(xTemp - x * this.zoom) < snapDistance &&
    //       Math.abs(yTemp - y * this.zoom) < snapDistance
    //     );
    //   });
    //   console.log(filteredVertice1);
    //   if (filteredVertice1.length !=0) {console.log ("EUREKA"); xTemp = filteredVertice1[0].x; yTemp = filteredVertice1[0].y}
    // }



    this.storeCurrPosSize();

  }

  storeCurrPosSize() {
    this.blocco.w = this.width;
    this.blocco.h = this.height;
    this.blocco.y =  this.top;
    this.blocco.x = this.left;
    //console.log ("blocco-component fine di StoreCurrPosSize");
  }

  public save() {
    // console.log("blocco - save");

    let objBlocco : TEM_Blocco =
    { 
      id: this.blocco.id!,
      paginaID: this.blocco.paginaID,
      pageOrd: this.blocco.pageOrd,
      x: Math.floor(this.left/this.zoom),
      y: Math.floor(this.top/this.zoom),
      w: Math.floor(this.width/this.zoom),
      h: Math.floor(this.height/this.zoom),
      color: this.blocco.color!,
      ckTrasp: this.blocco.ckTrasp,
      tipoBloccoID: this.blocco.tipoBloccoID,
      borderTop: this.blocco.borderTop,
      borderRight: this.blocco.borderRight,
      borderBottom: this.blocco.borderBottom,
      borderLeft: this.blocco.borderLeft

    }
    //console.log ("blocco-save - objBlocco", objBlocco);

    this.svcBlocchi.put(objBlocco).subscribe();

    this.storeCurrPosSize();
  }

  public openDetail() {
    //console.log("blocco - openDetail");
      let objPass = {
        bloccoID: this.blocco.id!,
        formatoPagina: this.objFormatoPagina
      }
      const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '700px',
        height: '550px',
        //data: this.blocco.id!
        data: objPass
      };
      const dialogRef = this._dialog.open(BloccoEditComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        (res:any) => {
        
          //deve ripescarsi l'oggetto
          if (res.operazione == "DELETE") {
            //se il blocco è stato cancellato allora va fatta una emit che la pagina recepisce per ricaricare tutto
            this.recordEdited.emit(this.blocco.id!)
            return;
          } 
          if (res.operazione == "SAVE TABELLA") {
            //se il blocco è stato cancellato allora va fatta una emit che la pagina recepisce per ricaricare tutto
            this.tableShowComponent.loadData();
            return;
          } 
          //se NON è stato cancellato il blocco si richiama il svcBlocchi e si rifa la get per questo singolo blocco
          this.svcBlocchi.get(this.blocco.id)
          .subscribe(val=> {
            this.blocco= val;
            this.reloadData(val.w, val.h, val.x, val.y);
          })
           
        }
      );
    
  }

  onRightClick(event: MouseEvent, blocco: TEM_Blocco) { 
    this.setStatus(event, 0);
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    console.log (this.menuTopLeftPosition);
    this.matMenuTrigger.menuData = {item: blocco}   
    this.matMenuTrigger.openMenu(); 
  }

  portaInPrimoPiano(blocco: TEM_Blocco) {
    console.log("porto in primo piano", blocco.id);
    this.svcBlocchi.setPageOrdToMax(blocco.id, this.blocco.paginaID).subscribe(()=>this.recordEdited.emit(this.blocco.id!)
    )
  }
  
  portaInSecondoPiano(blocco: TEM_Blocco) {
    console.log("porto in secondo piano", blocco.id);
    this.svcBlocchi.setPageOrdToOne(blocco.id, this.blocco.paginaID).subscribe(()=>this.recordEdited.emit(this.blocco.id!)
    )
  }

  duplica (blocco: TEM_Blocco) {


    const bloccoTesti: TEM_BloccoTesto[] = [...blocco._BloccoTesti!];
    const bloccoFoto: TEM_BloccoFoto[] = [...blocco._BloccoFoto!];
    const bloccoCelle: TEM_BloccoCella[] = [...blocco._BloccoCelle!];
    const bloccoCopia: TEM_Blocco = {...blocco};

    bloccoCopia.x = Math.floor(blocco.x/this.zoom);
    bloccoCopia.y = Math.floor(blocco.y/this.zoom);
    bloccoCopia.w = Math.floor(blocco.w/this.zoom);
    bloccoCopia.h = Math.floor(blocco.h/this.zoom);

    delete bloccoCopia.id;
    delete bloccoCopia._BloccoTesti;
    delete bloccoCopia._BloccoFoto;
    delete bloccoCopia._BloccoCelle;
    delete bloccoCopia.tipoBlocco;

    this.svcBlocchi.getMaxPageOrd(bloccoCopia.paginaID)
    .pipe(
      switchMap(pageOrd => {
        bloccoCopia.pageOrd = pageOrd? pageOrd.pageOrd + 1: 1;
        console.log("in fase di salvataggio...", bloccoCopia)
        return this.svcBlocchi.post(bloccoCopia);
      })
    ).subscribe(res => {

      //quello che segue si potrebbe anche fare meglio, definendo un oggetto svc che prende uno dei tre valori svcBlocchiTesti/Foto/Celle, ma sarebbe meno chiaro.
      switch(bloccoCopia.tipoBloccoID) {
        case 1:
          for (let i = 0; i<bloccoTesti!.length; i++) {
           bloccoTesti![i].bloccoID = res.id
           this.svcBlocchiTesti.post(bloccoTesti![i]).subscribe(res => {this.recordEdited.emit(this.blocco.id!)});
          }
        break;
        case 2:
          for (let i = 0; i<bloccoFoto!.length; i++) {
            bloccoFoto![i].bloccoID = res.id
            this.svcBlocchiFoto.post(bloccoFoto![i]).subscribe(res => {this.recordEdited.emit(this.blocco.id!)});
           }
        break;
        case 3:
          for (let i = 0; i<bloccoCelle!.length; i++) {
            bloccoCelle![i].bloccoID = res.id
            this.svcBlocchiCelle.post(bloccoCelle![i]).subscribe(res => {this.recordEdited.emit(this.blocco.id!)});
           }
        break;
      }
    })
  }

  delete(blocco: TEM_Blocco) {

    if (blocco.tipoBlocco!.descrizione == "Image") {
      this.svcBlocchiFoto.deleteByBlocco(blocco.id)
      .pipe(
        concatMap(() => this.svcBlocchi.delete(blocco.id!))
      )
      .subscribe(
        res=>{this._snackBar.openFromComponent(SnackbarComponent,{data: 'Blocco cancellato', panelClass: ['red-snackbar']});
        this.recordEdited.emit(this.blocco.id!)
        },
        err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}))
      );
    };
    if (blocco.tipoBlocco!.descrizione == "Text") {
      this.svcBlocchiTesti.deleteByBlocco(blocco.id)
      .pipe(
        concatMap(() => this.svcBlocchi.delete(blocco.id!))
      )
      .subscribe(
        res=>{this._snackBar.openFromComponent(SnackbarComponent,{data: 'Blocco cancellato', panelClass: ['red-snackbar']});
        this.recordEdited.emit(this.blocco.id!)
        },
        err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}))
      );
    }
    if (blocco.tipoBlocco!.descrizione == "Table") {
      this.svcBlocchiCelle.deleteByBlocco(blocco.id)
      .pipe(
        concatMap(() => this.svcBlocchi.delete(blocco.id!))
      )
      .subscribe(res=>{this._snackBar.openFromComponent(SnackbarComponent,{data: 'Blocco cancellato', panelClass: ['red-snackbar']});
      this.recordEdited.emit(this.blocco.id!)
      },
      err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})));
    } 
  }




}
