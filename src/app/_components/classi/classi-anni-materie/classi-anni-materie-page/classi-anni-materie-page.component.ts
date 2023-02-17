import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';

//services

//models

//components
import { ClassiAnniMaterieDuplicaComponent } from '../classi-anni-materie-duplica/classi-anni-materie-duplica.component';
import { ClassiAnniMaterieListComponent } from '../classi-anni-materie-list/classi-anni-materie-list.component';


@Component({
  selector: 'app-classi-anni-materie-page',
  templateUrl: './classi-anni-materie-page.component.html',
  styleUrls: ['../classi-anni-materie.css']
})

export class ClassiAnniMateriePageComponent implements OnInit {

  @ViewChild(ClassiAnniMaterieListComponent) classiAnniMaterieList!: ClassiAnniMaterieListComponent;

  constructor(public _dialog: MatDialog ) {

  }

  ngOnInit(): void {
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
