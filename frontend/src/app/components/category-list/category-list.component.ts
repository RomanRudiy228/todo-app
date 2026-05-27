import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../core/models/category.models';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <aside class="w-64 bg-white border-r border-slate-200 p-4 flex flex-col shrink-0">
      <button
        type="button"
        (click)="select.emit('')"
        [class]="selectedCategoryId === '' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'"
        class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-1 cursor-pointer transition-colors">
        All tasks
      </button>

      @for (cat of categories; track cat.id) {
        <div class="group flex items-center mb-1">
          <button
            type="button"
            (click)="select.emit(cat.id)"
            [class]="selectedCategoryId === cat.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'"
            class="flex-1 text-left px-3 py-2 rounded-lg text-sm truncate cursor-pointer transition-colors">
            <span class="inline-block w-2 h-2 rounded-full mr-2" [style.background]="cat.color || '#4f46e5'"></span>
            {{ cat.name }}
            <span class="text-slate-400 ml-1">({{ cat.taskCount }})</span>
          </button>
          <button
            type="button"
            (click)="delete.emit({ category: cat, event: $event })"
            class="opacity-0 group-hover:opacity-100 text-red-500 text-lg px-1 transition-all group-hover:scale-110 hover:text-red-700 hover:scale-110 cursor-pointer"
            aria-label="Delete category">
            ×
          </button>
        </div>
      }

      @if (showCategoryForm) {
        <div class="mt-2 flex gap-1">
          <input
            [ngModel]="newCategoryName"
            (ngModelChange)="newCategoryNameChange.emit($event)"
            (keyup.enter)="add.emit()"
            placeholder="List name"
            class="flex-1 px-2 py-1 text-sm border border-slate-300 rounded-lg outline-none transition-colors
              hover:border-indigo-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/60" />
          <app-button variant="primary" size="sm" (click)="add.emit()">Add</app-button>
        </div>
      } @else {
        <button
          type="button"
          (click)="showForm.emit()"
          class="mt-2 text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer text-left">
          + New list
        </button>
      }
    </aside>
  `,
})
export class CategoryListComponent {
  @Input() categories: Category[] = [];
  @Input() selectedCategoryId = '';
  @Input() showCategoryForm = false;
  @Input() newCategoryName = '';

  @Output() select = new EventEmitter<string>();
  @Output() delete = new EventEmitter<{ category: Category; event: Event }>();
  @Output() add = new EventEmitter<void>();
  @Output() showForm = new EventEmitter<void>();
  @Output() newCategoryNameChange = new EventEmitter<string>();
}
