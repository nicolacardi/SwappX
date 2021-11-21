import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(value: string, search: string): string {
    if (search) {
      //console.log ("prima",value);
      const valueStr = value + ''; // + ''; // Ensure numeric values are converted to strings
      //console.log ("dopo", valueStr.replace(new RegExp('(' + search + ')', 'gi'), '<span class="yellow">$1</span>'));
      //return valueStr.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + search + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<span class="yellow">$1</span>');  
      return valueStr.replace(new RegExp('(' + search + ')', 'gi'), '<span class="yellow">$1</span>');  //QUESTO E' QUASI GIUSTO MA TRIMMA
      //return valueStr.replace(search, '<span class="yellow">'+search+'</span>');  
      //return value;
    } else {
      return value;
    }
    //return valueStr.replace(search, '<span class="yellow">'+search+'</span>');  
    //TODO: 
    //-toglie gli spazi anche quando non deve
    //-non funziona con le date
    //-non funziona sui filtri compositi
    //return valueStr;
  }

}
