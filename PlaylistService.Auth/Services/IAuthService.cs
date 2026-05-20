using PlaylistService.Auth.DTOs;
using PlayListService.Auth.DTOs;

namespace PlayListService.Auth.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto request);
        Task<AuthResponseDto> LoginAsync(LoginDto request);
        Task<AuthResponseDto> GoogleLoginAsync(GoogleAuthRequestDto request);
        Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto request);
        Task<AuthResponseDto> LogoutAsync(int userId);
        Task<AuthResponseDto> ChangePasswordAsync(int userId, string email, ChangePasswordDto request);
        Task<AuthResponseDto> RemoveUserAsync(int userId, RemoveUserDto request);
    }
}
