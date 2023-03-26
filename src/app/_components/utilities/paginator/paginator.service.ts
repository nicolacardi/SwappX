import { Injectable }                           from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginatorService {

  constructor() { }

  replacer(text: string, objFields:any): string{
    //va a creare un DOMParser e ci mette il text
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    //ora cerca tutti i tag che contengono  data-denotation-char= "@"
    const mentions = doc.querySelectorAll(`span[data-denotation-char="@"]`);
    
    //per ciascun tag identificato...
    mentions.forEach((mention) => {
      //estrae l'atribute data-value
      const fieldName = mention.getAttribute("data-value");
      //se esiste ed esiste objFields[fieldName]
      if (fieldName && objFields[fieldName]) {
        //sostituisce con il valore trovato!
        mention.textContent = objFields[fieldName];
      }
    });
    //ora estrae l'innerHTML così pulito
    return doc.body.innerHTML;
  }

  paginatorBuild(rptFile: any, blocco: any, objFields: any): any {

    if (blocco.tipoBlocco!.descrizione=="Text") {
      //console.log ("blocco._BloccoTesti![0].testo", blocco._BloccoTesti![0].testo);
      let cleanText = this.replacer(blocco._BloccoTesti![0].testo, objFields);
      rptFile.push({
        "tipo": "TextHtml",
        "alias": "...",
        "value": cleanText,
        "X": blocco.x,
        "Y": blocco.y,
        "W": blocco.w,
        "H": blocco.h,
        "backgroundColor": blocco.color,
        "fontSize": blocco._BloccoTesti![0].fontSize
      });
    }
    if (blocco.tipoBlocco!.descrizione=="Image") {
      rptFile.push({
        "tipo": "ImageBase64",
        "alias": "...",
        "value": blocco._BloccoFoto![0].foto,
        "X": blocco.x,
        "Y": blocco.y,
        "W": blocco.w,
        "H": blocco.h,
        "backgroundColor": blocco.color,
        // "fontSize": blocchi[i]._BloccoTesti![0].fontSize
      });
    }
    if (blocco.tipoBlocco!.descrizione=="Table") {
      //estraggo il numero di righe e il numero di colonne
      const maxRow = Math.max(...blocco._BloccoCelle.map((cella: any) => cella.row));
      const maxCol = Math.max(...blocco._BloccoCelle.map((cella: any) => cella.col));

      let widthCum = new Array(maxCol).fill(0); // larghezza totale delle celle precedenti nella stessa colonna
      let heightCum = new Array(maxRow).fill(0); // altezza totale delle celle precedenti nella stessa riga
      
      //creo due array per tenere conto delle righe e colonne già visitate
      let colVisitate = new Array(maxCol).fill(false);
      let rowVisitate = new Array(maxRow).fill(false);

      console.log ("paginator - paginatorBuild - blocco",blocco);
      let widthCumVal = 0;
      let heightCumVal = 0;

      blocco._BloccoCelle.forEach((cella:any) => {

        //se mi imbatto per la prima volta in una colonna vado ad alimentare l'array delle larghezze e calcolo x di conseguenza
        if (!colVisitate[cella.col-1]) {
          colVisitate[cella.col-1] = true; 
          widthCumVal = widthCumVal + cella.w;
          widthCum [cella.col] = widthCumVal; //inserisco nella successiva colonna la x da cui dovrà partire
        }
        //se mi imbatto per la prima volta in una riga vado ad alimentare l'array delle altezze e calcolo y di conseguenza

        if (!rowVisitate[cella.row - 1]) {
          rowVisitate[cella.row-1] = true; 
          heightCumVal = heightCumVal + cella.h;
          heightCum [cella.col] = heightCumVal;
        }
        console.log ("cella",cella);

        console.log ("col", cella.col, "row", cella.row);

        console.log ("colVisitate", rowVisitate);
        console.log ("widthCum", widthCum);

        console.log ("rowVisitate", rowVisitate);
        console.log ("heightCum", heightCum);


        let x  = widthCum [cella.col-1] + blocco.x ;
        let y  = heightCum [cella.row-1] + blocco.y;

        console.log ("cella",cella, " - x", x, "- y", y);
        let topush = {
          "tipo": "TextHtml",
          "alias": "...",
          "value": cella.testo,
          "X": x,
          "Y": y,
          "W": cella.w,
          "H": cella.h,
          "backgroundColor": "#FFFFFF",
          "fontSize": 10
        }
        console.log ("paginator - paginatorBuild - topush:", topush);
        rptFile.push(topush);
        
      })
      
    }

    return rptFile
  }
}
