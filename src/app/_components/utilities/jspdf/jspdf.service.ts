import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Utility } from  '../utility.component';
import autoTable from 'jspdf-autotable';
import { HttpClient } from '@angular/common/http';


import '../../../../assets/fonts/TitilliumWeb-Regular-normal.js';
import '../../../../assets/fonts/TitilliumWeb-SemiBold-normal.js';

import { DOC_Pagella } from 'src/app/_models/DOC_Pagella.js';

import { RptLineTemplate1 } from 'src/app/_reports/rptPagella';


@Injectable({
  providedIn: 'root'
})
export class JspdfService {

  defaultColor!:  string;

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


  //#region --- Funzioni private ---

  private async  addImage(docPDF: jsPDF, ImageUrl: string, x: string, y: string,w: string ) {

    let imgWidth = 0;
    let imgHeight = 0;

    let img = new Image();
    img.src = ImageUrl;
    
    console.log("[addImage] - Inizio addImage");

    const loadImage = (src: string) => new Promise((resolve, reject) => {
      const imgTmp = new Image();
      imgTmp.src = src;
      imgTmp.onload = () =>{          
         imgWidth = imgTmp.width;
         imgHeight = imgTmp.height;
         resolve(imgTmp);           //importante, senza questo non funzia
      }
      //imgTmp.onerror = reject;
    });
    
    //console.log("ImageURL: ", ImageUrl);

    await loadImage(ImageUrl).then(image => {
        docPDF.addImage(img, 'png', parseFloat(x), parseFloat(y), parseFloat(w), parseFloat(w)*(imgHeight/imgWidth), undefined,'FAST');
    });

    //console.log("[addImage] - Fine addImage");
  }

  private async addText(docPDF: jsPDF, text: string, X: number, Y: number, fontName: string, fontStyle: string , fontColor:string, fontSize: number  ){

    docPDF.setFont(fontName, fontStyle);
    if(fontColor == null || fontColor == "")
      fontColor = this.defaultColor;

      docPDF.setTextColor(fontColor);
    docPDF.setFontSize(fontSize);

    docPDF.text(text, X, Y, { align: 'center' });

    //Restituisce l'altezza del testo
    //docPDF.getTextDimensions(text);
    //var dim = docPDF.getTextDimensions(text);
    //console.log("dimensioni testo: ", dim);
  }

  private async addLine(docPDF: jsPDF, X1: string, Y1: string, X2: string, Y2: string, lineColor:string, lineWidth: string  ){

    docPDF.setDrawColor(lineColor);
    docPDF.setLineWidth (parseFloat( lineWidth));

    docPDF.line(parseFloat(X1),parseFloat(Y1),parseFloat(X2),parseFloat(Y2));
  }

  private async addRect(docPDF: jsPDF, X1: string, Y1: string, W: string, H: string, lineColor:string, lineWidth: string, borderRadius: string  ){

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


  public async dynamicRpt(objPagella: DOC_Pagella) : Promise<jsPDF> {

    //##############  determina le dimensioni della pagina
    let pageW: number = 0;
    let pageH: number = 0;
    
    await Promise.all( RptLineTemplate1.map(async (element: any) => {
      switch(element.tipo){
        case "SheetSize":
          pageW= parseInt(element.width);
          pageH= parseInt(element.heigth);
          this.defaultColor = element.defaultColor;
          break;
      }
    }));
    if(pageH <=0 || pageW <=0){
      let doc : jsPDF  = new jsPDF('l', 'mm', [100 , 100]);  
      doc.text("ERRORE: manca il tag [SheetSize] in rptPagella",10, 50);
      return doc;
    }
    let doc : jsPDF  = new jsPDF('l', 'mm', [pageW , pageH]);   //A3

    //############### lettura file/rpt source e loop sui tags
    await Promise.all( RptLineTemplate1.map(async (element: any) => {      

      switch(element.tipo){

          case "Image":
            const ImageUrl = "../../assets/photos/" + element.value;
            await this.addImage(doc,ImageUrl, element.X ,element.Y, element.W);
            break;
          case "Text":
            this.addText(doc,element.value,element.X,element.Y,element.font,"regular",element.color,20  );
            break;
          case "Line":
            this.addLine(doc,element.X1,element.Y1,element.X2,element.Y2, element.color, element.thickness);
            break;
          case "Rect":
            this.addRect(doc,element.X,element.Y,element.W,element.H, element.color, element.thickness, element.borderRadius);
            break;
          case "Data":
            this.addText(doc,eval(element.value),element.X,element.Y,element.font,"regular",element.color,20  );
            break;
        }
      }
    ));
    return doc;
  }



  //############### TEST ######################

  
/*
  public async creaPagellaPdf (objPagella: DOC_Pagella): Promise<jsPDF> {

    return this.dynamicRpt(objPagella);


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


  //crea e scarica il report con la tabella dei dati della pagina
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

    console.log ("jspdf.service: fieldsToKeep sono i campi da tenere:", rptFieldsToKeep);

    //creo l'array per l'operazione di flattening
    let flattened : any= [];

    //con la funzione flattenObj schiaccio gli oggetti e li metto in flattened: i campi saranno del tipo alunno.nome
    rptData.forEach ((element: any) =>{
      flattened.push(this.flattenObj(element))}
    )
    console.log ("jspdf.service: arrResult prima di togliere i campi superflui", flattened);


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

    console.log ("jspdf.service: selectionFromFlattened dopo aver aggiunto i campi fieldsToKeep", subsetFromFlattened);



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
