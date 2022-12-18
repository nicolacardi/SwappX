import { AbstractControl, ValidatorFn } from '@angular/forms';
import { PersoneService } from '../../persone/persone.service';
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { Observable } from 'rxjs';


export function RequireMatch(control: AbstractControl) {

    const selection: any = control.value;
    if (typeof selection === 'string') {  
        //in pratica se quello che rimane scritto è una stringa viene lanciato l'errore....forse andrebbe meglio strutturato...
        //ad esempio qui andrebbe detto: se la selezione rientra nell'elenco delle persone....allora accettalo altrimenti no.
        return { incorrect: true };
    }
    return null;
}


export class FormCustomValidators {
    static valueSelected(myArray: any[]): ValidatorFn {
    //static valueSelected<T>(exists: (value: T) => boolean): ValidatorFn
      return (c: AbstractControl): { [key: string]: boolean } | null => {
        //console.log ("formcustomvalidator myArray", myArray);
        let selectboxValue = c.value;
        //console.log ("formcustomvalidator selectboxValue", selectboxValue);

        let pickedOrNot = myArray.filter(
          //(alias) => (alias.name + " " + alias.cognome) === selectboxValue
          (alias) => alias === selectboxValue
        );
        //console.log ("pickedOrNot", pickedOrNot);
        if (pickedOrNot.length > 0) {
          // everything's fine. return no error. therefore it's null.
          return null;
        } else {
          //there's no matching selectboxvalue selected. so return match error.
          return { unmatched: true };
        }
      };
    }
  }

