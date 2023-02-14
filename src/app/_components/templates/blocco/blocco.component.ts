import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { Observable } from 'rxjs';

//components
import { BloccoEditComponent }                  from '../blocco-edit/blocco-edit.component';

//services
import { BlocchiService }                       from '../blocchi.service';

//models
import { TEM_Blocco }                           from 'src/app/_models/TEM_Blocco';

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


//#region ----- Variabili -------

  private oldZoom:                              number = 1;
  public divDisabled= "none";
  private oldLeft!:                              number;
  private oldTop!:                               number;

  private oldWidth!:                             number;
  private oldHeight!:                            number;


  private boxPos!: { left: number, top: number }; //la posizione del blocco
  private contPos!: { left: number, top: number, right: number, bottom: number };  //le 4 coordinate dei due punti alto sx e basso dx
  public mouse!: {x: number, y: number}
  public status: Status = Status.OFF;
  private mouseClick!: {x: number, y: number, left: number, top: number}
//#endregion

//#region ----- ViewChild Input Output -------

  @Input() bloccoID!:                           number;
  @Input() paginaID!:                           number;

  @Input('width') public width!:                number;
  @Input('height') public height!:              number;
  @Input('left') public left!:                  number;
  @Input('top') public top!:                    number;
  @Input('color') public color!:                string;

  @Input() zoom!:                               number;

  @ViewChild("box") public box!: ElementRef;

  @Output('recordEdited') recordEdited = new EventEmitter<number>();

  // https://medium.com/swlh/create-a-resizable-and-draggable-angular-component-in-the-easiest-way-bb67031866cb

  //https://stackblitz.com/edit/angular-resizable-draggable?file=src%2Fapp%2Fapp.component.ts
