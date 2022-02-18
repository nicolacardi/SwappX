import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

//components
import { DialogOkComponent } from '../utilities/dialog-ok/dialog-ok.component';
import { AlunniListComponent } from '../alunni/alunni-list/alunni-list.component';
import { SceltaColonneComponent } from './scelta-colonne/scelta-colonne.component';
import { JspdfService } from '../utilities/jspdf/jspdf.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html'
})

export class ToolbarComponent {
  rptColumnsNameArr !:                           [string[]];
  @Input() alunniListComponent!:                AlunniListComponent;
  @Input('rptTitle') rptTitle! :                string;
  @Input('rptFieldsToKeep') rptFieldsToKeep! :  string[];
  @Input('rptColumnsNames') rptColumnsNames! :  string[];
  @Input('rptData') rptData! :                  any;



  constructor(
    public _dialog:                MatDialog,
    private _jspdf:                JspdfService

    ) { }

  stampa() {
    // console.log ("toolbar.component : this.rptTitle", this.rptTitle);
    // console.log ("toolbar.component : this.rptFieldsToKeep", this.rptFieldsToKeep);
    // console.log ("toolbar.component : this.rptColumnsNames", this.rptColumnsNames);
    // console.log ("toolbar.component : this.rptData", this.rptData);
    //i columnsNames sono uno strano array con un array dentro... così vuole jspdf
    this.rptColumnsNameArr = [this.rptColumnsNames]; 
    this._jspdf.creaPdf(this.rptData, this.rptColumnsNameArr, this.rptFieldsToKeep, this.rptTitle);    
  }

  scarica() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "CURIOSO!", sottoTitolo: "Abbi pazienza!"}
    });
  }

  email() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "MOEGHEA!", sottoTitolo: "insomma!"}
    });
  }

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
}
