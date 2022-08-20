import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HttpClient } from '@angular/common/http';

import '../../../../assets/fonts/TitilliumWeb-Regular-normal.js';
import '../../../../assets/fonts/TitilliumWeb-SemiBold-normal.js';

import { DOC_Pagella } from 'src/app/_models/DOC_Pagella.js';
import { DOC_PagellaVoto } from 'src/app/_models/DOC_PagellaVoto.js';

import { RptLineTemplate1 } from 'src/app/_reports/rptPagella';


@Injectable({
  providedIn: 'root'
})

export class JspdfService {

  defaultColor!:  string;
  defaultFontSize!:  number;
  defaultFontName!: string;
  defaultMaxWidth!: number;
  defaultCellLineColor!: string;
  defaultLineColor!:  string;
  defaultFillColor!:  string;
  defaultLineWidth!:  number;

  rptPagella!: DOC_Pagella ;
  rptPagellaVoti!: DOC_PagellaVoto[];

  constructor(private http: HttpClient) {}

  //costruisce il report
  public creaPdf (rptData :any, rptColumnsNameArr: any, rptFieldsToKeep: any, rptTitle: string): jsPDF  {
    let doc = this.buildReportPdf (rptData, rptColumnsNameArr, rptFieldsToKeep, rptTitle);
    return doc;
  }

  //costruisce il report e lancia il salvataggio
  public downloadPdf (rptData :any, rptColumnsNameArr: any, rptFieldsToKeep: any, rptTitle: string, rptFileName: string)  {
    let doc = this.buildReportPdf (rptData, rptColumnsNameArr, rptFieldsToKeep, rptTitle);
    this.salvaPdf(doc,rptFileName);
  }

  //salva il report
  public salvaPdf (doc :jsPDF ,  fileName: string, addDateToName: boolean = true ) {
    if(addDateToName){
      const d = new Date();
      fileName = d.toISOString().split('T')[0]+"_"+ fileName+".pdf";
    }
    doc.save(fileName);
  }
  
  public async dynamicRptPagella(objPagella: DOC_Pagella, lstPagellaVoti: DOC_PagellaVoto[]) : Promise<jsPDF> {

    this.rptPagella = objPagella;
    this.rptPagellaVoti = lstPagellaVoti;

    console.log("rptPagellaVoti : ", this.rptPagellaVoti)
    
    //Il primo elemento di RptLineTemplate1 DEVE essere SheetSize
    
    //[### AS ### todo!] trap errore

    let pageW: number = 0;
    let pageH: number = 0;
    
    let element = RptLineTemplate1[0]

    if(element.tipo != "SheetDefault"){
      let doc : jsPDF  = new jsPDF('l', 'mm', [100 , 100]);  
      doc.text("ERRORE: manca il tag [SheetDefault] in rptPagella",10, 50);
      return doc;
    }

    pageW= parseInt(element.width);
    pageH= parseInt(element.heigth);

    this.defaultColor = element.defaultColor;
    this.defaultFontSize = element.defaultFontSize;
    this.defaultFontName = element.defaultFontName;
    this.defaultMaxWidth = element.defaultMaxWidth;
    this.defaultFillColor = element.defaultFillColor;
    this.defaultLineColor = element.defaultLineColor;
    this.defaultCellLineColor = element.defaultCellLineColor;
    this.defaultLineWidth = element.defaultLineWidth;
  
    let doc : jsPDF  = new jsPDF('l', 'mm', [pageW , pageH]);   //A3
    doc.setFont('TitilliumWeb-Regular', 'normal');
    //a questo punto ho impostato il documento

    //############### lettura file/rpt source e loop sui tags
    
    //LA PROMISE.ALL NON SI COMPORTA COME SE CHIAMASSE TUTTE LE FUNZIONI IN MANIERA SINCRONA
    //MA SEMPLICEMENTE NON FA PROCEDERE IL CODICE OLTRE PRIMA CHE TUTTE LE SUE PROMISE (AWAITED) SIANO TERMINATE
    //MA QUESTE RESTANO SINGOLARMENTE ASINCRONE, QUINDI FINISCO IN ORDINE "SPARSO"
    //IL CICLO FOR, INVECE, INSIEME CON IL COMANDO AWAIT FUNZIONA IN MANIERA SINCRONA
    
    //await Promise.all( RptLineTemplate1.map(async (element: any) => { QUESTA LA PROMISE.ALL FALLACE     
    
    for (let i = 1; i < RptLineTemplate1.length; i++) {
      let element = RptLineTemplate1[i];
      switch(element.tipo){
        case "SheetDefault":
          break;
        case "Image":{
          const ImageUrl = "../../assets/photos/" + element.value;
          await this.addImage(doc,ImageUrl, element.X ,element.Y, element.W);
          break;
        }
        case "Text":{
          this.addText(doc,this.parseTextValue( element.value),element.X,element.Y,element.fontName,"normal",element.color,element.fontSize, element.align, element.maxWidth );
          break;
        }
        case "Table":{
          this.addTable(doc, element.head, element.headEmptyRow, element.body, element.cellLineWidths, element.colWidths,element.X,element.Y,element.W, element.H, element.fontName,"normal",element.color,20, element.lineColor, element.cellLineColor, element.cellFills, element.fillColor, element.lineWidth, element.line, element.align, element.colSpans, element.rowSpans);
          break;
        }
        case "TableD":{
          this.addTableDinamica(doc, element.head, element.headEmptyRow, element.body, element.cellLineWidths, element.colWidths,element.X,element.Y,element.W, element.H, element.fontName,"normal",element.color,20, element.lineColor, element.cellLineColor, element.cellFills, element.fillColor, element.lineWidth, element.line, element.align, element.colSpans, element.rowSpans);
          break;
        }
        case "Line":{
          this.addLine(doc,element.X1,element.Y1,element.X2,element.Y2, element.color, element.thickness);
          break;
        }
        case "Rect":{
          this.addRect(doc,element.X,element.Y,element.W,element.H, element.color, element.thickness, element.borderRadius);
          break;
        }
        case "Page":{
          doc.addPage()
          break;
        }
        default:{
          this.addText(doc,"[## WRONG TAG ##]",element.X,element.Y,"TitilliumWeb-SemiBold","normal",'#FF0000',24, element.align, element.maxWidth );
          break;
        }
      }
    }
    return doc;
  }


//#region ADDTEXT ADDTABLE ADDIMAGE ADDLINE ADDRECT ###################################################################################

