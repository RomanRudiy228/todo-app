import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchBarComponent),
      multi: true,
    },
  ],
  styles: [
    `
      input[type='search']::-webkit-search-cancel-button {
        display: none;
      }
    `,
  ],
  template: `
    <input
      type="search"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [ngModel]="value"
      (ngModelChange)="onInput($event)"
      (blur)="onTouched()"
      class="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-colors
        focus:ring-1 focus:ring-indigo-600/70 focus:border-indigo-600 disabled:opacity-50"
      [class]="extraClass"
    />
  `,
})
export class SearchBarComponent implements ControlValueAccessor {
  @Input() placeholder = 'Search...';
  @Input() disabled = false;
  @Input() extraClass = '';
  @Output() searchChange = new EventEmitter<string>();

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

  onInput(value: string): void {
    this.value = value;
    this.onChangeFn(value);
    this.searchChange.emit(value);
  }

  onTouched(): void {
    this.onTouchedFn();
  }
}
