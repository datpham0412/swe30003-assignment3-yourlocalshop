namespace Assignment_3_SWE30003.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime IssueDate { get; set; } = DateTime.UtcNow;
        public Order Order { get; set; } = default!;

        // Responsibility: Generate invoice details automatically when payment succeeds
        // Collaborates with Order to extract invoice information
        public static Invoice FromOrder(Order order)
        {
            return new Invoice
            {
                OrderId = order.Id,
                InvoiceNumber = $"INV-{order.Id}-{DateTime.UtcNow:yyyyMMddHHmmss}",
                Amount = order.Total,
                IssueDate = DateTime.UtcNow
            };
        }
    }
}
