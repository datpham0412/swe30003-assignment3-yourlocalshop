namespace Assignment_3_SWE30003.Models
{
    public enum ReportPeriod
    {
        Daily,
        Weekly,
        Monthly
    }

    public class SalesReport
    {
        public int Id { get; set; }
        public ReportPeriod Period { get; set; }
        public int TotalOrders { get; private set; }
        public decimal TotalRevenue { get; private set; }
        public DateTime GeneratedAt { get; private set; } = DateTime.UtcNow;
        // Generate sales report for a period (daily, weekly, and monthly) (3.3.12)
        public static SalesReport Generate(IEnumerable<Order> orders, ReportPeriod period)
        {
            var now = DateTime.UtcNow;
            DateTime start = period switch
            {
                ReportPeriod.Daily => now.Date,
                ReportPeriod.Weekly => now.AddDays(-7),
                ReportPeriod.Monthly => now.AddMonths(-1),
                _ => now.AddDays(-7)
            };

            var filtered = orders.Where(o => o.OrderDate >= start && o.OrderDate <= now);
            return new SalesReport
            {
                Period = period,
                TotalOrders = filtered.Count(),
                TotalRevenue = filtered.Sum(o => o.Total)
            };
        }
    }
}
