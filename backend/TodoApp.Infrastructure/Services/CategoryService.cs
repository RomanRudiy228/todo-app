using TodoApp.Application.DTOs;
using TodoApp.Application.Interfaces;
using TodoApp.Domain.Entities;

namespace TodoApp.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        var categories = await _repository.GetAllByUserAsync(userId, cancellationToken);
        return categories.Select(MapToDto).ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _repository.GetByIdAsync(userId, id, cancellationToken);
        return category == null ? null : MapToDto(category);
    }

    public async Task<CategoryDto> CreateAsync(string userId, CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByNameAsync(userId, request.Name, cancellationToken);
        if (existing != null)
            throw new InvalidOperationException("Category with this name already exists.");

        var category = new Category
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name.Trim(),
            Color = request.Color
        };

        await _repository.AddAsync(category, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapToDto(category);
    }

    public async Task<CategoryDto?> UpdateAsync(string userId, Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = await _repository.GetByIdAsync(userId, id, cancellationToken);
        if (category == null) return null;

        var duplicate = await _repository.GetByNameAsync(userId, request.Name, cancellationToken);
        if (duplicate != null && duplicate.Id != id)
            throw new InvalidOperationException("Category with this name already exists.");

        category.Name = request.Name.Trim();
        category.Color = request.Color;
        _repository.Update(category);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapToDto(category);
    }

    public async Task<bool> DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _repository.GetByIdAsync(userId, id, cancellationToken);
        if (category == null) return false;

        _repository.Delete(category);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static CategoryDto MapToDto(Category category) =>
        new(category.Id, category.Name, category.Color, category.CreatedAt, category.Tasks?.Count ?? 0);
}
