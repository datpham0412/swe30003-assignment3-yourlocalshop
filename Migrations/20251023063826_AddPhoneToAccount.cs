using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assignment_3_SWE30003.Migrations
{
    /// <inheritdoc />
    public partial class AddPhoneToAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Accounts",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Accounts");
        }
    }
}