  private async addText(docPDF: jsPDF, text: string, X: number, Y: number, fontName: string, fontStyle: string , fontColor:string, fontSize: number, align: any, maxWidth: number  ){
    if(fontName == null || fontName == "") fontName = this.defaultFontName;
    if(fontColor == null || fontColor == "") fontColor = this.defaultColor;
    if(fontSize == null || fontSize == 0) fontSize = this.defaultFontSize;
    if(maxWidth == null || maxWidth == 0) maxWidth = this.defaultMaxWidth;

    docPDF.setFont(fontName, fontStyle);
    docPDF.setTextColor(fontColor);
    docPDF.setFontSize(fontSize);
    //var splitTitle = docPDF.splitTextToSize(text, 190); //in questo modo NON esco dalla pagina!!! va a capo quando deve!!! splitTitle è un array passabile a .text
    docPDF.text(text, X, Y, { align: align, maxWidth: maxWidth}); //altro metodo: maxWidth SPEZZA in n righe. Esiste anche lineHeightFactor che definisce l'altezza della riga.
    //docPDF.text(text, X, Y, { align: align });

    //Restituisce l'altezza del testo
    //docPDF.getTextDimensions(text);
    //var dim = docPDF.getTextDimensions(text);
    //console.log("dimensioni testo: ", dim);

  }

