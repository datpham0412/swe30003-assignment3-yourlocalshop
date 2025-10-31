using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assignment_3_SWE30003.Migrations
{
    /// <inheritdoc />
    public partial class UpdateInvoiceToRelateToPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Orders_OrderId",
                table: "Invoices");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "Invoices",
                newName: "PaymentId");

            migrationBuilder.RenameIndex(
                name: "IX_Invoices_OrderId",
                table: "Invoices",
                newName: "IX_Invoices_PaymentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Payments_PaymentId",
                table: "Invoices",
                column: "PaymentId",
                principalTable: "Payments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Payments_PaymentId",
                table: "Invoices");

            migrationBuilder.RenameColumn(
                name: "PaymentId",
                table: "Invoices",
                newName: "OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Invoices_PaymentId",
                table: "Invoices",
                newName: "IX_Invoices_OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Orders_OrderId",
                table: "Invoices",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
