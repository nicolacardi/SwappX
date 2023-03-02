import { Component, Input } from '@angular/core';
import { TEM_BloccoCella } from 'src/app/_models/TEM_BloccoCella';
import { BlocchiCelleService } from '../blocchicelle.service';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2
}


@Component({
  selector: 'app-cella',
  templateUrl: './cella.component.html',
  styleUrls: ['../templates.css']
})
export class CellaComponent {

  private mouseClick!: {x: number, y: number, left: number, top: number}  //le 4 coordinate del click del mouse
  public width!:                                number;
  public widthImg!:                             number;

  public left!:                                 number;
  public top!:                                  number;
  public height!:                               number;
  public status:                                Status = Status.OFF;
  posx:                                         number=40;
//#region ----- ViewChild Input Output -------
  @Input('bloccoCella') public bloccoCella!:    TEM_BloccoCella;
//#endregion
constructor(
  private svcBlocchiCelle:                      BlocchiCelleService,
) { }

//#endregion

  ngOnInit() {
    this.loadData()
  }

  loadData() {
    this.svcBlocchiCelle.listCelleSxRow(this.bloccoCella.bloccoID, this.bloccoCella.row, this.bloccoCella.col).subscribe(
      val => val.forEach(x=> 
        {console.log ("this.posx", this.posx, x.w)
        this.posx= this.posx + x.w;
        console.log (this.posx);
        }
      )
    );
  }

  setStatus(event: MouseEvent, status: number){

    this.status = status;
    if(status === 1) //RESIZE
      {
        event.stopPropagation();
        return;
      }
    else { //LIBERO
      //per di qua passa anche alla fine del move quindi SALVO la posizione in DB ma solo se lo status è 0 (ho liberato la selezione)
      // console.log("blocco - setStatus - lancio la save");

    }
  }
  
}
