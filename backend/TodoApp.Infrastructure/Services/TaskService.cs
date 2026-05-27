using TodoApp.Application.Common;
using TodoApp.Application.DTOs;
using TodoApp.Application.Interfaces;
using TodoApp.Domain.Entities;

namespace TodoApp.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<TaskDto>> GetPagedAsync(string userId, TaskQueryParams query, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetPagedAsync(userId, query, cancellationToken);
        return new PagedResult<TaskDto>
        {
            Items = result.Items.Select(MapToDto).ToList(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount
        };
    }

    public async Task<TaskDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _repository.GetByIdAsync(userId, id, cancellationToken);
        return task == null ? null : MapToDto(task);
    }

    public async Task<TaskDto> CreateAsync(string userId, CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        if (request.CategoryId.HasValue &&
            !await _repository.CategoryBelongsToUserAsync(userId, request.CategoryId.Value, cancellationToken))
            throw new InvalidOperationException("Category not found.");

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            DueDate = request.DueDate,
            CategoryId = request.CategoryId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(task, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var created = await _repository.GetByIdAsync(userId, task.Id, cancellationToken);
        return MapToDto(created!);
    }

    public async Task<TaskDto?> UpdateAsync(string userId, Guid id, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var task = await _repository.GetByIdAsync(userId, id, cancellationToken);
        if (task == null) return null;

        if (request.CategoryId.HasValue &&
            !await _repository.CategoryBelongsToUserAsync(userId, request.CategoryId.Value, cancellationToken))
            throw new InvalidOperationException("Category not found.");

        task.Title = request.Title.Trim();
        task.Description = request.Description?.Trim();
        task.IsCompleted = request.IsCompleted;
        task.DueDate = request.DueDate;
        task.CategoryId = request.CategoryId;
        task.UpdatedAt = DateTime.UtcNow;

        _repository.Update(task);
        await _repository.SaveChangesAsync(cancellationToken);

        var updated = await _repository.GetByIdAsync(userId, id, cancellationToken);
        return MapToDto(updated!);
    }

    public async Task<bool> DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _repository.GetByIdAsync(userId, id, cancellationToken);
        if (task == null) return false;

        _repository.Delete(task);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static TaskDto MapToDto(TaskItem task) =>
        new(task.Id, task.Title, task.Description, task.IsCompleted, task.DueDate,
            task.CategoryId, task.Category?.Name, task.CreatedAt, task.UpdatedAt);
}
