using System.ComponentModel.DataAnnotations;

namespace TodoApp.Application.DTOs;

public record TaskDto(
    Guid Id,
    string Title,
    string? Description,
    bool IsCompleted,
    DateTime? DueDate,
    Guid? CategoryId,
    string? CategoryName,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateTaskRequest(
    [Required][MaxLength(200)] string Title,
    [MaxLength(2000)] string? Description,
    DateTime? DueDate,
    Guid? CategoryId);

public record UpdateTaskRequest(
    [Required][MaxLength(200)] string Title,
    [MaxLength(2000)] string? Description,
    bool IsCompleted,
    DateTime? DueDate,
    Guid? CategoryId);

public record TaskQueryParams
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Search { get; init; }
    public Guid? CategoryId { get; init; }
    public bool? IsCompleted { get; init; }
    public DateTime? DueBefore { get; init; }
    public string SortBy { get; init; } = "createdAt";
    public string SortDirection { get; init; } = "desc";
}
