import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideChevronLeft, LucideChevronRight],
  template: `
    @if (totalPages > 0) {
      <nav class="flex items-center justify-center gap-4" aria-label="Pagination">
        <button
          type="button"
          (click)="prev.emit()"
          [disabled]="!canGoPrev || loading"
          [class.invisible]="!canGoPrev"
          class="p-2 w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page">
          <svg lucideChevronLeft class="w-5 h-5"></svg>
        </button>

        <span class="text-sm font-medium text-slate-700 min-w-[4.5rem] text-center tabular-nums">
          {{ page }} / {{ totalPages }}
        </span>

        <button
          type="button"
          (click)="next.emit()"
          [disabled]="!canGoNext || loading"
          [class.invisible]="!canGoNext"
          class="p-2 w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page">
          <svg lucideChevronRight class="w-5 h-5"></svg>
        </button>
      </nav>
    }
  `,
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() loading = false;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  get canGoPrev(): boolean {
    return this.page > 1;
  }

  get canGoNext(): boolean {
    return this.page < this.totalPages;
  }
}
