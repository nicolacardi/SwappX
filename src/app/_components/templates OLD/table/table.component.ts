//#region ----- IMPORTS ------------------------

import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild }  from '@angular/core';
import { QuillEditorComponent }                 from 'ngx-quill'
import { tap }                                  from 'rxjs';

import 'quill-mention'

//services
import { BlocchiCelleService }                  from '../blocchicelle.service';

//models
import { TEM_BloccoCella }                      from 'src/app/_models/TEM_BloccoCella';
import { TEM_MentionValue }                     from 'src/app/_models/TEM_MentionValue';

//#endregion
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['../templates.css']
})

export class TableComponent implements OnInit, OnChanges, AfterViewInit{
//#region ----- Variabili --------------------
  maxWidth!:                                    number;                 //larghezza massima (la larghezza del blocco wBlocco * 3)
  maxHeight!:                                   number;                 //altezza massima (l'altezza del blocco hBlocco * 3)

  modules:                                      any = {}



  empty:                                        boolean = true;
  currIndex:                                    number = 0;
  testoCella!:                                  string[][];
  fontSizeCella!:                                string[][];
  startWidth!:                                  number;                 //larghezza iniziale
  cellWidth!:                                   number;                 //larghezza cella
  isResizing:                                   boolean = false;        //flag se si sta facendo resize

  public colsArr:                               number[] = [1]          //array di numeri = alle colonne inserite
  public rowsArr:                               number[] = [1, 2]       //array di numeri = alle righe inserite

  public colsWArr:                              number[] = [100]        //array delle larghezza
  public rowsHArr:                              number[] = [30, 30]     //array delle altezza
  public cellsArr:                              string[] = ['']         //array dei contenuti


  public customOptions = [{
    import: 'attributors/style/size',
    whitelist: ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px']
  }];





  
  // modules = {
  //   mention: {
  //     allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
  //     onSelect: (item:any, insertItem:any) => {
  //       const editor = this.editor.quillEditor
  //       insertItem(item)
  //       // necessary because quill-mention triggers changes as 'api' instead of 'user'
  //       editor.insertText(editor.getLength() - 1, '', 'user')
  //     },
  //     source: (searchTerm:any, renderList:any) => {
  //       const values = [
  //         { id: 1, value: 'anno_scolastico' },
  //         { id: 2, value: 'nomeecognome_alunno' },
  //         { id: 3, value: 'datadinascita_alunno' },
  //         { id: 4, value: 'codicefiscale_alunno' }
  //       ]

  //       if (searchTerm.length === 0) {
  //         renderList(values, searchTerm)
  //       } else {
  //         const matches :any = []

  //         values.forEach((entry) => {
  //           if (entry.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
  //             matches.push(entry)
  //           }
  //         })
  //         renderList(matches, searchTerm)
  //       }
  //     }
  //   },
  //   toolbar: []
  // }

//#endregion

//#region ----- ViewChild Input Output -------

  @ViewChild('QuillEditor', { static: false }) editor!: QuillEditorComponent
  @Input('bloccoID') bloccoID! :                number;
  @Input('wBlocco') wBlocco!:                   string; 
  @Input('hBlocco') hBlocco!:                   string;
  @Input('mentionValues') mentionValues!:       TEM_MentionValue[];
  @Input('adapt') adapt:                        number = 3;   //@Input con un default qualora non arrivasse da blocco
//#endregion

  constructor(
    private svcBloccoCella:                     BlocchiCelleService
  ) {}

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges () {
    this.maxWidth = parseInt(this.wBlocco) *3;
    this.maxHeight = parseInt (this.hBlocco) * 3;
    // console.log ("this.maxHeight", this.maxHeight);
  }

  ngOnInit() {
    this.loadData();

    this.modules = {
      mention: {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@"],
        source: (searchTerm: any, renderList: any) => {
          const values = this.mentionValues;
          if (searchTerm.length === 0) {
            renderList(values, searchTerm);
          } else {
            const matches = [];
            for (let i = 0; i < values.length; i++)
              if (
                ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
              )
                matches.push(values[i]);
            renderList(matches, searchTerm);
          }
        }
      },
      toolbar: []
    }


  }

