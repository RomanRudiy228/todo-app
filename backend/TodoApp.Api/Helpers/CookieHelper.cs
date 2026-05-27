namespace TodoApp.Api.Helpers;

public static class CookieHelper
{
    public const string RefreshTokenCookieName = "refresh_token";

    public static void SetRefreshTokenCookie(HttpResponse response, string token, int days, bool secure)
    {
        response.Cookies.Append(RefreshTokenCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(days),
            Path = "/"
        });
    }

    public static void DeleteRefreshTokenCookie(HttpResponse response, bool secure)
    {
        response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });
    }

    public static string? GetRefreshTokenFromCookie(HttpRequest request) =>
        request.Cookies[RefreshTokenCookieName];
}
