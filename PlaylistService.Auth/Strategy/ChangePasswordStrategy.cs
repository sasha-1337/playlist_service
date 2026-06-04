using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PlaylistService.Auth.Data;
using PlaylistService.Auth.Models;
using PlayListService.Auth.DTOs;
using PlayListService.Auth.Strategy;

namespace PlaylistService.Auth.Strategy
{
    public class ChangePasswordStrategy : IAuthStrategy
    {
        private readonly AuthDbContext _dbContext;
        private readonly PasswordHasher<User> _passwordHasher;
        private readonly ILogger<ChangePasswordStrategy> _logger;

        public string ActionType => "ChangePassword";

        public ChangePasswordStrategy(AuthDbContext dbContext, ILogger<ChangePasswordStrategy> logger)
        {
            _dbContext = dbContext;
            _passwordHasher = new PasswordHasher<User>();
            _logger = logger;
        }

        public async Task<AuthResponseDto> ExecuteAsync(string email, string jsonData, int? userId)
        {
            var data = System.Text.Json.JsonSerializer.Deserialize<ChangePasswordCacheData>(jsonData);

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Email == email);
            if (user == null || !user.IsActive)
                return new AuthResponseDto { Success = false, Message = "User not found or inactive" };

            user.PasswordHash = data!.NewPasswordHash;
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation($"User {user.Email} changed password successfully via strategy.");
            return new AuthResponseDto { Success = true, Message = "Password changed successfully" };
        }
    }
}

record ChangePasswordCacheData(string NewPasswordHash);