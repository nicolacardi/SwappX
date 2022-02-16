import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

//components
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { AlunniListComponent } from '../alunni-list/alunni-list.component';
import { SceltaColonneComponent } from '../../toolbar/scelta-colonne/scelta-colonne.component';
import { _UT_GridLayout, _UT_GridLayoutColumn } from 'src/app/_models/_UT_GridLayout';
import { JspdfService } from '../../utilities/jspdf/jspdf.service';

@Component({
  selector: 'app-alunni-toolbar',
  templateUrl: './alunni-toolbar.component.html'
})

export class AlunniToolbarComponent {

  @Input() alunniListComponent!:   AlunniListComponent;
  
  constructor(
    public _dialog:                MatDialog,
    private _jspdf:                JspdfService
    ) { 

  }

  scegliColonne(component: AlunniListComponent) {

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
        gridName: "alunniList",
        context: "",
        columns:this.loadColumns()
    };
    return obj;
  }

  private loadColumns(): _UT_GridLayoutColumn[]  {

    let lst: _UT_GridLayoutColumn[]= [];
    let obj: _UT_GridLayoutColumn ={columnName:"", isVisible:true, disabled:false} ;

    this.alunniListComponent.displayedColumns.forEach(element => {
      if(element.startsWith("action")) 
        obj ={columnName: element, isVisible:true, disabled: true};
      else
        obj ={columnName: element, isVisible:true, disabled: false};

      lst.push(obj);
    });

    return lst;
  }


  
//____________________________ TODO  _________________________
  stampa() {
    let title = "Elenco Alunni";
    //elenco i campi da tenere
    let fieldsToKeep = ['nome', 'cognome', 'dtNascita', 'indirizzo', 'comune', 'cap', 'prov', 'email', 'telefono'];
    //elenco i nomi delle colonne
    let columnsNames = [['nome', 'cognome', 'nato il', 'indirizzo', 'comune', 'cap', 'prov', 'email', 'telefono']];
    this._jspdf.creaPdf(this.alunniListComponent.matDataSource.data, columnsNames, fieldsToKeep, title);    
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

 

}
