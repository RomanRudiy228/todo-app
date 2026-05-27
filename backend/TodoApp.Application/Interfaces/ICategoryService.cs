using TodoApp.Application.DTOs;

namespace TodoApp.Application.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default);
    Task<CategoryDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateAsync(string userId, CreateCategoryRequest request, CancellationToken cancellationToken = default);
    Task<CategoryDto?> UpdateAsync(string userId, Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default);
}
