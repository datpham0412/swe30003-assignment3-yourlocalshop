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

        // Accept a pre-initialized CartItem (created by ShoppingCartController).
        // Manage shopping cart items
        public void AddItem(CartItem newItem, int availableQty)
        {
            if (availableQty == 0)
            {
                throw new InvalidOperationException("Product is out of stock.");
            }

            int finalQuantity = Math.Min(newItem.Quantity, availableQty);

            var existingItem = Items.FirstOrDefault(i => i.ProductId == newItem.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity = Math.Min(existingItem.Quantity + finalQuantity, availableQty);
            }
            else
            {
                newItem.Quantity = finalQuantity;
                newItem.ShoppingCartId = this.Id;
                Items.Add(newItem);
            }
        }
        public void UpdateItem(CartItem updatedItem, int availableQty)
        {
            if (availableQty == 0)
            {
                throw new InvalidOperationException("Product is out of stock.");
            }

            var item = Items.FirstOrDefault(i => i.Id == updatedItem.Id);
            if (item == null)
            {
                throw new InvalidOperationException("Cart item not found.");
            }

            int finalQuantity = Math.Min(updatedItem.Quantity, availableQty);
            item.Quantity = finalQuantity;

            item.UnitPrice = updatedItem.UnitPrice;
            item.ProductName = updatedItem.ProductName;
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
        // --------------------------------------------------------------------------------
        // Calculates taxes, and total price
        public void RecalculateTotals(decimal taxRate)
        {
            Subtotal = Items.Sum(i => i.GetSubtotal());
            Tax = Subtotal * taxRate;
            Total = Subtotal + Tax;
        }

        // Create order for checkout
        public Order CreateOrderFromSnapshot(int customerId)
        {
            var order = Order.FromCart(this);
            order.CustomerId = customerId;
            return order;
        }

        // Clear cart items
        public void Clear()
        {
            var itemsToRemove = Items.ToList();
            foreach (var item in itemsToRemove)
            {
                Items.Remove(item);
            }

            Subtotal = 0;
            Tax = 0;
            Total = 0;
        }
    }
}
