using System.ComponentModel.DataAnnotations;

namespace PlaylistService.Auth.DTOs
{
    public class GoogleAuthRequestDto
    {
        [Required(ErrorMessage = "Token is required")]
        public required string IdToken { get; set; }
    }
}