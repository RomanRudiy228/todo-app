import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../core/models/task.models';
import { LucideTrash2 } from '@lucide/angular';
import { ButtonComponent } from '../button/button.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, LucideTrash2, ButtonComponent, CheckboxComponent],
  template: `
    <div
      class="bg-white rounded-lg border border-slate-200 p-4 flex items-start gap-3 hover:shadow-sm transition-shadow cursor-pointer select-none"
      (click)="edit.emit(task)">
      <app-checkbox
        [checked]="task.isCompleted"
        (toggled)="onToggleComplete($event)"
        (click)="$event.stopPropagation()" />
      <div class="flex-1 min-w-0">
        <p [class]="task.isCompleted ? 'line-through text-slate-400' : 'font-medium text-slate-800'">
          {{ task.title }}
        </p>
        @if (task.description) {
          <p class="text-sm text-slate-500 truncate">{{ task.description }}</p>
        }
        <div class="flex gap-2 mt-1 text-xs text-slate-400">
          @if (task.categoryName) {
            <span class="bg-slate-100 px-2 py-0.5 rounded">{{ task.categoryName }}</span>
          }
          @if (task.dueDate) {
            <span>Due: {{ task.dueDate | date: 'mediumDate' }}</span>
          }
        </div>
      </div>
      <app-button
        variant="danger"
        size="sm"
        (click)="onDeleteClick($event)"
        aria-label="Delete task"
        title="Delete">
        <svg lucideTrash2 class="w-4 h-4"></svg>
      </app-button>
    </div>
  `,
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() toggleComplete = new EventEmitter<Task>();
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();

  onDeleteClick(event: MouseEvent) {
    event.stopPropagation();
    this.delete.emit(this.task);
  }

  onToggleComplete(event: boolean) {
    if (event === this.task.isCompleted) return;
    this.toggleComplete.emit(this.task);
  }
}
