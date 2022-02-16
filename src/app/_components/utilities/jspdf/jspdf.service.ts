import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

import '../../../../assets/fonts/TitilliumWeb-Regular-normal.js';
import autoTable from 'jspdf-autotable';


@Injectable({
  providedIn: 'root'
})
export class JspdfService {

  constructor() { }

  creaPdf(toPrint :any, columnsNames: any, fieldsToKeep: any, title: string) {

    const doc = new jsPDF('l', 'mm', [297, 210]);
    //console.log(doc.getFontList());
    doc.setFont('TitilliumWeb-Regular', 'normal');
    var width = doc.internal.pageSize.getWidth()
    doc.text(title, width/2, 15, { align: 'center' });
    
    //costruisco la data per il footer (vedi options di autoTable è oltre)
    var today = new Date();
    var monthpadded = String(today.getMonth()+1).padStart(2, '0');
    var nDate = today.getDate() + '/' + monthpadded + '/' + today.getFullYear();

//#region PREPARAZIONE DEI DATI ***************************************************************************
    //tolgo dall'array tutti i campi che non servono
    //faccio una copia del matDataSource
    let tmpObjArr : any = toPrint;
    //creo una mappa delle sue proprietà
    let allProperties = this.propertiesToArray(toPrint[0]);

    //creo l'array che butterò fuori
    let arrResult : any= [];

    //con l'aiuto della funzione flatten schiaccio gli oggetti e li metto in arrResult
    tmpObjArr.forEach ((element: any) =>
      //console.log(this.flattenObj(element) ),
      arrResult.push(this.flattenObj(element))
    )  
    console.log (arrResult);
    
    //per ogni proprietà nella mappa vado a vedere se sono incluse nell'array di quelle da tenere
    allProperties.forEach((proprieta: string) =>{
        //se la proprietà non è inclusa....
        if (!fieldsToKeep.includes(proprieta)) {
          //vado a toglierla da ArrResult
          arrResult.forEach ( (record: any) => {
            delete record[proprieta];}
          )
        }
      }
    )
//#endregion FINE PREPARAZONE DEI DATI ********************************************************************


  //tutto questo casino lo ha aggiunto lui perchè c'è un problemino di tipo
  //sarebbe stato: let array = json.map(obj => Object.values(obj)); 
  //che serve a trasformare un array di objects in un array di array
  //infatti autotable richiede che il body sia un array di array
  let array = arrResult.map((obj: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(obj)); 
  //console.log("outputData", array);

//#region PASSAGGIO A AUTOTABLE DEI DATI PREPARATI ********************************************************
    autoTable(doc, {
      startY: 20,
      head: columnsNames,
      body: array,
      styles: {font: "TitilliumWeb-Regular"},
      willDrawCell: (HookData) => {  
        // if (HookData.section === 'head') { doc.setTextColor(255, 0, 0);} //colora le celle dell'head di rosso
        let cellContent = HookData.cell.raw+"";
        let last9 = cellContent.slice(-9);
        if (last9 == 'T00:00:00') { //in questo modo OSCENO identifico se si tratta di una data
          //console.log ("Hookdata.cell", HookData.cell);
          HookData.cell.text[0] = cellContent.slice(0,10); //non so perchè ma HookData.cell.text è un array!
        }
      },
      showHead: "everyPage",
      didDrawPage: function (data) {

        // Header
        doc.setFontSize(20);
        doc.setTextColor(40);
        //doc.text(title, data.settings.margin.left, 10);
        

        // Footer
        var str = "Page " + data.pageNumber + "/" + data.pageCount;

        doc.setFontSize(9);

        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        var pageSize = doc.internal.pageSize;
        
        var pageWidth = pageSize.width
        ? pageSize.width
        : pageSize.getWidth();

        var pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
        doc.text(title, pageWidth - data.settings.margin.right, pageHeight - 10, { align: 'right' });
        doc.text(nDate, width/2, 200, { align: 'center' });
      }

    })
//#endregion FINE AUTOTABLE ***************************************************************




    // doc.text("jspdf funziona + o - come fpdf che io uso, ma ha moltissimi metodi suoi", 10, 10);
    // doc.text("In questo punto scrivo quello che mi pare", 100, 100);
    // doc.text("E anche in questo punto qui", 60, 110);
    // doc.setTextColor(255,0,0);
    // doc.text("E Scrivo anche in rosso", 60, 120);
    // doc.setTextColor(0,255,0);
    // doc.text("E in verde", 60, 130);
    // doc.setFontSize(10);
    // doc.setTextColor(0,0,0);
    // doc.text("ora diminuisco il font", 60, 135);
    // doc.setFontSize(20);
    // doc.text("ora lo aumento", 120, 135);
    // doc.setFontSize(10);
    // doc.setTextColor(0,0,255);
    // doc.setDrawColor(255,0,0);
    // doc.cell(10, 140, 50, 20, "e qui scrivo in una cella quanto testo voglio e lui va a capo", 0, "left");
    // doc.cell(60, 140, 50, 20, "e qui scrivo in una cella adiacente", 0, "left");
    // doc.setTextColor(255,0,0);
    // doc.setDrawColor(0,0,255);

    // doc.setFillColor(0,0,200);
    // doc.cell(110, 140, 70, 20, "alla fine è solo questione di dedicarci del tempo...ma si può fare quasi tutto quello che si vuole", 0, "left");

    const d = new Date();
    doc.save(d.toISOString().split('T')[0]+"_Export.pdf");
    
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
  
  
  
    flatDeep(arr: any, d = 1) {
      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
      //questa funzione schiaccia un array (non un object, attenzione)
      return d > 0 ? arr.reduce((acc: any, val: any) => acc.concat(Array.isArray(val) ? this.flatDeep(val, d - 1) : val), [])
                   : arr.slice();
    };
  
  
    deletePropertyPath (obj: any, path: any) {
      //https://stackoverflow.com/questions/40712249/deleting-nested-property-in-javascript-object
      //questa funzione cancella una nested property passandogli il percorso da eliminare in forma: alunno.nome
      if (!obj || !path) {
        return;
      }
      if (typeof path === 'string') {
        path = path.split('.');
      }
      for (var i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
        if (typeof obj === 'undefined') {
          return;
        }
      }
      delete obj[path.pop()];
    };
  
  
  
    propertiesToArray(obj: any) {
      //var keyNames = Object.keys(Object); //estrae solo i nomi delle prorietà di primo livello
      //questa routine estrae invece tutte le proprietà e sottoproprietà di un oggetto nella forma alunno.nome
      const isObject = (val: any) =>
        val && typeof val === 'object' && !Array.isArray(val);
    
      const addDelimiter = (a: any, b: any) =>
        a ? `${a}.${b}` : b;
    
      const paths: any = (obj = {}, head = '') => {
        return Object.entries(obj)
          .reduce((product, [key, value]) => 
            {
              let fullPath = addDelimiter(head, key)
              return isObject(value) ?
                product.concat(paths(value, fullPath))
              : product.concat(fullPath)
            }, []);
      }
      return paths(obj);
    }



}
