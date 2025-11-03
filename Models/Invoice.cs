namespace Assignment_3_SWE30003.Models
{
    public class Invoice : EmailNotifier
    {
        public int Id { get; set; }
        public int PaymentId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime IssueDate { get; set; } = DateTime.UtcNow;
        public Payment Payment { get; set; } = default!;

        // Parameterless constructor for EF Core
        public Invoice() { }

        // Constructor with payment details
        public Invoice(Payment payment)
        {
            if (payment == null)
            {
                throw new ArgumentNullException(nameof(payment), "Payment cannot be null.");
            }

            if (payment.Id == 0)
            {
                throw new InvalidOperationException("Payment must be saved to database before generating invoice.");
            }

            Payment = payment;
            PaymentId = payment.Id;
        }

        // Generates invoice content
        public void Generate(string customerEmail)
        {
            if (Payment == null)
            {
                throw new InvalidOperationException("Payment must be set before generating invoice.");
            }

            InvoiceNumber = $"INV-{Payment.OrderId}-{DateTime.UtcNow:yyyyMMddHHmmss}";
            Amount = Payment.Amount;
            IssueDate = DateTime.UtcNow;
            
            // Notify observers about invoice generation
            NotifyObservers("InvoiceGenerated", new Dictionary<string, object>
            {
                { "Email", customerEmail },
                { "InvoiceNumber", InvoiceNumber },
                { "Amount", Amount },
                { "OrderId", Payment.OrderId }
            });
        }
    }
}
