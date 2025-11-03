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

        // Generate a sales report for a specific time period (admin only)
        [HttpGet("generate")]
        public async Task<IActionResult> GenerateSalesReport([FromQuery] ReportPeriod period)
        {
            try
            {
                // Verify that the user is an admin using BaseController
                var (admin, error) = await ValidateAdminAsync();
                if (error != null) return error;

                // Get all paid/delivered orders within the specified time period
                var orders = await GetOrdersInPeriod(period) ?? new List<Order>();

                // Create and populate the report with calculations
                var report = new SalesReport();
                report.Generate(orders, period);

                // Save the report to the database
                _context.SalesReports.Add(report);
                await _context.SaveChangesAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Fetch orders that are paid or delivered within the specified time period
        private async Task<List<Order>> GetOrdersInPeriod(ReportPeriod period)
        {
            var now = DateTime.UtcNow;
            // Calculate the start date based on the report period
            DateTime startDate = period switch
            {
                ReportPeriod.Daily => now.Date,
                ReportPeriod.Weekly => now.AddDays(-7),
                ReportPeriod.Monthly => now.AddMonths(-1),
                _ => now.AddDays(-7)
            };

            // Only include paid or delivered orders within the date range
            var orders = await _context.Orders
                .Where(o => (o.Status == OrderStatus.Paid || o.Status == OrderStatus.Delivered)
                            && o.OrderDate >= startDate
                            && o.OrderDate <= now)
                .ToListAsync();

            return orders;
        }
    }
}
