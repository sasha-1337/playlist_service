
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PlaylistService.Auth.Data;
using PlaylistService.Auth.Models;
using PlayListService.Auth.DTOs;
using PlayListService.Auth.Strategy;

namespace PlaylistService.Auth.Strategy
{
    public class RemoveAccountStrategy : IAuthStrategy
    {
        private readonly AuthDbContext _dbContext;
        private readonly ILogger<RemoveAccountStrategy> _logger;

        public string ActionType => "RemoveAccount";

        public RemoveAccountStrategy(AuthDbContext authDbContext, ILogger<RemoveAccountStrategy> logger)
        {
            _dbContext = authDbContext;
            _logger = logger;
        }
        public async Task<AuthResponseDto> ExecuteAsync(string email, string jsonData, int? userId)
        {

            await _dbContext.Users.Where(u => u.Id == userId).ExecuteDeleteAsync();

            _logger.LogInformation($"User {userId}, Email: {email} removed their account");

            return new AuthResponseDto { Success = true, Message = "User removed successfully" };

        }
    }
}