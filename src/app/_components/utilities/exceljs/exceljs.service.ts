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
    
    //Excel Title, Header, Data
    //const title = rptTitle;
    //const header = rptFieldsToKeep;
    console.log (toPrint);

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

    
    //Create workbook and worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Report');
    worksheet.headerFooter.oddFooter = "Pag. &P di &N";

    //Add Row and formatting
    let titleRow = worksheet.addRow([rptTitle]);
    titleRow.font = { name: 'Titillium-Web', family: 4, size: 16, underline: 'double', bold: true }
    worksheet.addRow([]);
    let subTitleRow = worksheet.addRow(['Date : ' + this.datePipe.transform(new Date(), 'medium')])
    //Add Image
    // let logo = workbook.addImage({
    //   base64: logoFile.logoBase64,
    //   extension: 'png',
    // });
    //worksheet.addImage(logo, 'E1:F3');

    //worksheet.mergeCells('A1:D2');
    
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
    // worksheet.addRows(data);
    // Add Data and Conditional Formatting
    data.forEach((d: any) => {
      let row = worksheet.addRow(d);
      let qty = row.getCell(5);

      let color = 'FF99FF99';
      // if (qty.value < 500) {
      //   color = 'FF9999'
      // }
      qty.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
      }
    }
    );
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.addRow([]);
    //Footer Row
    // let footerRow = worksheet.addRow(['This is system generated excel sheet.']);
    // footerRow.getCell(1).fill = {
    //   type: 'pattern',
    //   pattern: 'solid',
    //   fgColor: { argb: 'FFCCFFE5' }
    // };
    // footerRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    //Merge Cells
    // worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);




    // worksheet.columns.forEach(function(column){
    //   var dataMax = 0;
    //   column.eachCell!({ includeEmpty: true }, function(cell){
    //     var columnLength = cell.value?.toString().length || 0;	//si ferma qui
    //     if (columnLength > dataMax) {
    //       dataMax = columnLength;
    //      }
    //        })
    //        column.width = dataMax < 5 ? 5 : dataMax;
    // });

    // let dataMax: number[];
    // let max: number;
    // columns.forEach((column: Column) => {
    //     dataMax = [];
    //     column.eachCell({includeEmpty: false}, (cell: Cell) => {
    //         dataMax.push(cell.value?.toString().length || 0);
    //     });
    //     max = Math.max(...dataMax);
    //     column.width = max < 10 ? 10 : max;
    // });


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