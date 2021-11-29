import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlunniListComponent } from '../../alunni/alunni-list/alunni-list.component';

@Component({
  selector: 'app-scelta-colonne',
  templateUrl: './scelta-colonne.component.html',
  styleUrls: ['./scelta-colonne.component.css']
})
export class SceltaColonneComponent implements OnInit {

  gridName!: string;
  //userID!: 

  basket!: string[];
  items!: string[];
  
  //1- Modificare costruttore: in input deve accettare il parametro [gridName] (l'utente va recuperato da this.uService.currentUser)
  //ORCAPALETTA: come faccio a injettarlo ? private svcUser:        UserService,
 
  /*
  2-  Chiamare WS GET _UT_Layout [TODO asp.net core]
  input:
  //userID
  //gridName
  output:
  //List< columnName, isVisible >
  //
  */

  //3- Popolare le due liste in funzione del parametro isVisible

  /* 
  4- Save: Chiamare WS DELETE  (tutte le righe con chiave GridName e UserID)
             Chiamare WS POST per tutti gli elementi delle due liste 
  */

  //5- Refresh chiamante

  constructor(@Inject(MAT_DIALOG_DATA) public displayedColumns: string[]) { }

  ngOnInit(): void {
    console.log (this.displayedColumns);

    this.basket = this.displayedColumns;
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
