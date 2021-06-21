import { Injectable } from '@angular/core';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'

@Injectable({
  providedIn: 'root'
})
export class JspdfService {

  constructor() { }

  creaPdf(toPrint :any, tableHeaders: any) {
    console.log("toPrint", toPrint);
    //var outputData = toPrint.map( Object.values );


    // var outputData = [];
    // for (var i in toPrint) {
    //     // i is the property name
    //     outputData.push(toPrint[i]);
    // }

//tutto questo casino lo ha aggiunto lui perchè c'è un problemino di tipo
//sarebbe stato: let array = json.map(obj => Object.values(obj)); 
//che serve a trasformare un array di objects in un array di array
//infatti autotable richiede che il body sia un array di array

    let array = toPrint.map((obj: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(obj)); 
    console.log("outputData", array);

    const doc = new jsPDF();

    autoTable(doc, {
      head: tableHeaders,
      body: array,
    })


    //doc.text(toPrint, 10, 10);
    doc.save("table.pdf");
  }
}
