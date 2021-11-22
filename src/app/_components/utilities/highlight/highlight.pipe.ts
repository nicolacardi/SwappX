import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(value: string, search: string): string {
    if (search) {
      const valueStr = value + ''; // + ''; // Ensure numeric values are converted to strings
      const valueStr2 = valueStr.replace (' ','&nbsp;');  
      //poichè il risulttao verrà isnerito in una innerHTML gli spazi che sono a ridosso dello span vengono interpretati come inutili e quindi ignorati
      //per questo è necessario sostituirli con &nbsp;
      const valueStr3 = valueStr2.replace(new RegExp('(' + search + ')', 'gi'), '<span class="yellow">$1</span>');
      //return valueStr.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + search + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<span class="yellow">$1</span>');  //Così avevo trovato
      return valueStr3;
    } else {
      return value;
    }
    //NB: 
    //-non funziona con le date
    //-non funziona sui filtri compositi
  }

}
