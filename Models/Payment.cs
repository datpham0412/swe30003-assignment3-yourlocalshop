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

        // Responsibility: Process the payment (simulation)
        // Collaborates with Order to update status and apply stock deduction
        public void ProcessPayment(Action<int, int> deductStock)
        {
            // Simulate successful payment
            Status = PaymentStatus.Success;
            PaymentDate = DateTime.UtcNow;

            // Update order status to Paid
            Order.SetStatusPaid();

            // Apply stock deduction through the order
            Order.ApplyStockDeduction(deductStock);
        }

        // Allow manual failure (for testing or future logic)
        public void MarkFailed()
        {
            Status = PaymentStatus.Failed;
            PaymentDate = DateTime.UtcNow;
        }
    }
}
