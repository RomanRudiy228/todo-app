using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Api.Helpers;
using TodoApp.Application.DTOs;
using TodoApp.Application.Interfaces;

namespace TodoApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public AuthController(IAuthService authService, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _authService = authService;
        _configuration = configuration;
        _environment = environment;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _authService.RegisterAsync(request, cancellationToken);
            SetRefreshCookie(result.RefreshToken);
            return Ok(result.Response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _authService.LoginAsync(request, cancellationToken);
            SetRefreshCookie(result.RefreshToken);
            return Ok(result.Response);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(CancellationToken cancellationToken)
    {
        var refreshToken = CookieHelper.GetRefreshTokenFromCookie(Request);
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { message = "Refresh token not found." });

        var result = await _authService.RefreshTokenAsync(refreshToken, cancellationToken);
        if (result == null)
        {
            CookieHelper.DeleteRefreshTokenCookie(Response, UseSecureCookies());
            return Unauthorized(new { message = "Invalid or expired refresh token." });
        }

        SetRefreshCookie(result.RefreshToken);
        return Ok(result.Response);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var refreshToken = CookieHelper.GetRefreshTokenFromCookie(Request);
        if (!string.IsNullOrEmpty(refreshToken))
            await _authService.LogoutAsync(refreshToken, cancellationToken);

        CookieHelper.DeleteRefreshTokenCookie(Response, UseSecureCookies());
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _authService.GetCurrentUserAsync(userId, cancellationToken);
        return user == null ? NotFound() : Ok(user);
    }

    private void SetRefreshCookie(string token)
    {
        var days = int.Parse(_configuration["Jwt:RefreshTokenDays"] ?? "7");
        CookieHelper.SetRefreshTokenCookie(Response, token, days, UseSecureCookies());
    }

    private bool UseSecureCookies() => !_environment.IsDevelopment();
}
