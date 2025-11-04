using System.ComponentModel.DataAnnotations.Schema;

namespace Assignment_3_SWE30003.Models
{
    public enum ReportPeriod
    {
        Daily,
        Weekly,
        Monthly
    }

    // Represents a sales report with total orders, revenue, and the time period covered.
    public class SalesReport
    {
        public int Id { get; private set; }
        public ReportPeriod Period { get; private set; }
        public DateTime GeneratedAt { get; private set; }
        public int TotalOrders { get; private set; }
        public decimal TotalRevenue { get; private set; }

        [NotMapped]
        public List<Order> Orders { get; private set; } = new();

        // Generates the sales report from a list of orders and calculates metrics.
        public void Generate(List<Order> orders, ReportPeriod period)
        {
            Orders = orders.ToList();
            Period = period;
            GeneratedAt = DateTime.UtcNow;
            TotalOrders = CalculateTotalOrders();
            TotalRevenue = CalculateTotalRevenue();
        }

        // Counts the total number of orders in this report.
        private int CalculateTotalOrders()
        {
            return Orders?.Count ?? 0;
        }

        // Calculates the total revenue from all orders in this report.
        private decimal CalculateTotalRevenue()
        {
            return Orders?.Sum(o => o.Total) ?? 0;
        }
    }
}
