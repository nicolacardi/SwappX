import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { _UT_GridLayout, _UT_GridLayoutColumn } from 'src/app/_models/_UT_GridLayout';
import { UserService } from 'src/app/_user/user.service';
import { AlunniListComponent } from '../../../alunni/alunni-list/alunni-list.component';

@Component({
  selector: 'app-scelta-colonne',
  templateUrl: './scelta-colonne.component.html',
  styleUrls: ['./scelta-colonne.component.css']
})
export class SceltaColonneComponent implements OnInit {

  //griglia!: string;
  //userID!: 

  lstColumns!: _UT_GridLayoutColumn[];
  lstVisible!: _UT_GridLayoutColumn[];
  
  basket!: string[];
  items!: string[];
  
  //1- Modificare costruttore: in input deve accettare il parametro [gridName] (l'utente va recuperato da this.uService.currentUser)
 
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

  constructor(@Inject(MAT_DIALOG_DATA) //public displayedColumns: string[],
                                       public gridLayout:       _UT_GridLayout, 
                                       private svcUser:        UserService) { 
                    
  }

  ngOnInit(): void {

    this.lstColumns = this.gridLayout.columns.filter(x=> x.isVisible== false);
    this.lstVisible = this.gridLayout.columns.filter(x=> x.isVisible== true);
  }

  
  drop(event: CdkDragDrop<_UT_GridLayoutColumn[]>) {

    if(event.previousContainer.data.length <=1) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  save() {
    //TODO: chiamata al WS
    //...

    //aggiornamento griglia chiamante
    //...
    
  }
}
