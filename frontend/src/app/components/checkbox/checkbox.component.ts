import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <input
      type="checkbox"
      [checked]="checked"
      (change)="onChange($event)"
      class="mt-1 rounded cursor-pointer transition-colors
      accent-indigo-600
         border-slate-300
         text-indigo-600
         focus:ring-indigo-600
         hover:border-indigo-600"
    />
  `,
})
export class CheckboxComponent {
  @Input() checked = false;
  @Output() toggled = new EventEmitter<boolean>();

  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.toggled.emit(input.checked);
  }
}

