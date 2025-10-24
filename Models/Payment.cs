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


        // Process payment (3.3.13)
        public void ProcessPayment(Action<int, int> deductStock)
        {
            Status = PaymentStatus.Success;
            PaymentDate = DateTime.UtcNow;

            Order.SetStatusPaid();

            Order.ApplyStockDeduction(deductStock);
        }
    }
}
