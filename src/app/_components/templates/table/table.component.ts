//#region ----- IMPORTS ------------------------

import { AfterViewInit, Component, Input, ViewChild }  from '@angular/core';
import { A4 }                                   from 'src/environments/environment';
import { QuillEditorComponent }                 from 'ngx-quill'
import 'quill-mention'

//services
import { BlocchiCelleService }                  from '../blocchicelle.service';
import { TEM_BloccoCella } from 'src/app/_models/TEM_BloccoCella';
import { tap } from 'rxjs';

//#endregion
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['../templates.css']
})

export class TableComponent implements AfterViewInit{
//#region ----- Variabili --------------------

  currIndex:                                    number = 0;

  startWidth!:                                  number;                 //larghezza iniziale
  cellWidth!:                                   number;                 //larghezza cella
  isResizing:                                   boolean = false;        //flag se si sta facendo resize
  public colsArr:                               number[] = [1]          //array di numeri = alle colonne inserite
  public wArr:                                  number[] = [625]        //array delle larghezza
  public hArr:                                  number[] = [30, 30]     //array delle altezza
  public cellsArr:                              string[] = ['']         //array dei contenuti


  public customOptions = [{
    import: 'attributors/style/size',
    whitelist: ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px']
  }];

  modules = {
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      onSelect: (item:any, insertItem:any) => {
        const editor = this.editor.quillEditor
        insertItem(item)
        // necessary because quill-mention triggers changes as 'api' instead of 'user'
        editor.insertText(editor.getLength() - 1, '', 'user')
      },
      source: (searchTerm:any, renderList:any) => {
        const values = [
          { id: 1, value: 'anno scolastico' },
          { id: 2, value: 'nomeecognome alunno' }
        ]

        if (searchTerm.length === 0) {
          renderList(values, searchTerm)
        } else {
          const matches :any = []

          values.forEach((entry) => {
            if (entry.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
              matches.push(entry)
            }
          })
          renderList(matches, searchTerm)
        }
      }
    },
    toolbar: []
  }

//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('QuillEditor', { static: false }) editor!: QuillEditorComponent

  @Input('bloccoID') bloccoID! :                number;