  ngAfterViewInit() {
    //è necessario attendere 300ms...perchè forse non ha finito tutto il rendering...boh!
    setTimeout(() => {
      this.setupTableCells(); 
      this.setupTableColWidths(); 
      this.setupTableRowHeights();
      this.setupTableResize();
    }, 300);

  }

  loadData() {

    //fa schifissimo lo so ma non so come fare altrimenti a inizializzre una matrice a due dimensioni
    //creo un array a due dimensioni e lo popolo x inizializzarlo
    //è l'array che contiene i testi
    const rows = 10;
    const cols = 10;
    this.testoCella = [];
    this.fontSizeCella = [];
    for (let j = 0; j < rows; j++) {
      this.testoCella[j] = [];
      this.fontSizeCella[j] = [];
      for (let i = 0; i < cols; i++) {
        this.testoCella[j][i] = ""; 
        this.fontSizeCella[j][i] = "12px";
      }
    }

    //questa ruotine non fa che caricare degli array

    //this.colsArr: contiene elenco colonne ed è del tipo   [1,2,3,4]
    //thiscolsWArr: contiene le larghezze delle colonne     [100,200,300,400]
    //this.rowsArr: contiene elenco righe                   [1,2]
    //this.rowsHArr: contiene le altezze delle righe        [30,80]
    //this.testoCella: contiene i testi delle celle         [['ciao','come stai?']['io bene', 'grazie']]
    //this.fontSizeCella: contiene le dimensioni dei testi  [['10px','12px']['14px', '10px']]

    //poi passa la palla alle routine di setup per applicarne i valori alla tabella
    this.svcBloccoCella.listByBlocco(this.bloccoID)
    .subscribe(
      cells => {
        // console.log ("cells", cells);
        this.colsArr = [];
        this.colsWArr = [];
        this.rowsArr = [];
        this.rowsHArr = [];
        if (cells.length != 0) {
          for (let i = 0; i < cells.length; i++){
              if (!this.colsArr.includes(cells[i].col)) {
                this.colsArr.push(cells[i].col);
                this.colsWArr.push(cells[i].w*this.adapt +1);
              }

              if (!this.rowsArr.includes(cells[i].row)) {
                this.rowsArr.push(cells[i].row);
                this.rowsHArr.push(cells[i].h*this.adapt +1);
              }
              this.testoCella[cells[i].row-1][cells[i].col-1] = cells[i].testo;
              this.fontSizeCella[cells[i].row-1][cells[i].col-1] = cells[i].fontSize;

          }
        } else {
          //se non ci sono dati in database creo un default con una colonna larga quanto lo spazio disponibile e con 2 righe alte 10*3
          this.colsArr.push(1);
          this.colsWArr.push(this.maxWidth);
          this.rowsArr.push(1, 2);
          this.rowsHArr.push(30, 30);
        }
      }
    )
  }

  setupTableCells() {
    //inserisce nelle celle il testo che si trova in this.testoCella[j][i]
    const rows = document.querySelectorAll('.blocco-edit tr');
    for (let j = 0; j < rows.length; j++){
      const cells = rows[j].querySelectorAll('td');
      for (let i = 0; i < cells.length; i++){
        const cell = cells[i].querySelector('.ql-editor');
        cell!.innerHTML = this.testoCella[j][i];
      }
    }
  }

  setupTableColWidths() {
    // ridimensiona le colonne in base a this.colsWArr[i]
    const rows = document.querySelectorAll('.blocco-edit tr');
    for (let j = 0; j < rows.length; j++){
      const cells = rows[j].querySelectorAll('td');
      for (let i = 0; i < cells.length; i++){
        (cells[i] as HTMLElement).style.width = `${this.colsWArr[i]}px`;
      }
    }
  }

