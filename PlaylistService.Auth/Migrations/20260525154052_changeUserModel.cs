using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlaylistService.Auth.Migrations
{
    /// <inheritdoc />
    public partial class changeUserModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailConfirmationCode",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailConfirmationCode",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
