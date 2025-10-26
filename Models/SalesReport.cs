using System.ComponentModel.DataAnnotations.Schema;

namespace Assignment_3_SWE30003.Models
{
    // Type of periods for a report
    public enum ReportPeriod
    {
        Daily,
        Weekly,
        Monthly
    }

    public class SalesReport
    {
        public int Id { get; private set; }
        public ReportPeriod Period { get; private set; }
        public DateTime GeneratedAt { get; private set; }
        public int TotalOrders { get; private set; }
        public decimal TotalRevenue { get; private set; }

        [NotMapped]
        public List<Order> Orders { get; private set; } = new();

        // Generate the report with orders and calculate all the metrics
        public void Generate(List<Order> orders, ReportPeriod period)
        {
            Orders = orders.ToList();
            Period = period;
            GeneratedAt = DateTime.UtcNow;
            TotalOrders = CalculateTotalOrders();
            TotalRevenue = CalculateTotalRevenue();
        }

        // Count how many orders are in this report
        private int CalculateTotalOrders()
        {
            return Orders?.Count ?? 0;
        }

        // Sum up the total revenue from all orders in this report
        private decimal CalculateTotalRevenue()
        {
            return Orders?.Sum(o => o.Total) ?? 0;
        }
    }
}
