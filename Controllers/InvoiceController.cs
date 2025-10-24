using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InvoiceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetInvoiceByOrderId([FromQuery] string email, [FromQuery] string password, int orderId)
        {
            try
            {
                var user = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password);

                if (user == null)
                {
                    return Unauthorized("Invalid credentials.");
                }

                var invoice = await _context.Invoices
                    .Include(i => i.Order)
                    .ThenInclude(o => o.Lines)
                    .FirstOrDefaultAsync(i => i.OrderId == orderId);

                if (invoice == null)
                {
                    return NotFound("Invoice not found for this order.");
                }

                if (user.Role == "Customer" && invoice.Order.CustomerId != user.Id)
                {
                    return Unauthorized("You are not authorized to view this invoice.");
                }

                // Get payment method
                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.OrderId == orderId);

                return Ok(new
                {
                    invoiceId = invoice.Id,
                    invoiceNumber = invoice.InvoiceNumber,
                    orderId = invoice.OrderId,
                    amount = invoice.Amount,
                    issueDate = invoice.IssueDate,
                    paymentMethod = payment?.Method ?? "Unknown",
                    lines = invoice.Order.Lines.Select(l => new
                    {
                        productId = l.ProductId,
                        name = l.ProductName,
                        unitPrice = l.UnitPrice,
                        quantity = l.Quantity,
                        lineTotal = l.LineTotal
                    }).ToList(),
                    subtotal = invoice.Order.Subtotal,
                    tax = invoice.Order.Tax,
                    total = invoice.Order.Total
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAllInvoices([FromQuery] string email, [FromQuery] string password)
        {
            try
            {
                var admin = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Admin");

                if (admin == null)
                {
                    return Unauthorized("Invalid credentials or not an admin account.");
                }

                var invoices = await _context.Invoices
                    .Include(i => i.Order)
                    .OrderByDescending(i => i.IssueDate)
                    .ToListAsync();

                var invoiceList = invoices.Select(i => new
                {
                    invoiceId = i.Id,
                    invoiceNumber = i.InvoiceNumber,
                    orderId = i.OrderId,
                    customerId = i.Order.CustomerId,
                    amount = i.Amount,
                    issueDate = i.IssueDate,
                    orderStatus = i.Order.Status.ToString()
                }).ToList();

                return Ok(invoiceList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        // Generate Invoice (3.3.15)
        [HttpPost("generate/{orderId}")]
        public async Task<IActionResult> GenerateInvoice([FromQuery] string email, [FromQuery] string password, int orderId)
        {
            try
            {
                var admin = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Admin");

                if (admin == null)
                {
                    return Unauthorized("Invalid credentials or not an admin account.");
                }

                var order = await _context.Orders
                    .Include(o => o.Lines)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    return NotFound("Order not found.");
                }

                var existingInvoice = await _context.Invoices
                    .FirstOrDefaultAsync(i => i.OrderId == orderId);

                if (existingInvoice != null)
                {
                    return BadRequest("Invoice already exists for this order.");
                }

                var invoice = Invoice.FromOrder(order);
                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    invoiceId = invoice.Id,
                    invoiceNumber = invoice.InvoiceNumber,
                    orderId = invoice.OrderId,
                    amount = invoice.Amount,
                    issueDate = invoice.IssueDate,
                    message = "Invoice generated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