//#endregion
  constructor(
    private svcBloccoCella:                     BlocchiCelleService
  ) {}

  ngAfterViewInit() {
    this.setupTableResize();

  }

  setupTableResize() {

    const rows = document.querySelectorAll('.resizable thead tr,.resizable tbody tr');
    //const cols = document.querySelectorAll('.resizable th, .resizable td'); //non funziona sui td allora li tolgo
    const cells = document.querySelectorAll('.resizable th');

    
    for (let i = 0; i < cells.length; i++){
      let x = 0;                                //x click iniziale
      this.startWidth = 0;                      //larghezza iniziale

      //applico dinamicamente una classe resize-bar-v a tutte le celle sia th che td
      //questo si vede materialmente con la comparsa delle "handles di resize"

        cells[i].classList.add('_pos-relative');
        const resizeBar = document.createElement('div');
        resizeBar.classList.add('resize-bar-v');
       
      //controlla se già non ha un div con la classe resize-bar-v e solo se non c'è già ne aggiunge uno
      if (!cells[i].querySelector('.resize-bar-v')) cells[i].appendChild(resizeBar);
      
      
      //questo è il metodo di mousedown che verrà applicato alle resize-bar
      const mouseDownHandler =  (e: any) => {
        x = e.clientX;                          //registra in x la posizione iniziale in cui ha cliccato
        this.startWidth = parseInt(window.getComputedStyle(cells[i]).width, 10);  //registra la larghezzainiziale
        this.isResizing = true;
      };

      //questo è il metodo di mouseMove che verrà applicato alle resize-bar
      const mouseMoveHandler =  (e: any) => {
        let totWidth = this.wArr.reduce((a, b) => a + b, 0);
        if (this.isResizing) {
          const dx = e.clientX - x;             //la differenza tra il punto iniziale in cui ho cliccato e la posizione corrente
          if (totWidth <630 || dx <0){
            (cells[i] as HTMLElement).style.width = `${this.startWidth + dx}px`; //applica la dimensione alla cella
            this.wArr[i] = this.startWidth + dx;
          }
        }
      };

      //questo è il metodo di mouseUp che verrà applicato al documento intero (potrei fare mouseup fuori dalla resize bar)
      const mouseUpHandler =  () => {
        this.isResizing = false;
      };

      resizeBar.addEventListener('mousedown', mouseDownHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      resizeBar.addEventListener('mousemove', mouseMoveHandler);

    };

    for (let i = 0; i < rows.length; i++){

      let y = 0;                                //y click iniziale
      let h = 0;                                //altezza della cella

      rows[i].classList.add('_pos-relative');
      const resizeBar = document.createElement('div');
      resizeBar.classList.add('resize-bar-h');

      //controlla se già non ha un div con la classe resize-bar-h e solo se non c'è già ne aggiunge uno
      if (!rows[i].querySelector('.resize-bar-h')) rows[i].appendChild(resizeBar);
      

      const mouseDownHandler =  (e: any) => {
        y = e.clientY;                          //registra in y la posizione iniziale in cui ha cliccato
        h = parseInt(window.getComputedStyle(rows[i]).height, 10);  //registra la altezza
        this.isResizing = true;
      };

      const mouseMoveHandler =  (e: any) => {
        if (this.isResizing && y != 0) {  //la condizione y != 0 risolve il problema di quando ci si sposta improvvisamente da una cella all'altra....
        
          const dy = e.clientY - y; //la differenza tra il punto iniziale in cui ho cliccato e la posizione corrente
          console.log ("i y", y);
          console.log ("i eclientY", e.clientY);
          (rows[i] as HTMLElement).style.height = `${h + dy}px`;
          this.hArr[i] = h + dy;
        }
      };

      const mouseUpHandler =  () => {
        this.isResizing = false;
      };

      resizeBar.addEventListener('mousedown', mouseDownHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      resizeBar.addEventListener('mousemove', mouseMoveHandler);

    }

    
    
  }

  addCol() {


    if (this.colsArr.length <10) {
      //aggiungo una colonna
      this.colsArr.push((this.colsArr[this.colsArr.length-1] + 1));
      //ricalcolo le larghezze di tutte le colonne
      let wtot = (A4.width)*3-4;
      this.wArr = [];
      let wcell = wtot/this.colsArr.length - 1;
      //imposto l'array delle larghezze
      for (let i = 0 ; i < this.colsArr.length; i++) {
        this.wArr.push(wcell);
      }

      //serve aspettare qualche ms
      setTimeout(() => {console.log(this.setupTableResize());}, 300);

    }

  }
  
  removeCol() {

    if (this.colsArr.length >1) {
      this.colsArr.pop();
      let wtot = (A4.width)*3 -4;
      this.wArr = [];
      let wcell = wtot/this.colsArr.length - 1

      for (let i = 0 ; i < this.colsArr.length; i++) {
        this.wArr.push(wcell);
      }

      //serve aspettare qualche ms
      setTimeout(() => {console.log(this.setupTableResize());}, 300);

    }
  }


  insertPlaceholder(event: any) {
    console.log ("insertPlaceholder", this.currIndex, event.target!.value);
    this.editor.quillEditor.insertText (this.currIndex, event.target!.value, 'bold', true);  
  }

  clickonth(i: number){
    // console.log("th", i)
    // console.log("wArr", this.wArr[i])
    // console.log("hArr", this.hArr[0])
  }
  clickontd(i: number){
    // console.log("td", i)
    // console.log("wArr", this.wArr[i])
    // console.log("hArr", this.hArr[1])
  }

  save() {
    //il salvataggio delle celle viene delegato a questo component
    return this.svcBloccoCella.deleteByBlocco(this.bloccoID)
    .pipe(
      tap(       () => {
        //dopo aver cancellato tutte le celle del blocco corrente vado a inserire quelle nuove
        let table = document.querySelector('table');
        for (var i = 0, row; row = table!.rows[i]; i++) {
          for (var j = 0, cell; cell = row.cells[j]; j++) {
              const qlcontent = cell.querySelector(".ql-editor");
  
              let bloccoCella: TEM_BloccoCella = {
                bloccoID: this.bloccoID,
                testo: qlcontent!.innerHTML,
                col: j+1,
                row: i+1,
                w: this.wArr[j],
                h: this.hArr[i]
              }
              this.svcBloccoCella.post (bloccoCella).subscribe();
          }  
        }
      }
      
      
      
      
      
      )
    )





  }
}
