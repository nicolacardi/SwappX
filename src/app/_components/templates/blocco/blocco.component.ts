import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { debounceTime, fromEvent, merge, Observable } from 'rxjs';

//components
import { BloccoEditComponent }                  from '../blocco-edit/blocco-edit.component';

//services
import { BlocchiService }                       from '../blocchi.service';

//models
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';
import { A4 } from 'src/environments/environment';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2
}

@Component({
  selector: 'app-blocco',
  templateUrl: './blocco.component.html',
  styleUrls: ['../templates.css']
})
export class BloccoComponent implements OnInit {


//#region ----- Variabili ----------------------

  public width!:                                number;
  public widthImg!:                             number;

  public height!:                               number;
  public left!:                                 number;
  public top!:                                  number;
  public color!:                                string;
  public tipoBloccoID!:                         number;
  public ckFill!:                               boolean;
  public testo!:                                string;
  public fontSizeN:                             number = 1;
  private oldZoom:                              number = 1;
  public zoomratio:                             number =1 ;

  public classTipo!:                             string;

  private boxPos!: { left: number, top: number }; //la posizione del blocco
  private contPos!: { left: number, top: number, right: number, bottom: number };  //le 4 coordinate dei due punti alto sx e basso dx del contenitore
  public mouse!: {x: number, y: number}
  public status: Status = Status.OFF;
  private mouseClick!: {x: number, y: number, left: number, top: number}  //le 4 coordinate del click del mouse
//#endregion

//#region ----- ViewChild Input Output -------

  @Input('blocco') public blocco!:              TEM_Blocco;
  @Input() zoom!:                               number;
  @Input() magnete!:                            boolean;
  @Input() griglia!:                            boolean;

  @Output('recordEdited') recordEdited = new EventEmitter<number>();

  @ViewChild("box") public box!: ElementRef;
  //https://medium.com/swlh/create-a-resizable-and-draggable-angular-component-in-the-easiest-way-bb67031866cb
  //https://stackblitz.com/edit/angular-resizable-draggable?file=src%2Fapp%2Fapp.component.ts
//#endregion
  
//#region ----- Constructor --------------------

  constructor(
    private svcBlocchi:                         BlocchiService,
    public _dialog:                             MatDialog, 
  ) { }

//#endregion



  ngOnChanges() {

    //viene chiamata sia su SAVE che su cambio ZOOM
    this.zoomratio = this.zoom/this.oldZoom;
    this.width = this.blocco.w * this.zoomratio;
    this.height = this.blocco.h * this.zoomratio;
    this.top =  this.blocco.y* this.zoomratio;
    this.left = this.blocco.x* this.zoomratio;
    this.tipoBloccoID = this.blocco.tipoBloccoID;
    
    this.classTipo = "tipo"+this.tipoBloccoID; 
    
    if (this.blocco.bloccoTesto) this.testo = this.blocco.bloccoTesto?.testo;
    if (this.blocco.bloccoTesto) this.fontSizeN = parseInt(this.blocco.bloccoTesto?.fontSize.substring(0, this.blocco.bloccoTesto?.fontSize.length - 2));
    this.storeCurrPosSize()
    this.oldZoom = this.zoom;
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

    //console.log("blocco - setStatus");

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
    //console.log("blocco - loadBox");
    //imposta l'oggetto boxPos tratteggiato estraendo la posizione in pixel (left, top) del box
    const {left, top} = this.box.nativeElement.getBoundingClientRect();
    this.boxPos = {left, top};
    // console.log ("this.boxPos", this.box.nativeElement.getBoundingClientRect());
    // console.log ("this.left", this.left);

  }

