using System.ComponentModel.DataAnnotations;

namespace TodoApp.Application.DTOs;

public record RegisterRequest(
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password,
    string? UserName);

public record LoginRequest(
    [Required][EmailAddress] string Email,
    [Required] string Password);

public record AuthResponse(string AccessToken, DateTime ExpiresAt);

public record AuthResult(AuthResponse Response, string RefreshToken);

public record UserDto(string Id, string Email, string? UserName);
