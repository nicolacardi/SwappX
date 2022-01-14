import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightDate'
})

export class HighlightDatePipe implements PipeTransform {

    transform(value: string, search: string): string {
        if (search) {
            let valueStr = this.formatDate(value) + '';
            valueStr = valueStr.replace(new RegExp('(' + search + ')', 'gi'), '<span class="yellow">$1</span>');
            return valueStr;
        } else {
            let valueStr = this.formatDate(value)
            return valueStr;  //NB LA CUSTOMPIPE DEVE AGIRE ANCHE IN ASSENZA DI FILTERVALUE NEL CASO DELLA DATA.
        }
    }

    formatDate (dateStr: any) {
        let dArr = dateStr.split("-");
        return dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];
    }

}
