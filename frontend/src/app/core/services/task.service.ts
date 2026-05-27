import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateTaskRequest, PagedResult, Task, TaskQuery, UpdateTaskRequest } from '../models/task.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = '/api/tasks';

  constructor(private http: HttpClient) {}

  getPaged(query: TaskQuery) {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('pageSize', String(query.pageSize ?? 10))
      .set('sortBy', query.sortBy ?? 'createdAt')
      .set('sortDirection', query.sortDirection ?? 'desc');

    if (query.search) params = params.set('search', query.search);
    if (query.categoryId) params = params.set('categoryId', query.categoryId);
    if (query.isCompleted !== undefined && query.isCompleted !== null)
      params = params.set('isCompleted', String(query.isCompleted));
    if (query.dueBefore) params = params.set('dueBefore', query.dueBefore);

    return this.http.get<PagedResult<Task>>(this.apiUrl, { params });
  }

  getById(id: string) {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateTaskRequest) {
    return this.http.post<Task>(this.apiUrl, request);
  }

  update(id: string, request: UpdateTaskRequest) {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
