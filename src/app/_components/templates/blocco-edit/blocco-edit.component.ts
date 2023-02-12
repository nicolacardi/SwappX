import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { TEM_Blocco } from 'src/app/_models/TEM_Blocco';
import { BlocchiService } from '../blocchi.service';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2
}

@Component({
  selector: 'app-blocco-edit',
  templateUrl: './blocco-edit.component.html',
  styleUrls: ['../templates.css']
})
export class BloccoEditComponent implements OnInit, AfterViewInit {


//#region ----- Variabili -------

  private oldZoom:                              number = 1;
  private boxPos!: { left: number, top: number }; //la posizione del blocco
  private contPos!: { left: number, top: number, right: number, bottom: number };  //le 4 coordinate dei due punti alto sx e basso dx
  public mouse!: {x: number, y: number}
  public status: Status = Status.OFF;
  private mouseClick!: {x: number, y: number, left: number, top: number}
//#endregion

//#region ----- ViewChild Input Output -------

  @Input() bloccoID!:                           number;
  @Input() paginaID!:                           number;

  @Input('width') public width!: number;
  @Input('height') public height!: number;
  @Input('left') public left!: number;
  @Input('top') public top!: number;
  @Input() zoom!:                               number;

  @ViewChild("box") public box!: ElementRef;



//#endregion
  constructor(
    private svcBlocchi:                         BlocchiService
  ) { }

  ngOnChanges() {
    this.reloadData();
  }

  ngOnInit(): void {
  }


  ngAfterViewInit(){
    this.loadBox();
    this.loadContainer();

  }

  reloadData() {
    console.log ("è cambiato lo zoom!", this.zoom);
    this.loadBox();
    this.loadContainer();
  }


  
  loadBox(){

    const {left, top} = this.box.nativeElement.getBoundingClientRect();
    this.boxPos = {left, top};
    console.log ("this.boxPos", this.boxPos);
  }

  loadContainer(){
    const left = this.boxPos.left - this.left;
    const top = this.boxPos.top - this.top;
    const right = left + 210*this.zoom;
    const bottom = top + 297*this.zoom;
    this.contPos = { left, top, right, bottom };
    console.log ("this.contPos", this.contPos);
  }

  setStatus(event: MouseEvent, status: number){
    if(status === 1) 
      {
        event.stopPropagation(); //RESIZE
      }
    else if(status === 2) 
      {
        this.mouseClick = { x: event.clientX, y: event.clientY, left: this.left, top: this.top }; //MOVE imposta this.MouseClick con le coordinate iniziali
        //console.log ("this.mouseClick", this.mouseClick);
      }
    else {
      this.loadBox(); //altro
    }
    this.status = status;
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
      console.log ("this.contPos.right", this.contPos.right);
      console.log ("this.contPos.left", this.contPos.left);
      console.log ("this.left", this.left);
      this.width = this.contPos.right - this.contPos.left - this.left
      console.log ("this.width", this.width);
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
    // console.log ("this.height", this.height);
    console.log ("this.contPos.left", this.contPos.left);
  }


  move(){
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
    console.log ("this.contPos.left", this.contPos.left);
  }

  public save() {
    let objBlocco : TEM_Blocco =
    { 
      id: this.bloccoID,
      paginaID: this.paginaID,
      x: Math.floor(this.left/this.zoom),
      y: Math.floor(this.top/this.zoom),
      w: Math.floor(this.width/this.zoom),
      h: Math.floor(this.height/this.zoom),
      fill: false,
    }
    this.svcBlocchi.put(objBlocco).subscribe();

    //console.log (this.left/this.zoom, this.top/this.zoom, this.width/this.zoom, this.height/this.zoom);
  }

}
