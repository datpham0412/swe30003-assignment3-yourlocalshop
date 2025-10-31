namespace Assignment_3_SWE30003.Models
{
    public enum PaymentStatus
    {
        Pending,
        Success,
        Failed
    }

    public class Payment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string Method { get; set; } = "CreditCard";
        public decimal Amount { get; set; }
        public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
        public DateTime PaymentDate { get; private set; } = DateTime.UtcNow;
        public Order Order { get; set; } = default!;
        public Invoice? Invoice { get; set; }

        // Constructor to create Payment with Order details
        public Payment(Order order)
        {
            if (order == null)
            {
                throw new ArgumentNullException(nameof(order), "Order cannot be null.");
            }

            if (order.Status != OrderStatus.PendingPayment)
            {
                throw new InvalidOperationException($"Order is not pending payment. Current status: {order.Status}");
            }

            OrderId = order.Id;
            Order = order;
            Amount = order.Total;
            Method = "CreditCard";
        }

        // Parameterless constructor for EF Core
        public Payment() { }

        // Process payment
        public void ProcessPayment(Action<int, int> deductStock)
        {
            Status = PaymentStatus.Success;
            PaymentDate = DateTime.UtcNow;

            Order.SetStatusPaid();

            Order.ApplyStockDeduction(deductStock);
        }

        // Generate invoice after payment is saved (needs PaymentId)
        public void GenerateInvoice()
        {
            Invoice = new Invoice(this);
            Invoice.Generate();
        }
    }
}
