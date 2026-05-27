using Microsoft.AspNetCore.Identity;

namespace TodoApp.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
