namespace Assignment_3_SWE30003.Models
{
    public class ShoppingCart
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
        public decimal Subtotal { get; private set; }
        public decimal Tax { get; private set; }
        public decimal Total { get; private set; }

        public void AddItem(int productId, int quantity, Product product, int availableQty)
        {
            if (availableQty == 0)
            {
                throw new InvalidOperationException("Product is out of stock.");
            }

            // Clamp quantity to available stock
            int finalQuantity = Math.Min(quantity, availableQty);

            // Check if item already exists in cart
            var existingItem = Items.FirstOrDefault(i => i.ProductId == productId);
            if (existingItem != null)
            {
                // Update existing item quantity (clamped to available)
                existingItem.Quantity = Math.Min(existingItem.Quantity + finalQuantity, availableQty);
            }
            else
            {
                // Add new item
                var cartItem = new CartItem
                {
                    ProductId = productId,
                    ProductName = product.Name,
                    UnitPrice = product.Price,
                    Quantity = finalQuantity,
                    ShoppingCartId = this.Id
                };
                Items.Add(cartItem);
            }
        }

        public void UpdateItem(int cartItemId, int quantity, Product product, int availableQty)
        {
            if (availableQty == 0)
            {
                throw new InvalidOperationException("Product is out of stock.");
            }

            var item = Items.FirstOrDefault(i => i.Id == cartItemId);
            if (item == null)
            {
                throw new InvalidOperationException("Cart item not found.");
            }

            // Clamp quantity to available stock
            int finalQuantity = Math.Min(quantity, availableQty);
            item.Quantity = finalQuantity;

            // Update price in case it changed
            item.UnitPrice = product.Price;
            item.ProductName = product.Name;
        }

        public void RemoveItem(int cartItemId)
        {
            var item = Items.FirstOrDefault(i => i.Id == cartItemId);
            if (item == null)
            {
                throw new InvalidOperationException("Cart item not found.");
            }

            Items.Remove(item);
        }

        public void RecalculateTotals(decimal taxRate)
        {
            Subtotal = Items.Sum(i => i.Subtotal);
            Tax = Subtotal * taxRate;
            Total = Subtotal + Tax;
        }

        public Order CreateOrderFromSnapshot(int customerId)
        {
            var order = Order.FromCart(this);
            order.CustomerId = customerId;
            return order;
        }

        public void Clear()
        {
            Items.Clear();
            Subtotal = 0;
            Tax = 0;
            Total = 0;
        }
    }
}
