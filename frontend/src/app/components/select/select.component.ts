import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative" [class]="wrapperClass">
      <select
        [id]="selectId"
        [disabled]="disabled"
        [ngModel]="value"
        (ngModelChange)="onChange($event)"
        (blur)="onTouched()"
        class="w-full appearance-none px-3 py-2 pr-10 border border-slate-300 rounded-lg outline-none transition-colors cursor-pointer
          hover:border-indigo-300 focus:ring-1 focus:ring-indigo-600/70 focus:border-indigo-600 bg-white disabled:opacity-50 disabled:cursor-not-allowed">
        @for (opt of options; track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.0l3.71-3.77a.75.75 0 0 1 1.08 1.04l-4.25 4.32a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"
            clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() disabled = false;
  @Input() wrapperClass = '';
  @Input() selectId = '';

  value = '';
  private onChangeFn: (v: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChange(value: string): void {
    this.value = value;
    this.onChangeFn(value);
  }

  onTouched(): void {
    this.onTouchedFn();
  }
}
