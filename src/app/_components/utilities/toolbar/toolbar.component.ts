//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';

//components
import { DialogOkComponent }                    from '../dialog-ok/dialog-ok.component';
import { SceltaColonneComponent }               from './scelta-colonne/scelta-colonne.component';

//services
import { ExcelService }                         from '../exceljs/exceljs.service';
import { JspdfService }                         from '../jspdf/jspdf.service';
import { TableColumnsService }                  from './tablecolumns.service';
import { UserService }                          from 'src/app/_user/user.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { _UT_TableColVisible } from 'src/app/_models/_UT_TableColVisible';

//#endregion
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html'
})

export class ToolbarComponent implements OnInit{
//#region ----- Variabili --------------------

  rptColumnsNameArr !:                          [string[]]; //uno strano array di array di stringhe richiesto da jspdf
  public currUser!:                             User;
  columnsToDisplay!:                            _UT_TableColVisible[];
//#endregion
//#region ----- ViewChild Input Output ---------

  @Input('tableName') tableName! :              string;
  @Input('rptTitle') rptTitle! :                string;
  @Input('rptFileName') rptFileName! :          string;
  @Input('rptFieldsToKeep') rptFieldsToKeep! :  string[];
  @Input('rptColumnsNames') rptColumnsNames! :  string[];
  @Input('rptData') rptData! :                  any;

  @Output('refreshColumns') refreshColumns = new EventEmitter<number>(); //annoId viene EMESSO quando si seleziona un anno dalla select


//columnsComponent serve per la scelta colonne: è di tipo any perchè potrebbe essere QUALSIASI ListComponent (AlunniList, GenitoriList ecc.)
  @Input('columnsComponent') columnsComponent! : any;     

//#endregion

  constructor(
    public _dialog:                             MatDialog,
    private _jspdf:                             JspdfService,
    private _xlsx:                              ExcelService,
    private svcTableColumns:                    TableColumnsService,
    private svcUser:                            UserService,

    ) { }

  ngOnInit () {
    this.svcUser.obscurrentUser.subscribe(val => {
      this.currUser = val;
    })

    this.svcTableColumns.listByUserIDAndTable(this.currUser.userID, this.tableName).subscribe(
      colonne => {
        console.log ("colonne", colonne);
        this.columnsToDisplay = colonne
      }
    );

  }
  
  PDF() {
    // console.log ("toolbar.component : this.rptTitle", this.rptTitle);
    // console.log ("toolbar.component : this.rptFieldsToKeep", this.rptFieldsToKeep);
    // console.log ("toolbar.component : this.rptColumnsNames", this.rptColumnsNames);
    // console.log ("toolbar.component : this.rptData", this.rptData);
    //i columnsNames sono uno strano array con un array dentro... così vuole jspdf
    this.rptColumnsNameArr = [this.rptColumnsNames]; 
    this._jspdf.downloadPdf(this.rptData, this.rptColumnsNameArr, this.rptFieldsToKeep, this.rptTitle, this.rptFileName);    
  }

  XLS() {
    //NB: a differenza di PDF, XLS usa rptColumnsNames e non rptColumnsNamesArr
    this._xlsx.generateExcel(this.rptData, this.rptColumnsNames, this.rptFieldsToKeep, this.rptTitle, this.rptFileName );
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
      height: '580px',
      //data: component.displayedColumns
      data:this.columnsToDisplay
    };
    const dialogRef = this._dialog.open(SceltaColonneComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      cols => {

        console.log("devo fare la reload di listAlunni"); 
        this.refreshColumns.emit();
      }
  );
  }


  // private buildLayout(): _UT_TableLayout {

  //   let obj: _UT_TableLayout= { 
  //       id:0,
  //       tableName: this.tableName,
  //       context: "",
  //       columns:this.loadColumns()
  //   };
  //   return obj;
  // }

  // private loadColumns(): _UT_TableLayoutColumn[]  {

  //   let lst: _UT_TableLayoutColumn[]= [];
  //   let obj: _UT_TableLayoutColumn ={columnName:"", userID: "", isVisible:true, disabled:false} ;

  //   //va a pescarsi da solo le colonne del componente (columnsComponent)del quale si stanno lavorando le colonne
  //   //in teoria dovrebbe pescarle dalla tabella nella quale sono scritte

  //   this.columnsComponent.displayedColumns.forEach((element:any) => {
  //     if(element.startsWith("action")) 
  //       obj ={columnName: element, userID: "", isVisible:true, disabled: true};
  //     else
  //       obj ={columnName: element, userID: "", isVisible:true, disabled: false};

  //     lst.push(obj);
  //   });

  //   return lst;
  // }
}
