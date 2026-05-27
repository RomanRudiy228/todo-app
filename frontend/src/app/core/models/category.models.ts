export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  taskCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  color?: string;
}
