import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlunniListComponent } from '../../../alunni-list/alunni-list.component';

@Component({
  selector: 'app-scelta-colonne',
  templateUrl: './scelta-colonne.component.html',
  styleUrls: ['./scelta-colonne.component.css']
})
export class SceltaColonneComponent implements OnInit {

  basket!: string[];
  items!: string[];
  
  constructor(@Inject(MAT_DIALOG_DATA) public displayedColumns: string[]) { }

  ngOnInit(): void {
    console.log (this.displayedColumns);
    this.basket = this.displayedColumns;
    //this.basket = ['patate', 'angurie'];
    this.items = this.displayedColumns;
    this.items = ['cf', 'comuneNascita'];
    
    console.log("this.basket ngOninit", this.basket);
  }

  

  

  drop(event: CdkDragDrop<string[]>) {
    console.log ("basket prima",this.basket);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log("event.previousContainer.data prima", event.previousContainer.data);
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      console.log("event.previousContainer.data dopo", event.previousContainer.data);
    
    }
    console.log ("basket dopo",this.basket);
  }

  save() {

  }
}
