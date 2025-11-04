namespace Assignment_3_SWE30003.Models
{
    public enum OrderStatus
    {
        PendingPayment,
        Paid,
        Processing,
        Packed,
        Shipped,
        Delivered,
        Failed,
        Cancelled
    }

    // Represents a customer order with order items, status, pricing details, and shipping information.
    public class Order
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public OrderStatus Status { get; private set; } = OrderStatus.PendingPayment;

        public decimal Subtotal { get; private set; }
        public decimal Tax { get; private set; }
        public decimal Total { get; private set; }

        public ICollection<OrderLine> Lines { get; set; } = new List<OrderLine>();

        public Shipment? Shipment { get; set; }

        public string? ShipmentAddress { get; set; }
        public string? ContactName { get; set; }
        public string? ContactPhone { get; set; }
        public string? Note { get; set; }

        // Creates an order from a shopping cart snapshot, copying all items and totals.
        public static Order FromCart(ShoppingCart cart)
        {
            var order = new Order
            {
                CustomerId = cart.CustomerId,
                Subtotal = cart.Subtotal,
                Tax = cart.Tax,
                Total = cart.Total,
                OrderDate = DateTime.UtcNow,
                Status = OrderStatus.PendingPayment
            };

            // Copy cart items to order lines
            foreach (var item in cart.Items)
            {
                var orderLine = new OrderLine
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    UnitPrice = item.UnitPrice,
                    Quantity = item.Quantity,
                    LineTotal = item.GetSubtotal()
                };
                order.Lines.Add(orderLine);
            }

            return order;
        }

        // Transitions order status from PendingPayment to Paid.
        public void SetStatusPaid()
        {
            if (Status != OrderStatus.PendingPayment)
            {
                throw new InvalidOperationException($"Cannot mark as Paid from {Status} status.");
            }
            Status = OrderStatus.Paid;
        }

        // Transitions order status from Paid to Processing.
        public void AdvanceToProcessing()
        {
            if (Status != OrderStatus.Paid)
            {
                throw new InvalidOperationException($"Cannot advance to Processing from {Status} status.");
            }
            Status = OrderStatus.Processing;
        }

        // Transitions order status from Processing to Packed.
        public void MarkPacked()
        {
            if (Status != OrderStatus.Processing)
            {
                throw new InvalidOperationException($"Cannot mark as Packed from {Status} status.");
            }
            Status = OrderStatus.Packed;
        }

        // Transitions order status from Packed to Shipped.
        public void MarkShipped()
        {
            if (Status != OrderStatus.Packed)
            {
                throw new InvalidOperationException($"Cannot mark as Shipped from {Status} status.");
            }
            Status = OrderStatus.Shipped;
        }

        // Transitions order status from Shipped to Delivered.
        public void MarkDelivered()
        {
            if (Status != OrderStatus.Shipped)
            {
                throw new InvalidOperationException($"Cannot mark as Delivered from {Status} status.");
            }
            Status = OrderStatus.Delivered;
        }

        // Marks order as Failed if not already delivered.
        public void MarkFailed()
        {
            if (Status == OrderStatus.Delivered)
            {
                throw new InvalidOperationException("Cannot mark a delivered order as Failed.");
            }
            Status = OrderStatus.Failed;
        }

        // Cancels order if not yet packed, shipped, or delivered.
        public void MarkCancelled()
        {
            if (Status == OrderStatus.Delivered || Status == OrderStatus.Shipped || Status == OrderStatus.Packed)
            {
                throw new InvalidOperationException($"Cannot cancel order in {Status} status.");
            }
            Status = OrderStatus.Cancelled;
        }

        // Deducts inventory stock for all order items using the provided deduction callback.
        public void ApplyStockDeduction(Action<int, int> deductByProductId)
        {
            if (Status != OrderStatus.Paid)
            {
                throw new InvalidOperationException("Can only deduct stock for paid orders.");
            }

            foreach (var line in Lines)
            {
                deductByProductId(line.ProductId, line.Quantity);
            }
        }
    }
}
