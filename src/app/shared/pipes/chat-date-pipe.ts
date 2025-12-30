import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chatDate',
})
export class ChatDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const now = new Date();
    const valueDate = new Date(value);

    // Today
    const isToday =
      now.getDate() === valueDate.getDate() &&
      now.getMonth() === valueDate.getMonth() &&
      now.getFullYear() === valueDate.getFullYear();

    if (isToday) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(valueDate);
    }

    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      yesterday.getDate() === valueDate.getDate() &&
      yesterday.getMonth() === valueDate.getMonth() &&
      yesterday.getFullYear() === valueDate.getFullYear();

    if (isYesterday) {
      return 'Yesterday';
    }

    // This week
    const diffInDays = (now.getTime() - valueDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays < 7) {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
      }).format(valueDate);
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    }).format(valueDate);
  }
}
