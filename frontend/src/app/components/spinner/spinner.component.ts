import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass" role="status" aria-label="Loading">
      <div
        class="animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"
        [class]="sizeClass"></div>
      @if (label) {
        <span class="text-sm text-slate-500">{{ label }}</span>
      }
    </div>
  `,
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() label = '';
  @Input() inline = false;

  get containerClass(): string {
    return this.inline
      ? 'inline-flex items-center gap-2'
      : 'flex flex-col items-center justify-center gap-3 py-8';
  }

  get sizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-10 w-10';
      default:
        return 'h-8 w-8';
    }
  }
}