  private async addTable(docPDF: jsPDF, head:any, headEmptyRow: number, body: any, cellLineWidths: any, colWidths: any, X: number, Y: number, W: number, H: number, fontName: string, fontStyle: string , fontColor:string, fontSize: number, lineColor: string, cellLineColor: string, cellFills: any, fillColor: string, lineWidth: number, line: number, align: any, colSpans: any, rowSpans: any  ){
    
    if(fontName == null || fontName == "")    fontName = this.defaultFontName;
    if(fontColor == null || fontColor == "")  fontColor = this.defaultColor;
    if(fontSize == null || fontSize == 0)     fontSize = this.defaultFontSize;
    if(lineColor == null || lineColor == "")  lineColor = this.defaultLineColor;
    if(cellLineColor == null || cellLineColor == "")  cellLineColor = this.defaultCellLineColor;
    if(fillColor == null || fillColor == "")  fillColor = this.defaultFillColor;
    if(lineWidth == null || lineWidth == 0)   lineWidth = this.defaultLineWidth;

    // console.log ("lineColor", lineColor);
    // console.log ("fillColor", fillColor);
    // console.log ("cellLineColor", cellLineColor);
    //docPDF.setFont(fontName, fontStyle); //non sembra funzionare

    docPDF.setTextColor(fontColor);
    docPDF.setDrawColor(lineColor);
    docPDF.setFontSize(fontSize);

    let columnStylesObj= <any>{};
    W = 0;
    for (let i = 0; i < colWidths.length; i++) {
      columnStylesObj[i] = {}
      columnStylesObj[i]["cellWidth"] = colWidths[i];
      W = W + colWidths[i];
    }

    let headObj: { content: any, styles:any  }[][] = [];
    let bodyObj: { content: any, colSpan: any, rowSpan: any, styles:any  }[][] = []; ///in questo modo suggerisce https://stackoverflow.com/questions/73258283/populate-an-array-of-array-of-objects    //let dataObj= <any>[[{}]]; //così pensavo io...ma non funzionava
    let cellLineWidth : number; 
    let cellFill: any;
    let colSpan: any;
    let rowSpan: any;
    let i: number; //serve definirlo fuori dal ciclo for perchè poi serve tenere l'ultimo valore

    for (i = 0; i < head.length; i++) {
      headObj.push([]);  //va prima inserito un array vuoto altrimenti risponde con un Uncaught in promise
      for (let j = 0; j < head[i].length; j++) {        
        // //estraggo lo spessore del bordo cella
        headObj[i].push({ content: head[i][j], styles: {font: fontName, lineColor: cellLineColor} })
      }
    }

    //aggiunta riga vuota dopo l'header
    if (headEmptyRow ==1) {
      headObj.push([]);
      for (let j = 0; j < head[0].length; j++) {
        headObj[i].push({ content: "", styles: {lineWidth: 0, fillColor: false, minCellHeight: 1, cellPadding: 0} })        
      }
    }

    for (let i = 0; i < body.length; i++) {
      bodyObj.push([]);  //va prima inserito un array vuoto altrimenti risponde con un Uncaught in promise
      for (let j = 0; j < body[i].length; j++) {

        //estraggo lo spessore del bordo cella
        if (cellLineWidths == undefined || cellLineWidths == null || cellLineWidths == [] || cellLineWidths[i][j] == null || cellLineWidths [i][j] == undefined) cellLineWidth = 0.1;
        else cellLineWidth = cellLineWidths[i][j];

        //estraggo il riempimento: NB nell'array di array sta solo scritto se riempire (1) o no (0). Il colore va preso dal colore di default
        if (cellFills == undefined || cellFills == null || cellFills == [] || cellFills[i][j] == null || cellFills[i][j] == undefined || cellFills[i][j] == 0) cellFill = null;
        else cellFill = this.defaultFillColor.substring(1);
        

        //estraggo se la cella va riempita del colore di default di riempimento
        // if (cellFills[i] != undefined) {                        //se la riga i-esima è stato passata
        //   if (cellFills [i][j] == null || cellFills[i][j] == 0)
        //       {cellFill = null;
        //       //console.log ("1")
        //       }                                //nel caso la riga ci sia ma vuota o con 0
        //   else 
        //       {cellFill = this.defaultFillColor.substring(1);
        //       //  console.log ("2")
        //       }  //se la riga c'è e non è vuota nè 0
        // } else {
        //   if (cellFills[0][j]!=0)                               //se la riga i-esima non è stata passata vado a vedere la prima
        //       {this.defaultFillColor.substring(1);
        //       //  console.log ("3")
        //       }
        //   else                                                  //se anche la prima è = 0...
        //       {cellFill = null;
        //       //  console.log ("4")
        //       }
        // } 
        

        //estraggo i colSpans
        if (colSpans == undefined || colSpans == null || colSpans == [] || colSpans[i][j] == null || colSpans [i][j] == undefined || colSpans[i][j] ==1) colSpan = 1;
        else colSpan = colSpans[i][j];

        //estraggo i rowSpans
        if (rowSpans == undefined || rowSpans == null || rowSpans == [] || rowSpans[i][j] == null || rowSpans [i][j] == undefined || rowSpans[i][j] ==1) rowSpan = 1;
        else rowSpan = rowSpans[i][j];
        
        bodyObj[i].push({ content: body[i][j], colSpan: colSpan, rowSpan: rowSpan, styles: {font: fontName, lineWidth: cellLineWidth, fillColor: cellFill, lineColor: cellLineColor} })
        
      }
    }


    //console.log ("bodyObj", bodyObj);
    autoTable(docPDF, {
      //startY: Y,
      margin: {top: Y, right: 0, bottom: 0, left: X},
      tableWidth: W,
      //tableLineColor: lineColor,
      //tableLineWidth: lineWidth,  //Attenzione: attivando questa cambia il bordo ESTERNO della tabella
      head: headObj, //Header eventualmente di più linee
      body: bodyObj,

      // **************** ALTRI MODI DI PASSARE I DATI *****************
      // body: [[
      //     { content: "ciao", styles: { halign: 'center', cellWidth: 10 }}, 
      //     { content: "ciao2", rowSpan: 2, styles: { halign: 'center', lineWidth: {top: 10, right: 1, bottom: 5, left: 2} , cellWidth: 200} },
      //     { content: "ciao2", rowSpan: 2, styles: { halign: 'center', lineWidth: 1 , cellWidth: 50} }], 
      //       [{ content: 'nuova riga', styles: { halign: 'center', cellWidth: 10 } }]],

      // body: [
      //   [
      //     {content: data[0][0]},
      //     {content: data[0][1]},
      //     {content: data[0][2]},
      //     {content: data[1][0]},
      //     {content: data[1][1]},
      //     {content: data[1][2]}
      //   ]
      // ],
      
      styles: {      
              //cellWidth: W/ data[0].length,
              halign: align,
              valign: 'middle',
              fillColor: fillColor,
              minCellHeight: H,
      },
      columnStyles: columnStylesObj,
      headStyles: {
        lineWidth: 0.1,
      },
      // didDrawCell: (data) => {
      //   if (data.section === 'head') {
      //     docPDF.text("ciao",10,10);
      //   }
      // },
      willDrawCell: (data) => {

        let cellContent = '';
        for (let i = 0; i < data.cell.text.length; i++) {
          cellContent = cellContent + data.cell.text[i];
        }

        if (data.section === 'body' && cellContent.substring(0,3)== "R90" ) {
          docPDF.setFontSize(16);
          docPDF.text(cellContent.substring(3), data.cell.x + data.cell.width /2 + 2 , data.cell.y + data.cell.height - 5, {angle:90});
          for (let k = 0; k < data.cell.text.length; k++) {
            data.cell.text[k] = '';
          }
         }
      } 
    })
  }



