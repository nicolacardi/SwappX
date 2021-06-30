import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class JspdfService {

  constructor() { }

  creaPdf(toPrint :any, tableHeaders: any) {

//tutto questo casino lo ha aggiunto lui perchè c'è un problemino di tipo
//sarebbe stato: let array = json.map(obj => Object.values(obj)); 
//che serve a trasformare un array di objects in un array di array
//infatti autotable richiede che il body sia un array di array

    let array = toPrint.map((obj: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(obj)); 
    console.log("outputData", array);

    const doc = new jsPDF();

    doc.text("jspdf funziona + o - come fpdf che io uso, ma ha moltissimi metodi suoi", 10, 10);

    autoTable(doc, {
      startY: 20,
      head: tableHeaders,
      body: array,
    })


    doc.text("In questo punto scrivo quello che mi pare", 100, 100);
    doc.text("E anche in questo punto qui", 60, 110);
    doc.setTextColor(255,0,0);
    doc.text("E Scrivo anche in rosso", 60, 120);
    doc.setTextColor(0,255,0);
    doc.text("E in verde", 60, 130);
    doc.setFontSize(10);
    doc.setTextColor(0,0,0);
    doc.text("ora diminuisco il font", 60, 135);
    doc.setFontSize(20);
    doc.text("ora lo aumento", 120, 135);
    doc.setFontSize(10);
    doc.setTextColor(0,0,255);
    doc.setDrawColor(255,0,0);
    doc.cell(10, 140, 50, 20, "e qui scrivo in una cella quanto testo voglio e lui va a capo", 0, "left");
    doc.cell(60, 140, 50, 20, "e qui scrivo in una cella adiacente", 0, "left");
    doc.setTextColor(255,0,0);
    doc.setDrawColor(0,0,255);

    doc.setFillColor(0,0,200);
    doc.cell(110, 140, 70, 20, "alla fine è solo questione di dedicarci del tempo...ma si può fare quasi tutto quello che si vuole", 0, "left");

    doc.save("table.pdf");
    
  }
}
