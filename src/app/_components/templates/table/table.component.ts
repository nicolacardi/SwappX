import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, ViewChild, ViewContainerRef }             from '@angular/core';

import { A4 }                                   from 'src/environments/environment';
import { QuillEditorComponent }                 from 'ngx-quill'
import Quill from 'quill'
const parchment = Quill.import('parchment')
const block = parchment.query('block')
block.tagName = 'DIV'
Quill.register(block /* or NewBlock */, true)
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['../templates.css']
})



export class TableComponent implements AfterViewInit{
  currIndex:                                    number = 0;

  placeholder = 'placeholder';
  startWidth!:                                  number;
  cellWidth!:                                   number;
  isResizing:                                   boolean = false;
  public colsArr:                               number[] = [1]
  public wArr:                                  number[] = [625]

  public customOptions = [{
    import: 'attributors/style/size',
    whitelist: ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px']
  }];

  @ViewChild('QuillEditor', { static: false }) editor!: QuillEditorComponent

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    
    private viewContainerRef: ViewContainerRef

    ) {}

  ngAfterViewInit() {
    this.setupTableResize();

  }

  setupTableResize() {

    const rows = document.querySelectorAll('.resizable thead tr,.resizable tbody tr');
    //const cols = document.querySelectorAll('.resizable th, .resizable td'); //non funziona sui td allora li tolgo
    const cells = document.querySelectorAll('.resizable th, .resizable td');

    for (let i = 0; i < cells.length; i++){
      let x = 0;

      this.startWidth = 0;


      //applico dinamicamente una classe resize-bar-v a tutte le celle sia th che td
      //questo si vede materialmente con la comparsa delle "handles di resize"
      cells[i].classList.add('_pos-relative');
      const resizeBar = document.createElement('div');
      resizeBar.classList.add('resize-bar-v');
      cells[i].appendChild(resizeBar);
      
      //questo è il metodo di mousedown che verrà applicato alle handle
      const mouseDownHandler =  (e: any) => {
        x = e.clientX;                          //registra in x la posizione iniziale in cui ha cliccato
        this.startWidth = parseInt(window.getComputedStyle(cells[i]).width, 10);  //registra la larghezzainiziale
        this.isResizing = true;
        console.log ("cella numero",i);
      };

      const mouseDownCell =  (e: any) => {
        console.log ("cells.length", cells.length );
      };

      const mouseMoveHandler =  (e: any) => {
        let totWidth = this.wArr.reduce((a, b) => a + b, 0);
        if (this.isResizing) {
          const dx = e.clientX - x; //la differenza tra il punto iniziale in cui ho cliccato e la posizione corrente
          if (totWidth <630 || dx <0){
            (cells[i] as HTMLElement).style.width = `${this.startWidth + dx}px`; //applica la dimensione alla cella
            this.wArr[i] = this.startWidth + dx;
          }
        }
      };

      const mouseUpHandler =  () => {
        this.isResizing = false;
      };


      cells[i].addEventListener('mousedown', mouseDownCell);
      resizeBar.addEventListener('mousedown', mouseDownHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      resizeBar.addEventListener('mousemove', mouseMoveHandler);

    };

    rows.forEach((row,index) => {
      let y = 0;
      let h = 0;
      


      row.classList.add('_pos-relative');
      const resizeBar = document.createElement('div');
      resizeBar.classList.add('resize-bar-h');
      row.appendChild(resizeBar);

      

      const mouseDownHandler =  (e: any) => {
        y = e.clientY;                          //registra in y la posizione iniziale in cui ha cliccato
        h = parseInt(window.getComputedStyle(row).height, 10);  //registra la altezza
        this.isResizing = true;

        
      };

      const mouseMoveHandler =  (e: any) => {
        if (this.isResizing) {
          const dy = e.clientY - y; //la differenza tra il punto iniziale in cui ho cliccato e la posizione corrente
          
          (row as HTMLElement).style.height = `${h + dy}px`; //o questa! infatti il bordo non ti segue...
        }
      };

      const mouseUpHandler =  () => {
        this.isResizing = false;
        // const resizeBar = col.querySelector('.resize-bar');   //"a volte" non riesce a vedere il div resize-bar
        // console.log(resizeBar);
        // if (resizeBar) {
        //   col.removeChild(resizeBar);
        // }
      };

      resizeBar.addEventListener('mousedown', mouseDownHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      resizeBar.addEventListener('mousemove', mouseMoveHandler);


    }

    
    )
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
}