  private async addTableDinamica(docPDF: jsPDF, head:any, headEmptyRow: number, body: any, cellLineWidths: any, colWidths: any, X: number, Y: number, W: number, H: number, fontName: string, fontStyle: string , fontColor:string, fontSize: number, lineColor: string, cellLineColor: string, cellFills: any, fillColor: string, lineWidth: number, line: number, align: any, colSpans: any, rowSpans: any  ){
    
    if(fontName == null || fontName == "")    fontName = this.defaultFontName;
    if(fontColor == null || fontColor == "")  fontColor = this.defaultColor;
    if(fontSize == null || fontSize == 0)     fontSize = this.defaultFontSize;
    if(lineColor == null || lineColor == "")  lineColor = this.defaultLineColor;
    if(cellLineColor == null || cellLineColor == "")  cellLineColor = this.defaultCellLineColor;
    if(fillColor == null || fillColor == "")  fillColor = this.defaultFillColor;
    if(lineWidth == null || lineWidth == 0)   lineWidth = this.defaultLineWidth;


    docPDF.setTextColor(fontColor);
    docPDF.setDrawColor(lineColor);
    docPDF.setFontSize(fontSize);

    let columnStylesObj= <any>{};
    W = 0;
    for (let i = 0; i < colWidths.length; i++) {
      columnStylesObj[i] = {}
      columnStylesObj[i]["cellWidth"] = colWidths[i];
      W = W + colWidths[i];
    }

    let headObj: { content: any, styles:any  }[][] = [];
    //let bodyObjD: { content: any, colSpan: any, rowSpan: any, styles:any  }[][] = []; ///in questo modo suggerisce https://stackoverflow.com/questions/73258283/populate-an-array-of-array-of-objects    //let dataObj= <any>[[{}]]; //così pensavo io...ma non funzionava
    let bodyObjD: { content: any } [][] = []///in questo modo suggerisce https://stackoverflow.com/questions/73258283/populate-an-array-of-array-of-objects    //let dataObj= <any>[[{}]]; //così pensavo io...ma non funzionava

    let cellLineWidth : number; 
    let cellFill: any;
    let colSpan: any;
    let rowSpan: any;
    let i: number; //serve definirlo fuori dal ciclo for perchè poi serve tenere l'ultimo valore

    for (i = 0; i < head.length; i++) {
      headObj.push([]);  //va prima inserito un array vuoto altrimenti risponde con un Uncaught in promise
      for (let j = 0; j < head[i].length; j++) {        
        
        headObj[i].push({ content: head[i][j], styles: {font: fontName, lineColor: "#000000"} })
      }
    }

    // //aggiunta riga vuota dopo l'header
    // if (headEmptyRow ==1) {
    //   headObj.push([]);
    //   for (let j = 0; j < head[0].length; j++) {
    //     headObj[i].push({ content: "", styles: {lineWidth: 0, fillColor: false, minCellHeight: 1, cellPadding: 0} })        
    //   }
    // }

    //qui arriva un generico array di una riga da trasformare in un array di n record

    this.rptPagellaVoti.forEach ((Pagella:DOC_PagellaVoto) =>{
      bodyObjD.push([]);
      for (let j = 0; j < body[0].length; j++) {
        console.log ("eval body[0][j]", eval(body[0][j]));
        //bodyObjD.push({ content: eval(body[0][j]), colSpan: 1, rowSpan: 1, styles: {font: fontName, lineWidth: "0.1", fillColor: "#CCCCCC", lineColor: "000000"} });
        //bodyObjD[bodyObjD.length].push({ content: eval(body[0][j]), colSpan: 1, rowSpan: 1, styles: {font: fontName, lineWidth: "0.1", fillColor: "#CCCCCC", lineColor: "000000"} })
        bodyObjD[bodyObjD.length - 1].push({ content: eval(body[0][j])});
      }
    })


    console.log ("bodyObjD", bodyObjD);
    autoTable(docPDF, {
      //startY: Y,
      margin: {top: Y, right: 0, bottom: 0, left: X},
      tableWidth: W,
      //tableLineColor: lineColor,
      //tableLineWidth: lineWidth,  //Attenzione: attivando questa cambia il bordo ESTERNO della tabella
      head: headObj, //Header eventualmente di più linee
      body: bodyObjD,

      
      styles: {      
              //cellWidth: W/ data[0].length,
              halign: align,
              valign: 'middle',
              fillColor: fillColor,
              minCellHeight: H,
      },
      columnStyles: columnStylesObj,
      headStyles: {
        lineWidth: 0.1,
      },
    })
  }



