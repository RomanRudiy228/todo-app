using System.ComponentModel.DataAnnotations;

namespace TodoApp.Application.DTOs;

public record CategoryDto(Guid Id, string Name, string? Color, DateTime CreatedAt, int TaskCount);

public record CreateCategoryRequest(
    [Required][MaxLength(100)] string Name,
    [MaxLength(20)] string? Color);

public record UpdateCategoryRequest(
    [Required][MaxLength(100)] string Name,
    [MaxLength(20)] string? Color);
