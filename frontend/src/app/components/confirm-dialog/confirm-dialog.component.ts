import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        (click)="cancel.emit()">
        <div
          class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
          (click)="$event.stopPropagation()">
          <h2 [id]="titleId" class="text-lg font-semibold text-slate-900">{{ title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ message }}</p>
          <div class="mt-6 flex justify-end gap-2">
            <app-button variant="secondary" (click)="cancel.emit()">{{ cancelLabel }}</app-button>
            <app-button variant="danger" (click)="confirm.emit()">{{ confirmLabel }}</app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Delete';
  @Input() cancelLabel = 'Cancel';

  readonly titleId = `confirm-dialog-title-${Math.random().toString(36).slice(2, 9)}`;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
