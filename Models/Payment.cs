namespace Assignment_3_SWE30003.Models
{
    public enum PaymentStatus
    {
        Pending,
        Success,
        Failed
    }

    // Represents a payment transaction for an order with payment method, amount, status, and date information.
    public class Payment : EmailNotifier
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string Method { get; set; } = "CreditCard";
        public decimal Amount { get; set; }
        public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
        public DateTime PaymentDate { get; private set; } = DateTime.UtcNow;
        public Order Order { get; set; } = default!;
        public Invoice? Invoice { get; set; }

        // Creates a payment record linked to a pending order with the order's total amount.
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

        public Payment() { }

        // Processes payment, updates order status to Paid, deducts inventory stock, and sends confirmation email.
        public void ProcessPayment(Action<int, int> deductStock, string customerEmail)
        {
            Status = PaymentStatus.Success;
            PaymentDate = DateTime.UtcNow;

            // Mark order as paid
            Order.SetStatusPaid();

            // Deduct stock from inventory
            Order.ApplyStockDeduction(deductStock);

            // Notify observers about successful payment
            NotifyObservers("PaymentCompleted", new Dictionary<string, object>
            {
                { "Email", customerEmail },
                { "OrderId", OrderId },
                { "Amount", Amount }
            });
        }

        // Creates and generates an invoice for this payment, then sends it via email.
        public void GenerateInvoice(string customerEmail)
        {
            Invoice = new Invoice(this);
            Invoice.Generate(customerEmail);
        }
    }
}