  private async addImage(docPDF: jsPDF, ImageUrl: string, x: string, y: string,w: string ) {

    let imgWidth = 0;
    let imgHeight = 0;

    //creo l'oggetto img che passerò a docPDF.addImage corredandolo dei parametri di w e h corretti
    let img = new Image();
    img.src = ImageUrl;

    //costruisco la mia funzione promise custom (genero l'asincronia necessaria)
    //serve per creare un'altra Img (imgTmp) ed estrarne le dimensioni
    const loadImage = (src: string) => new Promise((resolve, reject) => {
      const imgTmp = new Image();
      imgTmp.src = src;
      imgTmp.onload = () =>{          
        imgWidth = imgTmp.width;
        imgHeight = imgTmp.height;
        //resolve(imgTmp);
        resolve ("hey");           //importante, senza questo non funzia
      }
      //imgTmp.onerror = reject;
    });

    await loadImage(ImageUrl);
    docPDF.addImage(img, 'png', parseFloat(x), parseFloat(y), parseFloat(w), parseFloat(w)*(imgHeight/imgWidth), undefined,'FAST');
  }

  private async addLine(docPDF: jsPDF, X1: string, Y1: string, X2: string, Y2: string, lineColor:string, lineWidth: string  ){
    if(lineColor == null || lineColor == "") lineColor = this.defaultColor;

    docPDF.setDrawColor(lineColor);
    docPDF.setLineWidth (parseFloat( lineWidth));

    docPDF.line(parseFloat(X1),parseFloat(Y1),parseFloat(X2),parseFloat(Y2));
  }

