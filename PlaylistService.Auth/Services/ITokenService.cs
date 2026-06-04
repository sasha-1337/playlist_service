using System.Security.Claims;
using PlaylistService.Auth.Models;

namespace PlaylistService.Auth.Services
{
    public interface ITokenService
    {
        string GenerateJwtToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
    }
}