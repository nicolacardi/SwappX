//#region ----- IMPORTS ------------------------

import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit }            from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA }                      from '@angular/material/dialog';
import { _UT_TableColVisible } from 'src/app/_models/_UT_TableColVisible';

//services
import { UserService }                          from 'src/app/_user/user.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { TableColumnsService } from '../tablecolumns.service';
//#endregion
@Component({
  selector: 'app-scelta-colonne',
  templateUrl: './scelta-colonne.component.html',
  styleUrls: ['./scelta-colonne.component.css']
})
export class SceltaColonneComponent implements OnInit {

  lstHidden!: _UT_TableColVisible[];
  lstVisible!: _UT_TableColVisible[];
  
  basket!: string[];
  items!: string[];
  

  constructor(
    public _dialogRef:                          MatDialogRef<SceltaColonneComponent>,
    private svcTableColumns:                    TableColumnsService,

    @Inject(MAT_DIALOG_DATA)
    public tableColInput:                     _UT_TableColVisible[], //qui arrivano le colonne da mostrare

    ) 
    { }

  ngOnInit(): void {


    this.lstHidden = this.tableColInput.filter(x=> x.visible== false);
    this.lstVisible = this.tableColInput.filter(x=> x.visible== true);
  }

  
  drop(event: CdkDragDrop<_UT_TableColVisible[]>) {

    //if(event.previousContainer.data.length <=1) return;

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

    //cancello tutti i record delle colonne e vado a riaggiungerli così hanno l'ordine preciso?
    //oppure faccio un update?

    this.lstVisible.forEach(
      (colonna, index) => {
        colonna.visible = true;
        colonna.ordCol = index + 1  ;
        this.svcTableColumns.put(colonna).subscribe();
      });

    this.lstHidden.forEach(
      (colonna, index) => {
        colonna.visible = false;
        colonna.ordCol = index + 1  ;
        this.svcTableColumns.put(colonna).subscribe();
        
      }
    )
    this._dialogRef.close();


    
  }
}
