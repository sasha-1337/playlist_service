using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PlaylistService.Auth.Data;
using PlaylistService.Auth.DTOs;
using PlaylistService.Auth.Models;
using PlayListService.Auth.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;

namespace PlayListService.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly AuthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;
        private readonly ILogger<AuthService> _logger;
        private readonly JwtSettings _jwtSettings;
        private readonly GoogleSettings _googleAuthSettings;

        public AuthService(AuthDbContext dbContext, IConfiguration configuration, ILogger<AuthService> logger, IOptions<JwtSettings> jwtSettings, IOptions<GoogleSettings> googleAuthSettings)
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<User>();
            _logger = logger;
            _jwtSettings = jwtSettings.Value;
            _googleAuthSettings = googleAuthSettings.Value;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto request)
        {
            try
            {
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null || !user.IsActive)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid email"
                    };
                }

                var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
                if (result == PasswordVerificationResult.Failed)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid password"
                    };
                }
                user.LastLogin = DateTime.UtcNow;
                
                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

                await _dbContext.SaveChangesAsync();
                _logger.LogInformation($"User {user.Email} logged in successfully");

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    RefreshToken = refreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                        CreatedAt = user.CreatedAt
                    }
                };

            }
            catch (Exception ex)
            {
                _logger.LogError($"Error occurred during user login: {ex.Message}");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during login. Please try again later."
                };
            }
        }
        public async Task<AuthResponseDto> RegisterAsync(RegisterDto request)
        {
            try
            {
                var existingUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email ||
                                                                                   u.Username == request.Username);
                if (existingUser != null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "User with the same email or username already exists"
                    };
                }

                var user = new User
                {
                    Email = request.Email,
                    Username = request.Username,
                    CreatedAt = DateTime.UtcNow,
                };

                user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation($"User {user.Email} registered successfully");
                return new AuthResponseDto
                {
                    Success = true,
                    Message = "User registered successfully",
                    Token = token,
                    RefreshToken = refreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                        CreatedAt = user.CreatedAt
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error occurred during user registration: {ex.Message}");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during registration. Please try again later."
                };
            }
        }
        public async Task<AuthResponseDto> GoogleLoginAsync(GoogleAuthRequestDto request)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = [_googleAuthSettings.ClientId]
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
               
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);
                bool isNewUser = false;
                if (user == null)
                {
                    isNewUser = true;
                    user = new User
                    {
                        Email = payload.Email,
                        Username = payload.Name,
                        AuthProvider = "Google",
                        ExternalId = payload.Subject,
                        CreatedAt = DateTime.UtcNow
                    };
                    _dbContext.Users.Add(user);
                }
                else
                {
                    user.LastLogin = DateTime.UtcNow;
                }

                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

                await _dbContext.SaveChangesAsync();

                if (isNewUser)
                    _logger.LogInformation("New user created with Google account: {Email}", user.Email);
                else
                    _logger.LogInformation("Existing user logged in with Google account: {Email}", user.Email);

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Google login successful",
                    Token = token,
                    RefreshToken = refreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                        CreatedAt = user.CreatedAt
                    }
                };
            }
            catch (InvalidJwtException ex)
            {
                _logger.LogWarning("Invalid Google token attempt: {Message}", ex.Message);
                return new AuthResponseDto { Success = false, Message = "Invalid Google token." };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error occurred during Google login: {ex.Message}");
                return new AuthResponseDto { Success = false, Message = "An error occurred during Google login. Please try again later." };
            }
        }
        public async Task<AuthResponseDto> ChangePasswordAsync(int userId, string email, ChangePasswordDto request)
        {
            try
            {
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Email == email);
                if (user == null || !user.IsActive)
                    return new AuthResponseDto { Success = false, Message = "User not found or inactive" };

                var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.OldPassword);
                if (result == PasswordVerificationResult.Failed)
                    return new AuthResponseDto{ Success = false, Message = "Entered password is incorrect" };
                
                user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation($"User {user.Email} changed password successfully");
                return new AuthResponseDto{ Success = true, Message = "Password changed successfully" };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error occurred during password change: {ex.Message}");
                return new AuthResponseDto{ Success = false, Message = "An error occurred during password change." };
            }
        }

        public async Task<AuthResponseDto> LogoutAsync(int userId)
        {
            try
            {
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null || !user.IsActive)
                    return new AuthResponseDto { Success = false, Message = $"User not found or bad token {userId}" };
                
                user.RefreshToken = null;
                user.RefreshTokenExpiry = null;
                
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation($"User Id: {user.Id} Email: {user.Email} logged out successfully");

                return new AuthResponseDto { Success = true, Message = "Logout successful" };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error occurred during user logout: {ex.Message}");
                return new AuthResponseDto { Success = false, Message = "An error occurred during logout" };
            }
        }

        public async Task<AuthResponseDto> RemoveUserAsync(int userId, RemoveUserDto request)
        {
            try
            {
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null) 
                    return new AuthResponseDto { Success = false, Message = "User not found" };
                
                var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
                if (result == PasswordVerificationResult.Failed)
                    return new AuthResponseDto { Success = false, Message = "Entered password is incorrect" };

                _logger.LogInformation($"User Id: {user.Id} Email: {user.Email} is being removed");

                await _dbContext.Users.Where(u => u.Id == userId).ExecuteDeleteAsync();

                return new AuthResponseDto { Success = true, Message = "User removed successfully" };
            }
            catch
            {
                _logger.LogInformation($"Error occurred during user removal for user ID {userId}");
                return new AuthResponseDto { Success = false, Message = "An error occurred during user removal" };
            }
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto request)
        {
            try
            {
                var principal = GetPrincipalFromExpiredToken(request.AccessToken);

                var userIdClaim = int.Parse(principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? "0");
                var emailClaim = principal?.FindFirst(JwtRegisteredClaimNames.Email)?.Value;

                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userIdClaim && 
                                                                           u.Email == emailClaim && u.IsActive);

                if (user == null)
                    return new AuthResponseDto{Success = false,Message = "User not found or inactive"};
                
                if (request.RefreshToken != user.RefreshToken || 
                    user.RefreshTokenExpiry <= DateTime.UtcNow)
                    return new AuthResponseDto { Success = false, Message = "Invalid token" };
                
                
                var newAccessToken = GenerateJwtToken(user);
                var newRefreshToken = GenerateRefreshToken();
                
                user.RefreshToken = newRefreshToken;

                await _dbContext.SaveChangesAsync();

                _logger.LogInformation($"Token refreshed for user Id: {user.Id} Email: {user.Email}");

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Token refreshed successfully",
                    Token = newAccessToken,
                    RefreshToken = newRefreshToken,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                        CreatedAt = user.CreatedAt
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error occurred during token refresh: {ex.Message}");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during token refresh. Please log in again."
                };
            }
        }


        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = securityKey,
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

            if (!(securityToken is JwtSecurityToken jwtSecurityToken) ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }

            return principal;
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),

                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}