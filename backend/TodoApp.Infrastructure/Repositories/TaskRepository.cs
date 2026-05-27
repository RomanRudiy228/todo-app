using Microsoft.EntityFrameworkCore;
using TodoApp.Application.Common;
using TodoApp.Application.DTOs;
using TodoApp.Application.Interfaces;
using TodoApp.Domain.Entities;
using TodoApp.Infrastructure.Data;

namespace TodoApp.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<TaskItem>> GetPagedAsync(string userId, TaskQueryParams query, CancellationToken cancellationToken = default)
    {
        var q = _context.Tasks
            .AsNoTracking()
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            q = q.Where(t =>
                t.Title.ToLower().Contains(search) ||
                (t.Description != null && t.Description.ToLower().Contains(search)));
        }

        if (query.CategoryId.HasValue)
            q = q.Where(t => t.CategoryId == query.CategoryId);

        if (query.IsCompleted.HasValue)
            q = q.Where(t => t.IsCompleted == query.IsCompleted);

        if (query.DueBefore.HasValue)
            q = q.Where(t => t.DueDate != null && t.DueDate <= query.DueBefore);

        q = ApplySorting(q, query.SortBy, query.SortDirection);

        var totalCount = await q.CountAsync(cancellationToken);
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<TaskItem>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public Task<TaskItem?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default) =>
        _context.Tasks
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, cancellationToken);

    public async Task AddAsync(TaskItem task, CancellationToken cancellationToken = default) =>
        await _context.Tasks.AddAsync(task, cancellationToken);

    public void Update(TaskItem task) => _context.Tasks.Update(task);

    public void Delete(TaskItem task) => _context.Tasks.Remove(task);

    public Task<bool> CategoryBelongsToUserAsync(string userId, Guid categoryId, CancellationToken cancellationToken = default) =>
        _context.Categories.AnyAsync(c => c.Id == categoryId && c.UserId == userId, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);

    private static IQueryable<TaskItem> ApplySorting(IQueryable<TaskItem> query, string sortBy, string sortDirection)
    {
        var desc = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);

        return sortBy.ToLowerInvariant() switch
        {
            "title" => desc ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            "duedate" => desc
                ? query.OrderByDescending(t => t.DueDate ?? DateTime.MaxValue)
                : query.OrderBy(t => t.DueDate ?? DateTime.MaxValue),
            "iscompleted" => desc ? query.OrderByDescending(t => t.IsCompleted) : query.OrderBy(t => t.IsCompleted),
            _ => desc ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt)
        };
    }
}
