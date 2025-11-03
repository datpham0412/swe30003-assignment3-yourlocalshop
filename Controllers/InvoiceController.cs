using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    [Route("api/[controller]")]
    public class InvoiceController : BaseController
    {
        public InvoiceController(AppDbContext context) : base(context)
        {
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetInvoiceForOrder(int orderId)
        {
            try
            {
                var user = await AuthenticateUserAsync();
                if (user == null)
                {
                    return UnauthorizedResponse();
                }

                var invoice = await _context.Invoices
                    .Include(i => i.Payment)
                    .ThenInclude(p => p.Order)
                    .ThenInclude(o => o.Lines)
                    .FirstOrDefaultAsync(i => i.Payment.OrderId == orderId);

                if (invoice == null)
                {
                    return NotFound("Invoice not found for this order.");
                }

                if (user.Role == "Customer" && invoice.Payment.Order.CustomerId != user.Id)
                {
                    return Unauthorized("You are not authorized to view this invoice.");
                }

                return Ok(new
                {
                    invoiceId = invoice.Id,
                    invoiceNumber = invoice.InvoiceNumber,
                    orderId = invoice.Payment.OrderId,
                    amount = invoice.Amount,
                    issueDate = invoice.IssueDate,
                    paymentMethod = invoice.Payment.Method,
                    lines = invoice.Payment.Order.Lines.Select(l => new
                    {
                        productId = l.ProductId,
                        name = l.ProductName,
                        unitPrice = l.UnitPrice,
                        quantity = l.Quantity,
                        lineTotal = l.LineTotal
                    }).ToList(),
                    subtotal = invoice.Payment.Order.Subtotal,
                    tax = invoice.Payment.Order.Tax,
                    total = invoice.Payment.Order.Total
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAllInvoices()
        {
            try
            {
                var (admin, error) = await ValidateAdminAsync();
                if (error != null) return error;

                var invoices = await _context.Invoices
                    .Include(i => i.Payment)
                    .ThenInclude(p => p.Order)
                    .OrderByDescending(i => i.IssueDate)
                    .ToListAsync();

                var invoiceList = invoices.Select(i => new
                {
                    invoiceId = i.Id,
                    invoiceNumber = i.InvoiceNumber,
                    orderId = i.Payment.OrderId,
                    customerId = i.Payment.Order.CustomerId,
                    amount = i.Amount,
                    issueDate = i.IssueDate,
                    orderStatus = i.Payment.Order.Status.ToString()
                }).ToList();

                return Ok(invoiceList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