  setupTableRowHeights() {
    //ridimensiona le righe in base a this.colsWArr[i]
    const rows = document.querySelectorAll('.blocco-edit tr');
    // console.log ("setupTableRowHeights", this.rowsHArr);
    for (let j = 0; j < rows.length; j++){
        (rows[j] as HTMLElement).style.height = `${this.rowsHArr[j]}px`; 
    }
  }

  setupTableResize() {

      //questo deve avvenire SOLO in blocco-edit, non anche in blocco
      //aggiunge alle celle le maniglie di resize compresi gli eventi di mousedown, mousemove e mouseup correlati alle maniglie stesse
      const rows = document.querySelectorAll('.blocco-edit tr');

      for (let j = 0; j < rows.length; j++){

        let y = 0;                                //y click iniziale
        let h = 0;                                //altezza della riga

        //********* DA TENERE **********/
        //applico dinamicamente una classe resize-bar-h a tutte le righe, sempre che già non abbia la resize-bar-h
        //rows[j].classList.add('_pos-relative');   //c'è già nell'html
        // const resizeBarH = document.createElement('div');
        // resizeBarH.classList.add('resize-bar-h');
        // if (!rows[j].querySelector('.resize-bar-h')) rows[j].appendChild(resizeBarH);
        //********** FINO QUI **********//

        const mouseDownHandlerH =  (e: any) => {
          y = e.clientY;                          //registra in y la posizione iniziale in cui ha cliccato
          h = parseInt(window.getComputedStyle(rows[j]).height, 10);  //registra la altezza
          this.isResizing = true;
        };

        const mouseMoveHandlerH =  (e: any) => {
          let totHeight = this.rowsHArr.reduce((a, b) => a + b, 0);
          if (this.isResizing && y != 0) {  //la condizione y != 0 risolve il problema di quando ci si sposta improvvisamente da una cella all'altra....
            const dy = e.clientY - y; //la differenza tra il punto iniziale in cui ho cliccato e la posizione corrente
            if (totHeight <this.maxHeight  || dy <0) {
              (rows[j] as HTMLElement).style.height = `${h + dy}px`;
              this.rowsHArr[j] = h + dy;
              // console.log(this.rowsHArr);
            }
          }
        };

        const resizeBarH = rows[j].querySelector('.resize-bar-h');

        resizeBarH!.addEventListener('mousedown', mouseDownHandlerH);
        resizeBarH!.addEventListener('mousemove', mouseMoveHandlerH);

        const cells = rows[j].querySelectorAll('td');

        for (let i = 0; i < cells.length; i++){
          let x = 0;                                //x click iniziale
          this.startWidth = 0;                      //larghezza iniziale

          //********* DA TENERE **********/
          //applico dinamicamente una classe resize-bar-v a tutte le celle della riga, sempre che già non abbiano la resize-bar-v
          //cells[i].classList.add('_pos-relative'); SERVE?? FORSE BASTA nell'html
          //const resizeBarV = document.createElement('div');
          //resizeBarV.classList.add('resize-bar-v');
          //if (!cells[i].querySelector('.resize-bar-v')) cells[i].appendChild(resizeBarV);
          //********** FINO QUI **********//


          //metodo di mousedown che verrà applicato alle resize-bar
          const mouseDownHandlerV =  (e: any) => {
            x = e.clientX;                          //registra in x la posizione iniziale in cui ha cliccato
            this.startWidth = parseInt(window.getComputedStyle(cells[i]).width, 10);  //registra la larghezzainiziale
            this.isResizing = true;
          };

          //metodo di mouseMove che verrà applicato alle resize-bar
          const mouseMoveHandlerV =  (e: any) => {
            let totWidth = this.colsWArr.reduce((a, b) => a + b, 0);
            if (this.isResizing) {
              const dx = e.clientX - x;             //la differenza tra il punto iniziale in cui ho cliccato e la posizione corrente
              if ((dx<0 || totWidth <(this.maxWidth)) && ((this.startWidth + dx)/3 > 15)){ //dx <0 serve per togliersi dai casi in cui ho superato di un pixel e voglio tornare indietro...non dovrebbe mai accadere cmq
                let row0 = rows[0];
                let cells0 = row0.querySelectorAll('td');
                (cells0[i] as HTMLElement).style.width = `${this.startWidth + dx}px`; //applica la dimensione alla cella
                this.colsWArr[i] = this.startWidth + dx;
              }
            }
          };

          const  resizeBarV = cells[i].querySelector('.resize-bar-v');
          resizeBarV!.addEventListener('mousedown', mouseDownHandlerV);
          resizeBarV!.addEventListener('mousemove', mouseMoveHandlerV); 
        }
      }

      //metodo di mouseUp che verrà applicato al documento intero (potrei fare mouseup fuori dalla resize bar)
      const mouseUpHandler =  () => {
        this.isResizing = false;
      };
      document.removeEventListener('mouseup', mouseUpHandler); //per evitare di aggiungerlo + volte (potrebbe esserci già)
      document.addEventListener('mouseup', mouseUpHandler);  
    
  }

