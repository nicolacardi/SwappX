import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
//import * as logoFile from './carlogo.js';
import { DatePipe } from '@angular/common';
import { Cell } from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  constructor(private datePipe: DatePipe) {
  }
  generateExcel(toPrint :any, fieldsToKeep: string[], rptTitle: string, fileName: string) {
    

//#region PREPARAZIONE DEI DATI ***************************************************************************
    //creo l'array per l'operazione di flattening
    let flattened : any= [];

    //con la funzione flattenObj schiaccio gli oggetti e li metto in flattened: i campi saranno del tipo alunno.nome
    toPrint.forEach ((element: any) =>{
      flattened.push(this.flattenObj(element))}
    )

    //quanto segue prende l'array flattened e NE ESTRAE solo i campi che si trovano descritti in fieldsToKeep (quindi dinamicamente)
    let subsetFromFlattened = flattened.map((item: any) => {
      const returnValue : any = {}
      fieldsToKeep.forEach((key: string) => {
        returnValue[key] = item[key]
      })
      return returnValue;
    })

    //Ora trasformo un array di objects in un array di arrays
    let data = subsetFromFlattened.map((obj: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(obj)); 
//#endregion FINE PREPARAZONE DEI DATI ********************************************************************
    
    //Create workbook and worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Report');

    worksheet.headerFooter.oddFooter = "Pag. &P di &N";

    //Add Row and formatting
    let titleRow = worksheet.addRow([rptTitle]);
    titleRow.font = { name: 'Helvetica', family: 4, size: 16, underline: 'double', bold: true }
    worksheet.addRow([]);
    worksheet.addRow(['Date : ' + this.datePipe.transform(new Date(), 'medium')])
    
    //Blank Row 
    worksheet.addRow([]);
    //Add Header Row
    let headerRow = worksheet.addRow(fieldsToKeep);
    
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2273a3' }, //colore dello sfondo (fgColor??)
        bgColor: { argb: 'FFFFFFFF' } //una cella ha sia un fgcolor che un bgcolor entrambi di riempimento a quanto pare
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    
    //costruisco un array di widths che contiene tanti elementi quanti data[0].length.
    let widthsArr = [0]; //parto da un array che in prima posizione ha uno 0...
    console.log ("data[0]", data[0]);
    fieldsToKeep.forEach(element => 
      widthsArr.push(element.length)//per ogni elemento del primo elemento di data aggiungo uno 0.
    )

    data.forEach((d: any) => {

      d.forEach((element: any, index: number) =>{
        let lenText = element ? element.length : 0;
        if (lenText > widthsArr[index + 1 ])  widthsArr[index + 1] = lenText; 
      })

      let row = worksheet.addRow(d); //scrivo i dati
      // let qty = row.getCell(5);
      // let color = 'FF99FF99';
      //       // if (qty.value < 500) {
      //       //   color = 'FF9999'
      //       // }
      // qty.fill = {
      //   type: 'pattern',
      //   pattern: 'solid',
      //   fgColor: { argb: color }
      // }
      
    });

    //widthsArr contiene la lunghezza dei testi della tabella
    for (let i = 1; i < widthsArr.length; i++) {
      //in excel la larghezza impotata in pixels NON E' PROPORZIONALE a quella in punti!
      //la relazione è wpunti = wpixels/6  -5/6 (infatti la lunghezza in pixel nonè mai minore di 5)
      //se uso ncaratteri per impostare la larghezza, questa sarà più stretta per numeri bassi e più alta per numeri alti...non va bene
      //infatti lui moltiplica i caratteri per 6 e ottiene la misura in pixels, ma questa si traduce poi in lunghezze non proporzionali
      //voglio invece impostare la larghezza in maniera proporzionale al numero di caratteri
      worksheet.getColumn(i).width = (widthsArr[i]*6+5)/6;
    }

    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const d = new Date();
      fs.saveAs(blob, d.toISOString().split('T')[0]+"_"+fileName);
    })
  }

  flattenObj (arrToFlatten: any){
    //questa funzione serve per schiacciare un Object
    //e restituire campi del tipo alunno.nome, alunno.cognome invece di alunno {nome:..., cognome:...}
      let result : any = {};
      for (const i in arrToFlatten) {
          //se trova un oggetto allora chiama se stessa ricorsivamente
          if ((typeof arrToFlatten[i]) === 'object' && !Array.isArray(arrToFlatten[i])) {
              const temp = this.flattenObj(arrToFlatten[i]);
              for (const j in temp) {
                  //costruisce la stringa ricorsivamente
                  result[i + '.' + j] = temp[j];
              }
          }
          // altrimenti non gli fa nulla
          else {
              result[i] = arrToFlatten[i];
          }
      }
      return result;
    };
  
}