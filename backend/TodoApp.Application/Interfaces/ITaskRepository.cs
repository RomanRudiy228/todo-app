using TodoApp.Application.Common;
using TodoApp.Application.DTOs;
using TodoApp.Domain.Entities;

namespace TodoApp.Application.Interfaces;

public interface ITaskRepository
{
    Task<PagedResult<TaskItem>> GetPagedAsync(string userId, TaskQueryParams query, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(TaskItem task, CancellationToken cancellationToken = default);
    void Update(TaskItem task);
    void Delete(TaskItem task);
    Task<bool> CategoryBelongsToUserAsync(string userId, Guid categoryId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