//#endregion
  constructor(
    private svcBlocchi:                         BlocchiService,
    public _dialog:                             MatDialog, 
    //public _renderer:                           Renderer2

  ) { }


  // @HostListener('document:mouseup', ['$event'])
  // onMouseUp(event: MouseEvent) {
  //   console.log("onMouseUp");  //questo crea il listener come se fosse stato scritto nell'html
  //   this.setStatus(event, 0)
  // }


  ngOnChanges() {
  //su cambio Zoom devo fare diverse operazioni
    console.log("blocco - ngOnChanges");
    this.reloadData();

  }

  ngOnInit(): void {

    //this._renderer.listen(this.box.nativeElement, 'window:mouseup', this.setStatus(event!, 0))
  }


  reloadData() {
    console.log("blocco - reloadData");

    // console.log ("è cambiato lo zoom! era", this.oldZoom, "ora è ",this.zoom);


    //solo la PRIMA volta (ratio = 1) e devo salvare le coordinate correnti
    //le volte successive devo ripristinare la posizione e le dimensioni del box ripescandole dai valori precedenti
    let ratio = this.zoom/this.oldZoom;
    if (ratio !=1 && this.oldWidth) {
      //quando passo di qua dopo save e con zoom != 1 oldWidth = 1!!! non va bene
      this.left = this.oldLeft*ratio;
      this.top = this.oldTop*ratio;
      this.width = this.oldWidth*ratio;
      this.height = this.oldHeight*ratio;

    } 
    this.storeOldPosSize()
    this.oldZoom = this.zoom;
  }


  loadBox(){
    console.log("blocco - loadBox");
    //imposta l'oggetto boxPos tratteggiato estraendo la posizione in pixel (left, top) del box
    const {left, top} = this.box.nativeElement.getBoundingClientRect();
    this.boxPos = {left, top};
    // console.log ("this.boxPos", this.box.nativeElement.getBoundingClientRect());
    // console.log ("this.left", this.left);

  }

  loadContainer(){
    console.log("blocco - loadContainer");
    //imposta la dimensione del container bianco a partire da boxPos in quanto sottrae dalla x della box la x relativa al container (this.left)
    const left = this.boxPos.left - this.left;
    // console.log ("this.boxPos.left", this.boxPos.left);
    // console.log ("this.left", this.left);
    const top = this.boxPos.top - this.top;
    const right = left + 210*this.zoom;
    const bottom = top + 297*this.zoom;
    this.contPos = { left, top, right, bottom };
    // console.log ("this.contPos", this.contPos);

  }

  setStatus(event: MouseEvent, status: number){
    console.log("blocco - setStatus");

    this.loadBox(); //altro
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
      console.log("blocco - setStatus - lancio la save");
      this.save();
    }



  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent){
    this.mouse = { x: event.clientX, y: event.clientY };
    if(this.status === Status.RESIZE) this.resize();
    else if(this.status === Status.MOVE) this.move();
  }

  private resize(){

    if (this.mouse.x - this.boxPos.left <0) this.width = 0 //evita che si possa fare un rettangolo di larghezza negativa
    else if (this.mouse.x > this.contPos.right) {
      // console.log ("this.contPos.right", this.contPos.right);
      // console.log ("this.contPos.left", this.contPos.left);
      // console.log ("this.left", this.left);
      this.width = this.contPos.right - this.contPos.left - this.left
      // console.log ("this.width", this.width);
    }
    else this.width = this.mouse.x - this.boxPos.left;

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

    this.storeOldPosSize();

  }


  move(){
    console.log("blocco - move");

    //this.mouse.x - this.mouseClick.x rappresenta quanta strada ha fatto il mouse verso dx da quando ha cliccato
    //questa va aggiunta alla posizione in cui si trovava il box (this.mouseClick.left) quando ha cliccato
    let xTemp = this.mouseClick.left + this.mouse.x - this.mouseClick.x;

    if (xTemp+this.contPos.left+this.width>this.contPos.right) this.left = this.contPos.right - this.contPos.left - this.width;
    else if (xTemp <0) this.left = 0
    else this.left = xTemp;

    let yTemp = this.mouseClick.top - this.mouseClick.y + this.mouse.y ;
    if (yTemp+this.contPos.top+this.height>this.contPos.bottom) this.top = this.contPos.bottom - this.contPos.top - this.height;
    else if (yTemp <0) this.top = 0
    else this.top = yTemp;
    //console.log ("this.contPos.left", this.contPos.left);

    this.storeOldPosSize();

  }


  storeOldPosSize() {
    console.log("blocco - storeOldPosSize");

    this.oldLeft = this.left;
    this.oldTop = this.top;
    this.oldWidth = this.width;
    this.oldHeight = this.height;
    // console.log ("this.oldLeft", this.oldLeft);
  }

  restoreOldPosSize() {
    this.left = this.oldLeft ;
    this.top = this.oldTop;
    this.width = this.oldWidth;
    this.height = this.oldHeight;
    // console.log ("this.oldLeft", this.oldLeft);
  }

  public save() {
    console.log("blocco - save");

    let objBlocco : TEM_Blocco =
    { 
      id: this.bloccoID,
      paginaID: this.paginaID,
      x: Math.floor(this.left/this.zoom),
      y: Math.floor(this.top/this.zoom),
      w: Math.floor(this.width/this.zoom),
      h: Math.floor(this.height/this.zoom),
      color: this.color,

    }
    this.svcBlocchi.put(objBlocco).subscribe();

    this.storeOldPosSize();
    //console.log (this.left/this.zoom, this.top/this.zoom, this.width/this.zoom, this.height/this.zoom);
  }

  public openDetail() {
    //this.box.nativeElement.removeEventListener("window:mouseup");
    console.log("blocco - openDetail");

      const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '600px',
        height: '370px',
        data: this.bloccoID
      };
      const dialogRef = this._dialog.open(BloccoEditComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        res => {
          //mi serve fare la refresh, quindi emetto recordEdited che Pagina riceve e ci pensa lei a farsi refresh
          if (res) this.recordEdited.emit(this.bloccoID)
        }
      );
    
  }

}
