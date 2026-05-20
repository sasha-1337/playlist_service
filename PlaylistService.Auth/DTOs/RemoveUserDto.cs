using System.ComponentModel.DataAnnotations;

namespace PlayListService.Auth.DTOs
{
    public class RemoveUserDto
    {
        [Required(ErrorMessage = "Password is required to confirm deletion")]
        public required string Password { get; set; }
    }
}