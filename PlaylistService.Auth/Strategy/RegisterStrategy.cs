using Microsoft.AspNetCore.Identity;
using PlaylistService.Auth.Data;
using PlaylistService.Auth.Models;
using PlayListService.Auth.DTOs;
using PlayListService.Auth.Strategy;
using Microsoft.EntityFrameworkCore;
using PlaylistService.Auth.Services;

public class RegisterStrategy : IAuthStrategy
{
    private readonly AuthDbContext _dbContext;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly ILogger<RegisterStrategy> _logger;

    public string ActionType => "Register";

    public RegisterStrategy(AuthDbContext dbContext, ITokenService tokenService, ILogger<RegisterStrategy> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = new PasswordHasher<User>();
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<AuthResponseDto> ExecuteAsync(string email, string jsonData, int? userId)
    {
        var data = System.Text.Json.JsonSerializer.Deserialize<RegisterCacheData>(jsonData);

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User { Email = email, Username = data.Username, CreatedAt = DateTime.UtcNow };
            _dbContext.Users.Add(user);
        }
        else
        {
            user.Username = data.Username;
            user.CreatedAt = DateTime.UtcNow;
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, data.Password);
        user.IsEmailConfirmed = true;

        var token = _tokenService.GenerateJwtToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation($"User registered and verified successfully with email: {user.Email}");

        return new AuthResponseDto
        {
            Success = true,
            Message = "User registered and verified successfully",
            Token = token,
            RefreshToken = refreshToken,
            User = new UserDto { Id = user.Id, Email = user.Email, Username = user.Username, CreatedAt = user.CreatedAt }
        };
    }
}

public record RegisterCacheData(string Username, string Password);