  loadContainer(){
    //console.log("blocco - loadContainer");
    //imposta la dimensione del container bianco a partire da boxPos in quanto sottrae dalla x della box la x relativa al container (this.left)
    const left = this.boxPos.left - this.left;
    // console.log ("this.boxPos.left", this.boxPos.left);
    // console.log ("this.left", this.left);
    const top = this.boxPos.top - this.top;
    const right = left + A4.width *this.zoom;
    const bottom = top + A4.height *this.zoom;
    this.contPos = { left, top, right, bottom };
    // console.log ("this.contPos", this.contPos);

  }






  


  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent){
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
  


  private resize(){

    //console.log (Math.abs( (this.mouse.x - this.boxPos.left)/this.zoom + this.left/this.zoom - (A4.width-10)));
    console.log (this.boxPos.left);

    //console.log (this.mouse.x - this.boxPos.left*this.zoom + this.left*this.zoom - (A4.height-10)*this.zoom);
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
      if (Math.abs( (this.mouse.x - this.boxPos.left)/this.zoom + this.left/this.zoom - (A4.width-10)) < 5) this.width = (A4.width-10)*this.zoom -this.left; 
      //magnetismo a metà
      if (Math.abs( (this.mouse.x - this.boxPos.left)/this.zoom + this.left/this.zoom - (A4.width/2)) < 5) this.width = (A4.width/2)*this.zoom -this.left; 
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
      if (Math.abs( (this.mouse.y - this.boxPos.top)/this.zoom + this.top/this.zoom - (A4.height-10)) < 5) this.height = (A4.height-10)*this.zoom -this.top; 
      if (Math.abs( (this.mouse.y - this.boxPos.top)/this.zoom + this.top/this.zoom - (A4.height/2)) < 5) this.height = (A4.height/2)*this.zoom -this.top; 

    }

    if (this.griglia) { this.height = Math.round(this.height/10/this.zoom)*10*this.zoom}


    this.storeCurrPosSize();

  }


  move(){
    //console.log("blocco - move");

    //this.mouse.x - this.mouseClick.x rappresenta quanta strada ha fatto il mouse verso dx da quando ha cliccato
    //questa va aggiunta alla posizione in cui si trovava il box (this.mouseClick.left) quando ha cliccato
    let xTemp = this.mouseClick.left + this.mouse.x - this.mouseClick.x;

    
    //magnetismo su Bordi e centro
    let mezzeriaX = (this.contPos.right+ this.contPos.left)/2;
    if (this.magnete){ 
      if (Math.abs(xTemp - 10*this.zoom) < 5*this.zoom) xTemp = 10*this.zoom; 
      if (Math.abs(xTemp + this.width - (A4.width-10)*this.zoom) < 5*this.zoom) xTemp = (A4.width-10)*this.zoom - this.width;
      if (Math.abs(xTemp + 0.5*this.width +this.contPos.left - mezzeriaX) < 5*this.zoom)   xTemp = mezzeriaX - this.contPos.left - this.width*0.5;
    }

    if (this.griglia) { xTemp = Math.round(xTemp/10/this.zoom)*10*this.zoom}
     
    //viene verificata xTemp per essere sicuri che non vada oltre i limiti consentiti
    if (xTemp+this.contPos.left+this.width>this.contPos.right) this.left = this.contPos.right - this.contPos.left - this.width;
    else if (xTemp <0) this.left = 0
    else this.left = xTemp;

    let yTemp = this.mouseClick.top - this.mouseClick.y + this.mouse.y ;

    let mezzeriaY = (this.contPos.bottom+ this.contPos.top)/2;

    //magnetismo su Bordi e centro
    if (this.magnete){ 
      if (Math.abs(yTemp - 10*this.zoom) < 5*this.zoom) yTemp = 10*this.zoom; 
      if (Math.abs(yTemp + this.height - (A4.height-10)*this.zoom) < 5*this.zoom) yTemp = (A4.height-10)*this.zoom - this.height;
      if (Math.abs(yTemp + 0.5*this.height +this.contPos.top - mezzeriaY) < 5*this.zoom)   yTemp = mezzeriaY - this.contPos.top - this.height*0.5;

    }

    if (this.griglia) { yTemp = Math.round(yTemp/10/this.zoom)*10*this.zoom}

    
    if (yTemp+this.contPos.top+this.height>this.contPos.bottom) this.top = this.contPos.bottom - this.contPos.top - this.height;
    else if (yTemp <0) this.top = 0
    else this.top = yTemp;
    //console.log ("this.contPos.left", this.contPos.left);

    this.storeCurrPosSize();

  }


  storeCurrPosSize() {
    this.blocco.w = this.width;
    this.blocco.h = this.height;
    this.blocco.y =  this.top;
    this.blocco.x = this.left;
  }


  public save() {
    // console.log("blocco - save");

    let objBlocco : TEM_Blocco =
    { 
      id: this.blocco.id!,
      paginaID: this.blocco.paginaID,
      x: Math.floor(this.left/this.zoom),
      y: Math.floor(this.top/this.zoom),
      w: Math.floor(this.width/this.zoom),
      h: Math.floor(this.height/this.zoom),
      color: this.blocco.color!,
      ckFill: this.blocco.ckFill,
      bloccoFotoID: this.blocco.bloccoFotoID!,
      bloccoTestoID: this.blocco.bloccoTestoID!,
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

      const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '600px',
        height: '550px',
        data: this.blocco.id!
      };
      const dialogRef = this._dialog.open(BloccoEditComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        (res:any) => {
        
          //deve ripescarsi l'oggetto
        if (res.operazione != "DELETE") 
        this.svcBlocchi.get(this.blocco.id)
        .subscribe(val=> {
          this.blocco= val;
          //devo adattare alla larghezza....
          //console.log ("val", val);
          //this.reloadData(res.bloccoSize.w, res.bloccoSize.h, res.bloccoPos.x, res.bloccoPos.y);
          this.reloadData(val.w, val.h, val.x, val.y);
        })
        else this.recordEdited.emit(this.blocco.id!)
        }
      );
    
  }


  


}
