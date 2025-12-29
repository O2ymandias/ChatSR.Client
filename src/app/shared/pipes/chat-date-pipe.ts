import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chatDate',
})
export class ChatDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const valueDate = new Date(value);

    const valueDay = valueDate.getDate();
    const valueMonth = valueDate.getMonth();
    const valueYear = valueDate.getFullYear();

    if (valueDay === day && valueMonth === month && valueYear === year) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(valueDate);
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      year: 'numeric',
      day: 'numeric',
    }).format(valueDate);
  }
}
