import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/** A hero's name can't match the hero's alter ego */
export const tooWideValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const x = control.get('x');
    const w = control.get('w');
  
    return x!.value + w!.value > 210 ? { tooWide: true } : null;
    //return name && alterEgo && name.value === alterEgo.value ? { identityRevealed: true } : null;
  };

  export const tooHighValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const y = control.get('y');
    const h = control.get('h');
  
    return y!.value + h!.value > 297 ? { tooHigh: true } : null;
    //return name && alterEgo && name.value === alterEgo.value ? { identityRevealed: true } : null;
  };