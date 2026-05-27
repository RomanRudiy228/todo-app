using Microsoft.EntityFrameworkCore;
using TodoApp.Application.Interfaces;
using TodoApp.Domain.Entities;
using TodoApp.Infrastructure.Data;

namespace TodoApp.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Category>> GetAllByUserAsync(string userId, CancellationToken cancellationToken = default) =>
        await _context.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Include(c => c.Tasks)
            .ToListAsync(cancellationToken);

    public Task<Category?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default) =>
        _context.Categories
            .Include(c => c.Tasks)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId, cancellationToken);

    public Task<Category?> GetByNameAsync(string userId, string name, CancellationToken cancellationToken = default) =>
        _context.Categories
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Name.ToLower() == name.ToLower(), cancellationToken);

    public async Task AddAsync(Category category, CancellationToken cancellationToken = default) =>
        await _context.Categories.AddAsync(category, cancellationToken);

    public void Update(Category category) => _context.Categories.Update(category);

    public void Delete(Category category) => _context.Categories.Remove(category);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);
}
