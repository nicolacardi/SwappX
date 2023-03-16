//#region ----- IMPORTS ------------------------
import { Component, Input, OnChanges, OnInit }  from '@angular/core';

//services
import { BlocchiCelleService }                  from '../blocchicelle.service';

//#endregion
@Component({
  selector: 'app-table-show',
  templateUrl: './tableshow.component.html',
  styleUrls: ['../templates.css']
})

export class TableShowComponent implements OnChanges{
//#region ----- Variabili --------------------

  testoCella!:                                  string[][];
  fontSizeCella!:                               number[][];
  public colsArr:                               number[] = [1]          //array di numeri = alle colonne inserite
  public rowsArr:                               number[] = [1, 2]       //array di numeri = alle righe inserite
  public colsWArr:                              number[] = [100]        //array delle larghezza
  public rowsHArr:                              number[] = [10, 10]     //array delle altezza

//#endregion

//#region ----- ViewChild Input Output -------

  @Input('bloccoID') bloccoID! :                number;
  @Input('adapt') adapt:                        number = 3;   //@Input con un default qualora non arrivasse da blocco


//#endregion
  constructor(
    private svcBloccoCella:                     BlocchiCelleService
  ) {}

//#region ----- LifeCycle Hooks e simili--------
  
  ngOnChanges() {
    this.loadData();
  }

  loadData() {
    //fa schifissimo lo so Andrew ma non so come fare altrimenti a inizializzre una matrice a due dimensioni
    //creo un array a due dimensioni e lo popolo x inizializzarlo
    //è l'array che conterrà i testi
    const rows = 10;
    const cols = 10;
    this.testoCella = [];
    this.fontSizeCella = [];
    for (let j = 0; j < rows; j++) {
      this.testoCella[j] = [];
      this.fontSizeCella[j] = [];
      for (let i = 0; i < cols; i++) {
        this.testoCella[j][i] = ""; 
        this.fontSizeCella[j][i] = 4; 
      }
    }

    this.svcBloccoCella.listByBlocco(this.bloccoID)
    .subscribe(
      cells => {
        console.log ("cells", cells);
        if (cells.length != 0) {
          
          this.colsArr = [];
          this.colsWArr = [];
          this.rowsArr = [];
          this.rowsHArr = [];
          //cicla sulle celle una ad una
          for (let i = 0; i < cells.length; i++){
              //se trova che non esiste la colonna la crea
              if (!this.colsArr.includes(cells[i].col)) {
                this.colsArr.push(cells[i].col);
                this.colsWArr.push(cells[i].w*this.adapt);
              }
              if (!this.rowsArr.includes(cells[i].row)) {
                this.rowsArr.push(cells[i].row);
                this.rowsHArr.push(cells[i].h*this.adapt);
              }
              this.testoCella[cells[i].row-1][cells[i].col-1] = cells[i].testo;
              this.fontSizeCella[cells[i].row-1][cells[i].col-1] = parseInt(cells[i].fontSize.substring(0, cells[i].fontSize.length - 2))/3;
          }
        } else {
        }
      }
    )
  }

//#endregion

}
