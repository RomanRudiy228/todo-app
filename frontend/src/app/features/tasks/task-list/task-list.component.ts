import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.models';
import { Category } from '../../../core/models/category.models';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { Router } from '@angular/router';
import { CategoryListComponent } from '../../../components/category-list/category-list.component';
import { TaskCardComponent } from '../../../components/task-card/task-card.component';
import { SearchBarComponent } from '../../../components/search-bar/search-bar.component';
import { SelectComponent, SelectOption } from '../../../components/select/select.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { LucideDoorOpen } from '@lucide/angular';
import { Subject, Subscription, debounceTime, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskModalComponent,
    CategoryListComponent,
    TaskCardComponent,
    SearchBarComponent,
    SelectComponent,
    ButtonComponent,
    PaginationComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    LucideDoorOpen,
  ],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  categories: Category[] = [];
  page = 1;
  pageSize = 10;
  totalPages = 1;
  loading = false;
  error = '';

  search = '';
  selectedCategoryId = '';
  filterCompleted: '' | 'true' | 'false' = '';
  sortBy = 'createdAt';
  sortDirection = 'desc';

  modalOpen = false;
  editingTask: Task | null = null;

  deleteConfirmOpen = false;
  taskToDelete: Task | null = null;

  newCategoryName = '';
  showCategoryForm = false;

  readonly statusOptions: SelectOption[] = [
    { value: '', label: 'All status' },
    { value: 'false', label: 'Active' },
    { value: 'true', label: 'Completed' },
  ];

  readonly sortByOptions: SelectOption[] = [
    { value: 'createdAt', label: 'Created' },
    { value: 'dueDate', label: 'Due date' },
    { value: 'title', label: 'Title' },
  ];

  readonly sortDirectionOptions: SelectOption[] = [
    { value: 'desc', label: 'Desc' },
    { value: 'asc', label: 'Asc' },
  ];

  private readonly query$ = new Subject<void>();
  private querySub?: Subscription;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.querySub = this.query$
      .pipe(
        debounceTime(350),
        tap(() => {
          this.loading = true;
          this.error = '';
        }),
        switchMap(() => this.taskService.getPaged(this.buildQuery()))
      )
      .subscribe({
        next: res => {
          this.tasks = res.items;
          this.page = res.page;
          this.totalPages = Math.max(1, res.totalPages);
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load tasks.';
          this.loading = false;
        },
      });

    this.auth.ensureSession().subscribe({
      next: () => this.initData(),
      error: () => this.router.navigate(['/login']),
    });
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
  }

  private initData() {
    this.auth.loadCurrentUser().subscribe();
    this.loadCategories();
    this.reloadTasks();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(cats => (this.categories = cats));
  }

  private reloadTasks() {
    this.query$.next();
  }

  resetAndLoad() {
    this.page = 1;
    this.reloadTasks();
  }

  goToPrevPage() {
    if (this.page > 1) {
      this.page--;
      this.reloadTasks();
    }
  }

  goToNextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.reloadTasks();
    }
  }

  private buildQuery() {
    return {
      page: this.page,
      pageSize: this.pageSize,
      search: this.search || undefined,
      categoryId: this.selectedCategoryId || undefined,
      isCompleted: this.filterCompleted === '' ? undefined : this.filterCompleted === 'true',
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    };
  }

  onSearchChange(value: string) {
    this.search = value;
    this.resetAndLoad();
  }

  onFilterChange() {
    this.resetAndLoad();
  }

  openCreateModal() {
    this.editingTask = null;
    this.modalOpen = true;
  }

  openEditModal(task: Task) {
    this.editingTask = task;
    this.modalOpen = true;
  }

  onModalSave(data: Record<string, unknown>) {
    if (this.editingTask) {
      this.taskService.update(this.editingTask.id, data as never).subscribe({
        next: () => {
          this.modalOpen = false;
          this.loadCategories();
          this.reloadTasks();
        },
        error: () => {
          this.error = 'Failed to update task.';
        },
      });
    } else {
      this.taskService.create(data as never).subscribe({
        next: () => {
          this.modalOpen = false;
          this.loadCategories();
          this.reloadTasks();
        },
        error: () => {
          this.error = 'Failed to create task.';
        },
      });
    }
  }

  toggleComplete(task: Task) {
    this.taskService
      .update(task.id, {
        title: task.title,
        description: task.description,
        isCompleted: !task.isCompleted,
        dueDate: task.dueDate,
        categoryId: task.categoryId,
      })
      .subscribe({
        next: () => {
          this.loadCategories();
          this.reloadTasks();
        },
        error: () => {
          this.error = 'Failed to update task status.';
          this.reloadTasks();
        },
      });
  }

  deleteTask(task: Task) {
    this.taskToDelete = task;
    this.deleteConfirmOpen = true;
  }

  cancelDelete() {
    this.deleteConfirmOpen = false;
    this.taskToDelete = null;
  }

  confirmDeleteTask() {
    const task = this.taskToDelete;
    if (!task) return;

    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.deleteConfirmOpen = false;
        this.taskToDelete = null;
        if (this.tasks.length === 1 && this.page > 1) this.page--;
        this.loadCategories();
        this.reloadTasks();
      },
      error: () => {
        this.error = 'Failed to delete task.';
        this.deleteConfirmOpen = false;
        this.taskToDelete = null;
      },
    });
  }

  selectCategory(categoryId: string) {
    this.selectedCategoryId = categoryId;
    this.resetAndLoad();
  }

  addCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.categoryService.create({ name }).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.showCategoryForm = false;
        this.loadCategories();
      },
      error: () => {
        this.error = 'Failed to create category.';
      },
    });
  }

  onDeleteCategory(payload: { category: Category; event: Event }) {
    const { category: cat, event } = payload;
    event.stopPropagation();
    if (!confirm(`Delete category "${cat.name}"? Tasks will be uncategorized.`)) return;
    this.categoryService.delete(cat.id).subscribe({
      next: () => {
        if (this.selectedCategoryId === cat.id) this.selectedCategoryId = '';
        this.loadCategories();
        this.resetAndLoad();
      },
      error: () => {
        this.error = 'Failed to delete category.';
      },
    });
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
