using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assignment_3_SWE30003.Migrations
{
    /// <inheritdoc />
    public partial class InitNew : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_Products_ProductId1",
                table: "Inventories");

            migrationBuilder.DropIndex(
                name: "IX_Inventories_ProductId",
                table: "Inventories");

            migrationBuilder.DropIndex(
                name: "IX_Inventories_ProductId1",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "ProductId1",
                table: "Inventories");

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_ProductId",
                table: "Inventories",
                column: "ProductId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Inventories_ProductId",
                table: "Inventories");

            migrationBuilder.AddColumn<int>(
                name: "ProductId1",
                table: "Inventories",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_ProductId",
                table: "Inventories",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_ProductId1",
                table: "Inventories",
                column: "ProductId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_Products_ProductId1",
                table: "Inventories",
                column: "ProductId1",
                principalTable: "Products",
                principalColumn: "Id");
        }
    }
}
