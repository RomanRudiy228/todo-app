using TodoApp.Domain.Entities;

namespace TodoApp.Application.Interfaces;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetAllByUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<Category?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task<Category?> GetByNameAsync(string userId, string name, CancellationToken cancellationToken = default);
    Task AddAsync(Category category, CancellationToken cancellationToken = default);
    void Update(Category category);
    void Delete(Category category);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
