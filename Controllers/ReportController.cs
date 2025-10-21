using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("generate")]
        public async Task<IActionResult> GenerateSalesReport(
            [FromQuery] string email,
            [FromQuery] string password,
            [FromQuery] ReportPeriod period)
        {
            try
            {
                var admin = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Admin");

                if (admin == null)
                {
                    return Unauthorized("Invalid credentials or not an admin account.");
                }

                var orders = await _context.Orders
                    .Where(o => o.Status == OrderStatus.Paid || o.Status == OrderStatus.Delivered)
                    .ToListAsync();

                var report = SalesReport.Generate(orders, period);

                _context.SalesReports.Add(report);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Period = report.Period.ToString(),
                    TotalOrders = report.TotalOrders,
                    TotalRevenue = report.TotalRevenue,
                    GeneratedAt = report.GeneratedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
