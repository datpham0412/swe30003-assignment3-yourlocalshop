using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    [Route("api/[controller]")]
    public class SalesReportController : BaseController
    {
        public SalesReportController(AppDbContext context) : base(context)
        {
        }

        // Generates a sales report for a specified time period with total orders and revenue (admin only).
        [HttpGet("generate")]
        public async Task<IActionResult> GenerateSalesReport([FromQuery] ReportPeriod period)
        {
            try
            {
                var (admin, error) = await ValidateAdminAsync();
                if (error != null) return error;

                // Get orders within the specified period
                var orders = await GetOrdersInPeriod(period) ?? new List<Order>();

                // Create and save report
                var report = new SalesReport();
                report.Generate(orders, period);

                _context.SalesReports.Add(report);
                await _context.SaveChangesAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Retrieves paid or delivered orders within the specified time period for report generation.
        private async Task<List<Order>> GetOrdersInPeriod(ReportPeriod period)
        {
            var now = DateTime.UtcNow;

            // Calculate start date based on period type
            DateTime startDate = period switch
            {
                ReportPeriod.Daily => now.Date,
                ReportPeriod.Weekly => now.AddDays(-7),
                ReportPeriod.Monthly => now.AddMonths(-1),
                _ => now.AddDays(-7)
            };

            // Filter orders by status and date range
            var orders = await _context.Orders
                .Where(o => (o.Status == OrderStatus.Paid || o.Status == OrderStatus.Delivered)
                            && o.OrderDate >= startDate
                            && o.OrderDate <= now)
                .ToListAsync();

            return orders;
        }
    }
}
