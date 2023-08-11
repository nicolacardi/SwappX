//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';

//components
import { ClassiAnniMaterieDuplicaComponent } from '../classi-anni-materie-duplica/classi-anni-materie-duplica.component';
import { ClassiAnniMaterieListComponent } from '../classi-anni-materie-list/classi-anni-materie-list.component';

//#endregion
@Component({
  selector: 'app-classi-anni-materie-page',
  templateUrl: './classi-anni-materie-page.component.html',
  styleUrls: ['../classi-anni-materie.css']
})

export class ClassiAnniMateriePageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------  

  @ViewChild(ClassiAnniMaterieListComponent) classiAnniMaterieList!: ClassiAnniMaterieListComponent;

//#endregion

  constructor(public _dialog: MatDialog ) { }

  ngOnInit(){
  }

  addRecord() {
    this.classiAnniMaterieList.addRecord()
  }

  openDuplica() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '430px',
      data: 0
    };
    const dialogRef = this._dialog.open(ClassiAnniMaterieDuplicaComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( 
        () => this.classiAnniMaterieList.loadData()
    );
  }
}
