namespace Assignment_3_SWE30003.Models
{
    // Represents an individual item in a shopping cart with product details, quantity, and price information.
    public class CartItem
    {
        public int Id { get; set; }
        public int ShoppingCartId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }

        // Calculates the total price for this cart item (unit price × quantity).
        public decimal GetSubtotal() => UnitPrice * Quantity;
    }
}
