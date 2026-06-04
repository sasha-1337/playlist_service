using PlayListService.Auth.DTOs;

namespace PlayListService.Auth.Strategy;

public interface IAuthStrategy
{
	string ActionType { get; }
	Task<AuthResponseDto> ExecuteAsync(string email, string jsonData, int? userId);
}