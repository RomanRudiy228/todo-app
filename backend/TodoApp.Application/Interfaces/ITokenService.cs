using TodoApp.Domain.Entities;

namespace TodoApp.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user);
    string GenerateRefreshToken();
    DateTime GetAccessTokenExpiry();
}
