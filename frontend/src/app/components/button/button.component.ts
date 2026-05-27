import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  host: {
    class: 'block',
    '[class.w-full]': 'fullWidth',
  },
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClass">
      @if (loading) {
        <app-spinner size="sm" [inline]="true" />
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  get buttonClass(): string {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-sm',
    };

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
      secondary: 'bg-indigo-600 text-white hover:bg-indigo-700',
      ghost: 'text-slate-600 hover:bg-slate-100',
      danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
    };

    const width = this.fullWidth ? 'w-full' : '';
    const padding = this.size === 'md' && this.fullWidth ? 'py-2.5' : '';

    return [base, sizes[this.size], variants[this.variant], width, padding].filter(Boolean).join(' ');
  }
}
