import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | null | undefined, formatStr: string = 'dd/MM/yyyy'): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    return format(date, formatStr, { locale: fr });
  }
}

