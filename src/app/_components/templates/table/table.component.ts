import { AfterViewChecked, AfterViewInit, Component, DoCheck, ElementRef, OnInit, ViewChild } from '@angular/core';
import { A4 } from 'src/environments/environment';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['../templates.css']
})
export class TableComponent implements AfterViewInit{

  rowsArr!:                                     number[];
  wArr!:                                        number[];

  constructor() {
    this.rowsArr = Array(1).fill(0).map((x,i)=>i);
    this.wArr = Array(1).fill(0).map((x,i)=>625);

    console.log ("this.rowsArr", (this.rowsArr));
  }

  ngAfterViewInit() {
    const rows = document.querySelectorAll('.resizable tbody tr');
    const cols = document.querySelectorAll('.resizable th, .resizable td');

    cols.forEach((col,index) => {
      let x = 0;
      let w = 0;
      let isResizing = false;

      col.classList.add('_pos-relative');
      const resizeBar = document.createElement('div');
      resizeBar.classList.add('resize-bar-v');
      col.appendChild(resizeBar);

      

      const mouseDownHandler = function (e: any) {
        x = e.clientX;                          //registra in x la posizione iniziale in cui ha cliccato
        w = parseInt(window.getComputedStyle(col).width, 10);  //registra la larghezza
        isResizing = true;
        
      };

      const mouseMoveHandler = function (e: any) {
        if (isResizing) {
          const dx = e.clientX - x; //la differenza tra il punto iniziale in cui ho cliccato e la posizione corrente
          (col as HTMLElement).style.width = `${w + dx}px`; //o questa! infatti il bordo non ti segue...
        }
      };

      const mouseUpHandler = function () {
        isResizing = false;
        // const resizeBar = col.querySelector('.resize-bar');   //"a volte" non riesce a vedere il div resize-bar
        // console.log(resizeBar);
        // if (resizeBar) {
        //   col.removeChild(resizeBar);
        // }
      };

      resizeBar.addEventListener('mousedown', mouseDownHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      resizeBar.addEventListener('mousemove', mouseMoveHandler);


    });

    rows.forEach((row,index) => {
      let y = 0;
      let h = 0;
      let isResizing = false;

      row.classList.add('_pos-relative');
      const resizeBar = document.createElement('div');
      resizeBar.classList.add('resize-bar-h');
      row.appendChild(resizeBar);

      

      const mouseDownHandler = function (e: any) {
        y = e.clientY;                          //registra in y la posizione iniziale in cui ha cliccato
        h = parseInt(window.getComputedStyle(row).height, 10);  //registra la altezza
        isResizing = true;
      };

      const mouseMoveHandler = function (e: any) {
        if (isResizing) {
          const dy = e.clientY - y; //la differenza tra il punto iniziale in cui ho cliccato e la posizione corrente
          
          (row as HTMLElement).style.height = `${h + dy}px`; //o questa! infatti il bordo non ti segue...
        }
      };

      const mouseUpHandler = function () {
        isResizing = false;
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
    if (this.rowsArr.length <10) {
      this.rowsArr.push((this.rowsArr[this.rowsArr.length] + 1));
      //ricalcolo le larghezze di tutte le colonne
      let wtot = (A4.width)*3-4;
      this.wArr = [];
      let wcell = wtot/this.rowsArr.length - 1
      for (let i = 0 ; i < this.rowsArr.length; i++) {
        this.wArr.push(wcell);
      }

      this.ngAfterViewInit();
    }

  }
  
  removeCol() {
    if (this.rowsArr.length >1) {
      this.rowsArr.pop();
      let wtot = (A4.width)*3 -4;
      this.wArr = [];
      let wcell = wtot/this.rowsArr.length - 1

      for (let i = 0 ; i < this.rowsArr.length; i++) {
        this.wArr.push(wcell);
      }
      this.ngAfterViewInit();
    }
  }
}
