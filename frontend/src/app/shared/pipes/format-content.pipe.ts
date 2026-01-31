import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatContent',
  standalone: true
})
export class FormatContentPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | undefined | null): SafeHtml {
    if (!value) return this.sanitizer.bypassSecurityTrustHtml('');

    // Si le contenu contient déjà du HTML, le retourner tel quel (après sanitization)
    if (value.includes('<') && value.includes('>')) {
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }

    // Sinon, formater le texte brut
    let formatted = value
      // Convertir les doubles sauts de ligne en paragraphes
      .replace(/\n\n+/g, '</p><p>')
      // Convertir les simples sauts de ligne en <br>
      .replace(/\n/g, '<br>')
      // Encapsuler dans des paragraphes
      .split('</p><p>')
      .map(para => para.trim())
      .filter(para => para.length > 0)
      .map(para => `<p>${para}</p>`)
      .join('');

    // Si le texte ne commence pas par un paragraphe, en ajouter un
    if (!formatted.startsWith('<p>')) {
      formatted = `<p>${formatted}</p>`;
    }

    // Nettoyer les balises vides
    formatted = formatted.replace(/<p><\/p>/g, '');
    formatted = formatted.replace(/<p><br><\/p>/g, '');

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
}
