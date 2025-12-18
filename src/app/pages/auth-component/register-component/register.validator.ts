import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchPasswords(ctrl1: string, ctrl2: string): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const val1 = form.get(ctrl1)?.value;
    const val2 = form.get(ctrl2)?.value;

    return val1 === val2 ? null : { mismatch: true };
  };
}