  stopResize() {
    this.isResizing = false;
  }

//#endregion

//#region ----- Altri metodi -------------------

  addCol() {

    if (this.colsArr.length <10) {
      //aggiungo una colonna
      this.colsArr.push((this.colsArr[this.colsArr.length-1] + 1));
      // console.log ("this.colsArr", this.colsArr);
      //ricalcolo le larghezze di tutte le colonne
      let wtot = this.maxWidth - (this.colsArr.length);
      this.colsWArr = [];
      let wcell = wtot/this.colsArr.length;
      //imposto l'array delle larghezze
      for (let i = 0 ; i < this.colsArr.length; i++) {
        this.colsWArr.push(wcell);
      }

      //serve aspettare qualche ms
      setTimeout(() => {
        //this.setupTableCells();
        this.setupTableColWidths();
        //this.setupTableRowHeights();
        this.setupTableResize();
      }, 300);

    }

  }
  
  removeCol() {

    if (this.colsArr.length >1) {
      this.colsArr.pop();
      // console.log ("this.colsArr", this.colsArr);

      let wtot = this.maxWidth - (this.colsArr.length);
      this.colsWArr = [];
      let wcell = wtot/this.colsArr.length;

      for (let i = 0 ; i < this.colsArr.length; i++) {
        this.colsWArr.push(wcell);
      }

      //serve aspettare qualche ms
      setTimeout(() => {
        //this.setupTableCells();
        this.setupTableColWidths();
        //this.setupTableRowHeights();
        this.setupTableResize();}, 300);

    }
  }

  save() {

    //il salvataggio delle celle viene delegato a questo component
    //NB: è stata inserita una classe blocco o blocco-edit perchè quella da salvare non è la tabella sottostante, dentro blocco, ma quella in blocco-edit
    return this.svcBloccoCella.deleteByBlocco(this.bloccoID)
    .pipe(
      tap(() => {
        //dopo aver cancellato tutte le celle del blocco corrente vado a inserire quelle nuove
        const rows = document.querySelectorAll('.blocco-edit tr');
        for (let j = 0; j < rows.length; j++){
          const cells = rows[j].querySelectorAll('td');
          for (let i = 0; i < cells.length; i++){
            const qlcontent = cells[i].querySelector('.ql-editor');

              let bloccoCella: TEM_BloccoCella = {
                bloccoID: this.bloccoID,
                testo: qlcontent!.innerHTML,
                col: i+1,
                row: j+1,
                w: Math.floor(this.colsWArr[i] / this.adapt),  //i rotti sono una "rottura" :) bisognerebbe in qualche modo calcolare la wtot e attribuire i rotti mancanti all'ultima cella della riga
                h: Math.floor(this.rowsHArr[j] / this.adapt),
                fontSize: this.fontSizeCella[j][i]
              }
              this.svcBloccoCella.post (bloccoCella).subscribe();
          }  
        }
      })
    )





  }

  fontSizeChange(event: Event, j: number, i: number) {
    const select = event.target as HTMLSelectElement
    // console.log(select.value, j, i)
    this.fontSizeCella[j][i] = select.value;
  }

//#endregion

}