  private async addRect(docPDF: jsPDF, X1: string, Y1: string, W: string, H: string, lineColor:string, lineWidth: string, borderRadius: string  ){

    if(lineColor == null || lineColor == "") lineColor = this.defaultLineColor;

    docPDF.setDrawColor(lineColor);
    docPDF.setLineWidth (parseFloat( lineWidth));
    let rx: number=0;
    if(borderRadius != '' && parseFloat(borderRadius)> 0){
      rx=parseFloat( borderRadius);
      docPDF.roundedRect(parseFloat(X1),parseFloat(Y1),parseFloat(W),parseFloat(H), rx, rx );
    }
    else
      docPDF.rect(parseFloat(X1),parseFloat(Y1),parseFloat(W),parseFloat(H) );
  }

//#endregion


 
private parseTextValue ( text: string) : string {

  let retString = "";
  let outArr: any = [];

  if(text.indexOf("%>") <= 0)
    retString = text;
  else{
    let textArr = text.split("%>");

    textArr.forEach((txt,index) => {
        let tmpArr = txt.split("<%");

        outArr.push(tmpArr[0]);
        if(tmpArr[1] != undefined){
          
          //objPagella deve diventare -->  this.rptPagella 
          let fieldRef = tmpArr[1].replace("obj", "this.rpt");
          
          if(fieldRef.toLocaleLowerCase().startsWith("formatdate")) 
            fieldRef = "this." + fieldRef; 

          if(fieldRef.toLocaleLowerCase().startsWith("formatnumber")) 
            fieldRef = "this." + fieldRef; 

          //console.log("parseTextValue: " , fieldRef);
          outArr.push(eval(fieldRef));
        }
      }
    );
    retString = outArr.join('');
  }
  return retString;
}

  public FormatDate ( data: any, formato: string): string {
    let retDate= data;
    switch (formato) {
      case "yyyy-mm-dd":
        let dtISOLocaleStart = data.toLocaleString('sv').replace(' ', 'T');
        retDate = dtISOLocaleStart.substring(0,10);
        break;
      case "dd/mm/yyyy":
        var year = data.substring(0,4);
        var month = data.substring(5,7);
        let day = data.substring(8,10);
        retDate = day + '/' + month + '/' + year;
        break;
    }
    return retDate;
  }

  public FormatNumber ( data: any, n_dec: number): string {
    return Number(data).toFixed(n_dec);
  }

