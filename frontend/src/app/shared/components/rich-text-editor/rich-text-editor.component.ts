import { Component, forwardRef, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="rich-text-editor border border-gray-300 rounded-lg overflow-hidden">
      <!-- Toolbar -->
      <div class="toolbar bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-2">
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('bold')"
          [class.active]="isFormatActive('bold')"
          title="Gras">
          <mat-icon>format_bold</mat-icon>
        </button>
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('italic')"
          [class.active]="isFormatActive('italic')"
          title="Italique">
          <mat-icon>format_italic</mat-icon>
        </button>
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('underline')"
          [class.active]="isFormatActive('underline')"
          title="Souligné">
          <mat-icon>format_underlined</mat-icon>
        </button>
        <div class="border-l border-gray-300 mx-1"></div>
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('h2')"
          title="Titre 2">
          <mat-icon>title</mat-icon>
        </button>
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('h3')"
          title="Titre 3">
          <mat-icon class="text-sm">title</mat-icon>
        </button>
        <div class="border-l border-gray-300 mx-1"></div>
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('insertUnorderedList')"
          title="Liste à puces">
          <mat-icon>format_list_bulleted</mat-icon>
        </button>
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('insertOrderedList')"
          title="Liste numérotée">
          <mat-icon>format_list_numbered</mat-icon>
        </button>
        <div class="border-l border-gray-300 mx-1"></div>
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('justifyLeft')"
          title="Aligner à gauche">
          <mat-icon>format_align_left</mat-icon>
        </button>
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('justifyCenter')"
          title="Centrer">
          <mat-icon>format_align_center</mat-icon>
        </button>
        <button 
          type="button"
          mat-icon-button
          (click)="formatText('justifyRight')"
          title="Aligner à droite">
          <mat-icon>format_align_right</mat-icon>
        </button>
        <div class="border-l border-gray-300 mx-1"></div>
        <button 
          type="button"
          mat-icon-button
          (click)="insertLink()"
          title="Insérer un lien">
          <mat-icon>link</mat-icon>
        </button>
        <button 
          type="button"
          mat-icon-button
          (click)="insertEmoji()"
          title="Insérer un emoji">
          <mat-icon>mood</mat-icon>
        </button>
      </div>
      
      <!-- Editor -->
      <div 
        class="editor-content p-4 min-h-[300px] focus:outline-none"
        contenteditable="true"
        [innerHTML]="content"
        (input)="onContentChange($event)"
        (blur)="onBlur()"
        #editor>
      </div>
    </div>
  `,
  styles: [`
    .rich-text-editor {
      font-family: inherit;
    }
    
    .toolbar button.active {
      background-color: #e5e7eb;
    }
    
    .editor-content {
      line-height: 1.6;
    }
    
    .editor-content h2 {
      font-size: 1.5rem;
      font-weight: bold;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
    
    .editor-content h3 {
      font-size: 1.25rem;
      font-weight: bold;
      margin-top: 0.75rem;
      margin-bottom: 0.5rem;
    }
    
    .editor-content ul, .editor-content ol {
      margin-left: 1.5rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .editor-content p {
      margin-bottom: 1rem;
    }
    
    .editor-content:focus {
      outline: none;
    }
  `]
})
export class RichTextEditorComponent implements ControlValueAccessor, AfterViewInit {
  @Input() placeholder = '';
  @ViewChild('editor', { static: false }) editorRef!: ElementRef<HTMLElement>;
  content = '';

  onChange = (value: string) => {};
  onTouched = () => {};

  ngAfterViewInit() {
    // L'éditeur est déjà initialisé via contenteditable
  }

  writeValue(value: string): void {
    this.content = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onContentChange(event: any): void {
    const html = event.target.innerHTML;
    this.content = html;
    this.onChange(html);
  }

  onBlur(): void {
    this.onTouched();
  }

  formatText(command: string, value?: string): void {
    if (this.editorRef) {
      this.editorRef.nativeElement.focus();
    }
    document.execCommand(command, false, value || undefined);
    this.updateContent();
  }

  insertLink(): void {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      document.execCommand('createLink', false, url);
      this.updateContent();
    }
  }

  insertEmoji(): void {
    const emojis = ['😊', '🎉', '❤️', '👍', '🔥', '⭐', '💪', '🎯', '🏆', '⚽', '🏡', '🤝', '🔜'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    document.execCommand('insertText', false, emoji + ' ');
    this.updateContent();
  }

  isFormatActive(command: string): boolean {
    return document.queryCommandState(command);
  }

  private updateContent(): void {
    setTimeout(() => {
      if (this.editorRef && this.editorRef.nativeElement) {
        this.content = this.editorRef.nativeElement.innerHTML;
        this.onChange(this.content);
      }
    }, 0);
  }
}
