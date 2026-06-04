using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlaylistService.Auth.DTOs;
using PlayListService.Auth.DTOs;
using PlayListService.Auth.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PlaylistService.Auth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        // private int CurrentUserId => int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 0;
        private int CurrentUserId
        {
            get
            {
                // Перевіряємо за стандартом JWT "sub" (Subject)
                var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)
                            ?? User.FindFirst(ClaimTypes.NameIdentifier)
                            ?? User.FindFirst("sub");

                return int.TryParse(claim?.Value, out var id) ? id : 0;
            }
        }

        private string? CurrentUserEmail => User.FindFirst(ClaimTypes.Email)?.Value;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            _logger.LogInformation($"Registration attempt for email: {request.Email}");
            var response = await _authService.RegisterAsync(request);

            if (!response.Success)
            {
                _logger.LogWarning($"Registration failed for email: {request.Email}. Reason: {response.Message}");
                return BadRequest(response);
            }
            _logger.LogInformation($"User saved to DB. Awaiting email verification for: {request.Email}");
            return Ok(response);
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Email and code are required");
            
            var response = await _authService.VerifyEmailAsync(request);

            if (!response.Success)
            {
                _logger.LogWarning($"Email verification failed for email: {request.Email}. Reason: {response.Message}");
                return BadRequest(response);
            }

            _logger.LogInformation($"Email verified successfully for email: {request.Email}");
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _authService.LoginAsync(request);

            if (!response.Success)
            {
                _logger.LogError($"Login failed for email: {request.Email}. Reason: {response.Message}");
                return BadRequest(response);
            }

            _logger.LogInformation($"User logined successfully with email: {request.Email}");
            return Ok(response);
        }

        [HttpPost("google-login-oauth")]
        public async Task<IActionResult> LoginGoogleOAuth([FromBody] GoogleAuthRequestDto request)
        {
            try
            {
                var response = await _authService.GoogleLoginAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = CurrentUserId;
            if (userId == 0)
            {
                _logger.LogWarning($"Logout attempt failed: Claims missing in token. For userId: {userId}");
                return Unauthorized(new { success = false, message = "Logout attempt failed: Claims missing in token." });
            }
            _logger.LogInformation($"User with ID {userId} is attempting to log out.");
            var response = await _authService.LogoutAsync(userId);

            if (!response.Success)
                return BadRequest(response);
            _logger.LogInformation(response.Message);
            return Ok(response);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _authService.RefreshTokenAsync(request);
            if (!response.Success)
                return Unauthorized(response);

            return Ok(response);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = CurrentUserId;
            var email = CurrentUserEmail;

            if (userId == 0 || string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("Change password attempt failed: Claims missing in token.");
                return Unauthorized(new { success = false, message = "Change password attempt failed" });
            }

            var response = await _authService.ChangePasswordAsync(userId, email, request);

            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [Authorize]
        [HttpDelete("remove-account")]
        public async Task<IActionResult> RemoveUser([FromBody] RemoveUserDto request)
        {
            _logger.LogInformation($"User with ID {request} is attempting to remove their account.");
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Remove account attempt failed: Invalid model state.");
                return BadRequest(ModelState);
            }
            var userId = CurrentUserId;

            if (userId == 0)
            {
                return Unauthorized(new { success = false, message = "User uknown" });
            }

            var response = await _authService.RemoveUserAsync(userId, request);
            _logger.LogInformation($"User with ID {response} is attempting to remove their account.");
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }


    }
}