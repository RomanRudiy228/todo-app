using TodoApp.Application.Common;
using TodoApp.Application.DTOs;

namespace TodoApp.Application.Interfaces;

public interface ITaskService
{
    Task<PagedResult<TaskDto>> GetPagedAsync(string userId, TaskQueryParams query, CancellationToken cancellationToken = default);
    Task<TaskDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task<TaskDto> CreateAsync(string userId, CreateTaskRequest request, CancellationToken cancellationToken = default);
    Task<TaskDto?> UpdateAsync(string userId, Guid id, UpdateTaskRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default);
}