  //crea e scarica il report con la tabella dei dati della pagina   Metodo che include AUTOTABLE
  private buildReportPdf (rptData :any, rptColumnsNameArr: any, rptFieldsToKeep: any, rptTitle: string) {

    const doc = new jsPDF('l', 'mm', [297, 210]);
    doc.setFont('TitilliumWeb-Regular', 'normal');
    let width = doc.internal.pageSize.getWidth();
    doc.text(rptTitle, width/2, 15, { align: 'center' });
    
    //costruisco la data per il footer (vedi options di autoTable è oltre)
    let today = new Date();
    let monthpadded = String(today.getMonth()+1).padStart(2, '0');
    let nDate = today.getDate() + '/' + monthpadded + '/' + today.getFullYear();

//#region PREPARAZIONE DEI DATI ***************************************************************************

    //faccio una copia del matDataSource
    //let tmpObjArr = toPrint; //ATTENZIONE: questa crea solo una REFERENCE all'array!
    //let sourceArr = JSON.parse(JSON.stringify(toPrint)); //questo è il modo corretto di cerare una copia di un array

    //console.log ("jspdf.service: array da stampare", toPrint);

    //creo una mappa delle sue proprietà da stampare
    //let allProperties = this.propertiesToArray(toPrint[0]);
    //console.log ("jspdf.service: elenco di tutte le proprietà e di quelle dei nested objects", allProperties);

    //console.log ("jspdf.service: fieldsToKeep sono i campi da tenere:", rptFieldsToKeep);

    //creo l'array per l'operazione di flattening
    let flattened : any= [];

    //con la funzione flattenObj schiaccio gli oggetti e li metto in flattened: i campi saranno del tipo alunno.nome
    rptData.forEach ((element: any) =>{
      flattened.push(this.flattenObj(element))}
    )
    //console.log ("jspdf.service: arrResult prima di togliere i campi superflui", flattened);


    // //per ogni proprietà nella mappa vado a vedere se sono incluse nell'array di quelle da tenere
    //FUNZIONA MA HA I CAMPI IN DISORDINE!!!! NON RIESCO QUI A GOVERNARE L'ORDINE DEI CAMPI
    // allProperties.forEach((proprieta: string) =>{
    //     //se la proprietà non è inclusa....
    //     if (!fieldsToKeep.includes(proprieta)) {
    //       //vado a toglierla da ArrResult
    //       flattenedToPrint.forEach ( (record: any) => {
    //         delete record[proprieta];}
    //       )
    //     }
    //   }
    // )
    // console.log ("jspdf.service: arrResult dopo aver tolto i campi superflui", flattenedToPrint);

    //il metodo di togliere i campi che non servono lascia l'ordine che decide LUI nei campi...non va bene. serve una procedura che PESCHI i campi che servono

     //https://stackoverflow.com/questions/58637899/create-a-copy-of-an-array-but-with-only-specific-fields FUOCHINO FUOCHINO...
     //https://stackoverflow.com/questions/68768940/typescript-array-map-with-dynamic-keys ECCO LA RISPOSTA!!!

      //quanto segue prende l'array flattened e NE ESTRAE solo i campi che si trovano descritti in fieldsToKeep (quindi dinamicamente)
      let subsetFromFlattened = flattened.map((item: any) => {
        const returnValue : any = {}
        rptFieldsToKeep.forEach((key: string) => {
          returnValue[key] = item[key]
        })
        return returnValue;
      })

    //console.log ("jspdf.service: selectionFromFlattened dopo aver aggiunto i campi fieldsToKeep", subsetFromFlattened);



//#endregion FINE PREPARAZONE DEI DATI ********************************************************************


  //la riga che segue originariamente sarebbe stata: let array = json.map(obj => Object.values(obj)); 
  //e serve a trasformare un array di objects in un array di arrays
  //infatti autotable richiede che il body sia un array di arrays
  let array = subsetFromFlattened.map((obj: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(obj)); 

//#region PASSAGGIO A AUTOTABLE DEI DATI PREPARATI ********************************************************
    autoTable(doc, {
      startY: 20,
      head: rptColumnsNameArr,
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

        // if (HookData.cell.raw === null) {
        //   HookData.cell.text[0] = "ccc";
        // }

        // if (HookData.cell.raw == "") {
        //   HookData.cell.text[0] = "ccc";
        // }
      },
      showHead: "everyPage",
      didDrawPage: function (data) {

        // Header
        doc.setFontSize(20);
        doc.setTextColor(40);
        //doc.text(title, data.settings.margin.left, 10);
        
        // Footer
        let str = "Page " + data.pageNumber + "/" + data.pageCount;

        doc.setFontSize(9);

        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        let pageSize = doc.internal.pageSize;
        
        let pageWidth = pageSize.width
          ? pageSize.width
          : pageSize.getWidth();

        let pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();

        doc.text(str, data.settings.margin.left, pageHeight - 10);
        doc.text(rptTitle, pageWidth - data.settings.margin.right, pageHeight - 10, { align: 'right' });
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

    //const d = new Date();
    return doc;
    
    
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
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
        if (typeof obj === 'undefined') {
          return;
        }
      }
      delete obj[path.pop()];
    };
  
    propertiesToArray(obj: any) {
      //let keyNames = Object.keys(Object); //estrae solo i nomi delle prorietà di primo livello
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




 
/*
  public async creaPagellaPdf (objPagella: DOC_Pagella): Promise<jsPDF> {

    return this.dynamicRptPagella(objPagella);


    //Setup variabili
    
    let h_page = doc.internal.pageSize.getHeight();     //altezza pagina
    let w_page = doc.internal.pageSize.getWidth();      //larghezza pagina (ATTENZIONE: doppia!)
    let w_page1 = w_page/2;                             //larghezza pagina mezza

    let center_pos1 = w_page1/2;                   //center_pos1 = centro pagina sx
    let center_pos2 = w_page1/2*3;                 //center_pos2 = centro pagina dx

    let row_height = h_page / 45;
    let margins = 10;
    let currY=0;

    let fontName= 'TitilliumWeb-Regular';
    let fontNameBold= 'TitilliumWeb-SemiBold';
    let fontStyle= 'normal';
    let fontColor= "#C04F94";
    let fontSize= 12;
    let drawColor= "#C04F94";
    
    //doc.setFont('TitilliumWeb-SemiBold', 'normal');
    doc.setTextColor(fontColor);
    doc.setDrawColor(fontColor);

    //Bordi e sfondi
    doc.roundedRect(margins, margins, w_page1 - margins*2, h_page - margins*2, 3, 3, "S");
    doc.roundedRect(w_page1+margins, margins, w_page1 - margins*2, h_page - margins*2, 3, 3, "S");

    const ImageUrl = "../../assets/photos/logodefViola.png";
    //await  this.addImage(doc,ImageUrl, 60,50,90);

    currY = 139;
    this.addText(doc,"Anno Scolastico " +objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico,center_pos2,currY,fontName,fontStyle,fontColor,20  );
    currY = currY +row_height;

    this.addText(doc,"Documento di Valutazione",center_pos2,currY,fontNameBold,fontStyle,fontColor,20  );
    currY = currY +row_height;
    
    this.addText(doc,"Anno Scolastico " +objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico,center_pos2,currY,fontName,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;
    
    this.addText(doc,"Alunno" ,center_pos2,currY,fontName,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    this.addText(doc,objPagella.iscrizione!.alunno.nome+" "+objPagella.iscrizione!.alunno.cognome,center_pos2,currY,fontNameBold,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    this.addText(doc,"C.F. " +objPagella.iscrizione?.alunno.cf,center_pos2,currY,fontName,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    this.addText(doc,"Nato a " +objPagella.iscrizione?.alunno.comuneNascita+" ("+objPagella.iscrizione?.alunno.provNascita+") il "+Utility.UT_FormatDate2(objPagella.iscrizione?.alunno.dtNascita),center_pos2,currY,fontName,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    this.addText(doc,"Classe " + objPagella.iscrizione!.classeSezioneAnno.classeSezione.classe.descrizione2+ " Sez."+objPagella.iscrizione!.classeSezioneAnno.classeSezione.sezione,center_pos2,currY,fontNameBold,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    // doc.setFont('TitilliumWeb-Regular', 'normal');
    // doc.text("Anno Scolastico "+objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico, center_pos2, row_height*21, { align: 'center' });
    
    // doc.text("Alunno", center_pos2, row_height*24, { align: 'center' });
    //doc.setFont('TitilliumWeb-SemiBold', 'normal');
    //doc.text(objPagella.iscrizione!.alunno.nome+" "+objPagella.iscrizione!.alunno.cognome, center_pos2, row_height*26, { align: 'center' });

    // doc.setFont('TitilliumWeb-Regular', 'normal');
    // doc.text("C.F."+objPagella.iscrizione?.alunno.cf, center_pos2, row_height*27, { align: 'center' });
    // doc.text("Nato a "+objPagella.iscrizione?.alunno.comuneNascita+" ("+objPagella.iscrizione?.alunno.provNascita+") il "+Utility.UT_FormatDate2(objPagella.iscrizione?.alunno.dtNascita), center_pos2, row_height*28, { align: 'center' });

    //doc.setFont('TitilliumWeb-SemiBold', 'normal');
    //doc.text("Classe "+objPagella.iscrizione!.classeSezioneAnno.classeSezione.classe.descrizione2+ " Sez."+objPagella.iscrizione!.classeSezioneAnno.classeSezione.sezione, center_pos2, row_height*29, { align: 'center' });

    doc.addPage();
    return doc;
  }
  */
  /*


Metodo interessante: c'è la possibilità di sapere quanto largo viene il testo e quindi fare degli offset
  var centeredText = function(text, y) {
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.text(textOffset, y, text);
}


  */





//NICOLA

// function loadAsset (url: string, type: any, callback: any) {
//   let xhr= new XMLHttpRequest();
//   xhr.open('GET', url);
//   xhr.responseType = type;

//   xhr.onload = function () {
//     callback(xhr.response);
//   }

//   xhr.send;
// }

// function displayImage(blob: any) {
//   let objectURL = URL.createObjectURL(blob)
//   let image = document.createElement('img');
//   image.src = objectURL;
//   document.body.appendChild(image);

// }
// loadAsset("URLdell'immagine", 'blob', displayImage);


// fetch ("URL dell'immagine")
// .then (response=> {
//   if (!response.ok) {
//     throw new Error("error:"+ response.status)
//   } else {
//     return response.blob();
//   }
// }).then (myBlob => {
//   let objectURL = URL.createObjectURL(myBlob);
//   let image = document. createElement('img');
//   image.src = objectURL;
//   document. body.appendChild(image);
// }).catch(e => {
//   console.log ('Fetch problem'+ e.message);
// })

// let timeoutpromise = new Promise((resolve, reject) => {

//     resolve('success');

// });


