using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("process/{orderId}")]
        public async Task<IActionResult> ProcessPayment([FromQuery] string email, [FromQuery] string password, int orderId)
        {
            try
            {
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                var order = await _context.Orders
                    .Include(o => o.Lines)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                {
                    return NotFound("Order not found.");
                }

                if (order.CustomerId != customer.Id)
                {
                    return Unauthorized("You are not authorized to pay for this order.");
                }

                if (order.Status != OrderStatus.PendingPayment)
                {
                    return BadRequest($"Order is not pending payment. Current status: {order.Status}");
                }

                var existingPayment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.OrderId == orderId);

                if (existingPayment != null)
                {
                    return BadRequest("Payment already exists for this order.");
                }

                var payment = new Payment
                {
                    OrderId = orderId,
                    Amount = order.Total,
                    Method = "CreditCard",
                    Order = order
                };

                _context.Payments.Add(payment);

                payment.ProcessPayment((productId, quantity) =>
                {
                    var inventory = _context.Inventories.FirstOrDefault(i => i.ProductId == productId);
                    if (inventory != null)
                    {
                        if (inventory.Quantity < quantity)
                        {
                            throw new InvalidOperationException($"Insufficient stock for product ID {productId}. Available: {inventory.Quantity}, Required: {quantity}");
                        }
                        inventory.Quantity -= quantity;
                    }
                    else
                    {
                        throw new InvalidOperationException($"Inventory not found for product ID {productId}");
                    }
                });

                var invoice = Invoice.FromOrder(order);
                _context.Invoices.Add(invoice);

                var shipment = new Shipment
                {
                    OrderId = order.Id,
                    Address = order.ShipmentAddress ?? "Default Address",
                    ContactName = order.ContactName ?? "Customer",
                    TrackingNumber = $"TRK-{Guid.NewGuid().ToString().Substring(0, 8)}"
                };
                _context.Shipments.Add(shipment);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    paymentId = payment.Id,
                    orderId = order.Id,
                    paymentStatus = payment.Status.ToString(),
                    paymentAmount = payment.Amount,
                    paymentDate = payment.PaymentDate,
                    orderStatus = order.Status.ToString(),
                    invoiceId = invoice.Id,
                    invoiceNumber = invoice.InvoiceNumber,
                    message = "Payment processed successfully. Invoice generated."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Knows payment details (date of purchase, items, total amount paid, and customer details) (3.3.15)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPayment([FromQuery] string email, [FromQuery] string password, int id)
        {
            try
            {
                var user = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password);

                if (user == null)
                {
                    return Unauthorized("Invalid credentials.");
                }

                var payment = await _context.Payments
                    .Include(p => p.Order)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (payment == null)
                {
                    return NotFound("Payment not found.");
                }

                if (user.Role == "Customer" && payment.Order.CustomerId != user.Id)
                {
                    return Unauthorized("You are not authorized to view this payment.");
                }

                return Ok(new
                {
                    paymentId = payment.Id,
                    orderId = payment.OrderId,
                    method = payment.Method,
                    amount = payment.Amount,
                    status = payment.Status.ToString(),
                    paymentDate = payment.PaymentDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // POST /api/Payment/admin/process/{orderId} - Admin processes payment on behalf of customer
        [HttpPost("admin/process/{orderId}")]
        public async Task<IActionResult> AdminProcessPayment([FromQuery] string email, [FromQuery] string password, int orderId)
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

                if (order.Status != OrderStatus.PendingPayment)
                {
                    return BadRequest($"Order is not pending payment. Current status: {order.Status}");
                }

                var existingPayment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.OrderId == orderId);

                if (existingPayment != null)
                {
                    return BadRequest("Payment already exists for this order.");
                }

                var payment = new Payment
                {
                    OrderId = orderId,
                    Amount = order.Total,
                    Method = "Admin Processed",
                    Order = order
                };

                _context.Payments.Add(payment);

                payment.ProcessPayment((productId, quantity) =>
                {
                    var inventory = _context.Inventories.FirstOrDefault(i => i.ProductId == productId);
                    if (inventory != null)
                    {
                        if (inventory.Quantity < quantity)
                        {
                            throw new InvalidOperationException($"Insufficient stock for product ID {productId}. Available: {inventory.Quantity}, Required: {quantity}");
                        }
                        inventory.Quantity -= quantity;
                    }
                    else
                    {
                        throw new InvalidOperationException($"Inventory not found for product ID {productId}");
                    }
                });

                var invoice = Invoice.FromOrder(order);
                _context.Invoices.Add(invoice);

                var shipment = new Shipment
                {
                    OrderId = order.Id,
                    Address = order.ShipmentAddress ?? "Default Address",
                    ContactName = order.ContactName ?? "Customer",
                    TrackingNumber = $"TRK-{Guid.NewGuid().ToString().Substring(0, 8)}"
                };
                _context.Shipments.Add(shipment);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    paymentId = payment.Id,
                    orderId = order.Id,
                    paymentStatus = payment.Status.ToString(),
                    paymentAmount = payment.Amount,
                    paymentDate = payment.PaymentDate,
                    orderStatus = order.Status.ToString(),
                    invoiceId = invoice.Id,
                    invoiceNumber = invoice.InvoiceNumber,
                    shipmentId = shipment.Id,
                    message = "Payment processed successfully by admin. Invoice and shipment generated."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        

        // Knows payment details (date of purchase, items, total amount paid, and customer details) (3.3.15)
        [HttpGet("list")]
        public async Task<IActionResult> GetAllPayments([FromQuery] string email, [FromQuery] string password)
        {
            try
            {
                var admin = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Admin");

                if (admin == null)
                {
                    return Unauthorized("Invalid credentials or not an admin account.");
                }

                var payments = await _context.Payments
                    .Include(p => p.Order)
                    .OrderByDescending(p => p.PaymentDate)
                    .ToListAsync();

                var paymentList = payments.Select(p => new
                {
                    paymentId = p.Id,
                    orderId = p.OrderId,
                    customerId = p.Order.CustomerId,
                    method = p.Method,
                    amount = p.Amount,
                    status = p.Status.ToString(),
                    paymentDate = p.PaymentDate
                }).ToList();

                return Ok(paymentList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
