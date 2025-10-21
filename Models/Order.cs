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

            foreach (var item in cart.Items)
            {
                var orderLine = new OrderLine
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    UnitPrice = item.UnitPrice,
                    Quantity = item.Quantity,
                    LineTotal = item.Subtotal
                };
                order.Lines.Add(orderLine);
            }

            return order;
        }

        public void SetStatusPaid()
        {
            if (Status != OrderStatus.PendingPayment)
            {
                throw new InvalidOperationException($"Cannot mark as Paid from {Status} status.");
            }
            Status = OrderStatus.Paid;
        }

        public void AdvanceToProcessing()
        {
            if (Status != OrderStatus.Paid)
            {
                throw new InvalidOperationException($"Cannot advance to Processing from {Status} status.");
            }
            Status = OrderStatus.Processing;
        }

        public void MarkPacked()
        {
            if (Status != OrderStatus.Processing)
            {
                throw new InvalidOperationException($"Cannot mark as Packed from {Status} status.");
            }
            Status = OrderStatus.Packed;
        }

        public void MarkShipped()
        {
            if (Status != OrderStatus.Packed)
            {
                throw new InvalidOperationException($"Cannot mark as Shipped from {Status} status.");
            }
            Status = OrderStatus.Shipped;
        }

        public void MarkDelivered()
        {
            if (Status != OrderStatus.Shipped)
            {
                throw new InvalidOperationException($"Cannot mark as Delivered from {Status} status.");
            }
            Status = OrderStatus.Delivered;
        }

        public void MarkFailed()
        {
            if (Status == OrderStatus.Delivered)
            {
                throw new InvalidOperationException("Cannot mark a delivered order as Failed.");
            }
            Status = OrderStatus.Failed;
        }

        public void MarkCancelled()
        {
            if (Status == OrderStatus.Delivered || Status == OrderStatus.Shipped || Status == OrderStatus.Packed)
            {
                throw new InvalidOperationException($"Cannot cancel order in {Status} status.");
            }
            Status = OrderStatus.Cancelled;
        }

        // Step 3 placeholder methods (stubs for future implementation)
        public void ValidateAvailabilityForPayment(Func<int, int> getAvailableQty)
        {
            // Stub: Will be implemented in Step 3
            // Check each order line against current inventory
            foreach (var line in Lines)
            {
                int availableQty = getAvailableQty(line.ProductId);
                if (availableQty < line.Quantity)
                {
                    throw new InvalidOperationException($"Insufficient stock for {line.ProductName}. Available: {availableQty}, Required: {line.Quantity}");
                }
            }
        }

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
