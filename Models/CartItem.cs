namespace Assignment_3_SWE30003.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public int ShoppingCartId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        // Calculates subtotal for the cart item
        public decimal GetSubtotal() => UnitPrice * Quantity;
    }
}
