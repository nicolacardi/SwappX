import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(value: string, search: string): string {
    if (search) {
      let valueStr = value + ''; // + ''; // Ensure numeric values are converted to strings
      valueStr = valueStr.replace (/ /g,'|');   //sostituisco temporaneamente gli spazi con un pipe
      //poichè il risultato verrà inserito in una innerHTML gli spazi che sono a ridosso dello span vengono interpretati come inutili e quindi ignorati
      //per questo è necessario sostituirli con &nbsp;
      valueStr = valueStr.replace(new RegExp('(' + search + ')', 'gi'), '<span class="yellow">$1</span>');
      //return valueStr.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + search + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<span class="yellow">$1</span>');  //Così avevo trovato
      valueStr = valueStr.replace (/\|/g,'&nbsp;'); //risostituisco i pipe con spazi html (deve finire in un innerHTML)
      return valueStr;
    } else {
      return value;
    }
    //NB: 
    //-non funziona con le date (ci vuole un pipe ulteriore, forse)
    //-non funziona sui filtri compositi
    //non funziona se nella stringa cercata c'è uno spazio
    //ha richiesto che si introduca nel css:
    // .mat-cell {
    //   width: auto;
    //   white-space: nowrap;
    //   overflow: hidden;
    //   text-overflow: ellipsis;
    // }
    //-altrimenti il testo a capo veniva spezzato malamente

  }

}
