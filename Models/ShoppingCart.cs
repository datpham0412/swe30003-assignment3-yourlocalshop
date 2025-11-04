namespace Assignment_3_SWE30003.Models
{
    // Represents a customer's shopping cart containing items, with subtotal, tax, and total calculations.
    public class ShoppingCart
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
        public decimal Subtotal { get; private set; }
        public decimal Tax { get; private set; }
        public decimal Total { get; private set; }

        // Adds a new item to the cart or updates quantity if item already exists, respecting available stock.
        public void AddItem(CartItem newItem, int availableQty)
        {
            if (availableQty == 0)
            {
                throw new InvalidOperationException("Product is out of stock.");
            }

            // Limit quantity to available stock
            int finalQuantity = Math.Min(newItem.Quantity, availableQty);

            // Check if item already in cart
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

        // Updates an existing cart item's quantity and details, respecting available stock.
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

            // Update quantity within available stock limits
            int finalQuantity = Math.Min(updatedItem.Quantity, availableQty);
            item.Quantity = finalQuantity;

            // Update product details
            item.UnitPrice = updatedItem.UnitPrice;
            item.ProductName = updatedItem.ProductName;
        }

        // Removes a specific item from the cart by its ID.
        public void RemoveItem(int cartItemId)
        {
            var item = Items.FirstOrDefault(i => i.Id == cartItemId);
            if (item == null)
            {
                throw new InvalidOperationException("Cart item not found.");
            }

            Items.Remove(item);
        }

        // Recalculates cart subtotal, tax, and total based on current items and tax rate.
        public void RecalculateTotals(decimal taxRate)
        {
            Subtotal = Items.Sum(i => i.GetSubtotal());
            Tax = Subtotal * taxRate;
            Total = Subtotal + Tax;
        }

        // Creates an order snapshot from the current cart state for checkout.
        public Order CreateOrderFromSnapshot(int customerId)
        {
            var order = Order.FromCart(this);
            order.CustomerId = customerId;
            return order;
        }

        // Clears all items from the cart and resets totals to zero.
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
