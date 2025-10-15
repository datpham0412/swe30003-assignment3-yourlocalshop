using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assignment_3_SWE30003.Migrations
{
    /// <inheritdoc />
    public partial class AddIsInCatalogueToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Catalogues_CatalogueId",
                table: "Products");

            migrationBuilder.DropTable(
                name: "Catalogues");

            migrationBuilder.DropIndex(
                name: "IX_Products_CatalogueId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "CatalogueId",
                table: "Products");

            migrationBuilder.AddColumn<bool>(
                name: "IsInCatalogue",
                table: "Products",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ProductId1",
                table: "Inventories",
                type: "INTEGER",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_Products_ProductId1",
                table: "Inventories");

            migrationBuilder.DropIndex(
                name: "IX_Inventories_ProductId1",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "IsInCatalogue",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ProductId1",
                table: "Inventories");

            migrationBuilder.AddColumn<int>(
                name: "CatalogueId",
                table: "Products",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Catalogues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Catalogues", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_CatalogueId",
                table: "Products",
                column: "CatalogueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Catalogues_CatalogueId",
                table: "Products",
                column: "CatalogueId",
                principalTable: "Catalogues",
                principalColumn: "Id");
        }
    }
}
