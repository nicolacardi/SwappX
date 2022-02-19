import { Component, ComponentRef, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

//components
import { DialogOkComponent } from '../utilities/dialog-ok/dialog-ok.component';
import { SceltaColonneComponent } from './scelta-colonne/scelta-colonne.component';
import { JspdfService } from '../utilities/jspdf/jspdf.service';
import { _UT_GridLayout, _UT_GridLayoutColumn } from 'src/app/_models/_UT_GridLayout';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html'
})

export class ToolbarComponent {
  rptColumnsNameArr !:                          [string[]]; //uno strano array di array di stringhe richiesto da jspdf

  @Input('rptTitle') rptTitle! :                string;
  @Input('rptFileName') rptFileName! :          string;
  @Input('rptFieldsToKeep') rptFieldsToKeep! :  string[];
  @Input('rptColumnsNames') rptColumnsNames! :  string[];
  @Input('rptData') rptData! :                  any;

//columnsComponent serve per la scelta colonne: è di tipo any perchè potrebbe essere QUALSIASI ListComponent (AlunniList, GenitoriList ecc.)
  @Input('columnsComponent') columnsComponent! : any;     


  constructor(
    public _dialog:                MatDialog,
    private _jspdf:                JspdfService

    ) { }

  PDF() {
    // console.log ("toolbar.component : this.rptTitle", this.rptTitle);
    // console.log ("toolbar.component : this.rptFieldsToKeep", this.rptFieldsToKeep);
    // console.log ("toolbar.component : this.rptColumnsNames", this.rptColumnsNames);
    // console.log ("toolbar.component : this.rptData", this.rptData);
    //i columnsNames sono uno strano array con un array dentro... così vuole jspdf
    this.rptColumnsNameArr = [this.rptColumnsNames]; 
    this._jspdf.creaPdf(this.rptData, this.rptColumnsNameArr, this.rptFieldsToKeep, this.rptTitle, this.rptFileName);    
  }

  XLS() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "CURIOSO!", sottoTitolo: "Abbi pazienza che facciamo anche questo!"}
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
      //data: component.displayedColumns
      data:this.buildLayout()
    };
    const dialogRef = this._dialog.open(SceltaColonneComponent, dialogConfig);
  }

  private buildLayout(): _UT_GridLayout {

    let obj: _UT_GridLayout= { 
        id:0,
        userID:"",
        gridName: "alunniList",   //questa andrà collegata a una variabile in Input
        context: "",
        columns:this.loadColumns()
    };
    return obj;
  }

  private loadColumns(): _UT_GridLayoutColumn[]  {

    let lst: _UT_GridLayoutColumn[]= [];
    let obj: _UT_GridLayoutColumn ={columnName:"", isVisible:true, disabled:false} ;

    this.columnsComponent.displayedColumns.forEach((element:any) => {
      if(element.startsWith("action")) 
        obj ={columnName: element, isVisible:true, disabled: true};
      else
        obj ={columnName: element, isVisible:true, disabled: false};

      lst.push(obj);
    });

    return lst;
  }
}
