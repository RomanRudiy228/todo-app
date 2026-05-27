import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category } from '../../../core/models/category.models';
import { Task } from '../../../core/models/task.models';
import { z } from 'zod';
import { ButtonComponent } from '../../../components/button/button.component';
import { SelectComponent, SelectOption } from '../../../components/select/select.component';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SelectComponent],
  templateUrl: './task-modal.component.html',
})

export class TaskModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  private taskSchema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }).max(200, { message: 'Max length is 200.' }),
  });

  @Input() open = false;
  @Input() task: Task | null = null;
  @Input() categories: Category[] = [];
  @Output() save = new EventEmitter<Record<string, unknown>>();
  @Output() close = new EventEmitter<void>();

  categoryOptions: SelectOption[] = [{ value: '', label: 'No category' }];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    dueDate: [''],
    categoryId: [''],
    isCompleted: [false],
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categories']) {
      this.categoryOptions = [
        { value: '', label: 'No category' },
        ...this.categories.map(c => ({ value: c.id, label: c.name })),
      ];
    }

    if (changes['task'] || changes['open']) {
      if (this.task) {
        this.form.patchValue({
          title: this.task.title,
          description: this.task.description ?? '',
          dueDate: this.task.dueDate ? this.task.dueDate.substring(0, 10) : '',
          categoryId: this.task.categoryId ?? '',
          isCompleted: this.task.isCompleted,
        });
      } else {
        this.form.reset({ title: '', description: '', dueDate: '', categoryId: '', isCompleted: false });
      }
    }
  }

  submit() {
    this.form.markAllAsTouched();

    const raw = this.form.getRawValue();
    const parsed = this.taskSchema.safeParse(raw);
    if (!parsed.success) {
      this.applyZodErrors(parsed.error);
      return;
    }

    const v = this.form.getRawValue();
    this.save.emit({
      title: v.title,
      description: v.description || undefined,
      dueDate: v.dueDate ? new Date(v.dueDate).toISOString() : undefined,
      categoryId: v.categoryId || undefined,
      isCompleted: v.isCompleted ?? false,
    });
  }

  onClose() {
    this.close.emit();
  }

  private applyZodErrors(error: z.ZodError) {
    const titleCtrl = this.form.get('title');
    if (titleCtrl?.errors?.['zod']) {
      const { zod: _zod, ...rest } = titleCtrl.errors;
      titleCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }

    for (const issue of error.issues) {
      const key = issue.path[0];
      if (key !== 'title') continue;
      titleCtrl?.setErrors({ ...(titleCtrl.errors ?? {}), zod: issue.message });
    }
  }
}
