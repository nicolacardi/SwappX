import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

//components
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { AlunniListComponent } from '../alunni-list/alunni-list.component';
import { SceltaColonneComponent } from '../../toolbar/scelta-colonne/scelta-colonne.component';

@Component({
  selector: 'app-alunni-toolbar',
  templateUrl: './alunni-toolbar.component.html'
})

export class AlunniToolbarComponent {

  @Input() alunniListComponent!:   AlunniListComponent;
  
  constructor(public _dialog: MatDialog) { }

  stampa() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "CURIOSO!", sottoTitolo: "Abbi pazienza!"}
    });
  }

  scarica() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "TE GO DITO CHE TE SI' CURIOSO!", sottoTitolo: "proprio impaziente eh!"}
    });
  }

  email() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "MOEGHEA!", sottoTitolo: "insomma!"}
    });
  }
  /*
  scegliColonne() {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: this.alunniListComponent.displayedColumns
    };
    const dialogRef = this._dialog.open(SceltaColonneComponent, dialogConfig);
    ;
  }
  */
  scegliColonne(component: AlunniListComponent) {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: component.displayedColumns
    };
    const dialogRef = this._dialog.open(SceltaColonneComponent, dialogConfig);
    ;
  }

}
