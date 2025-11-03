using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.DTOs;
using Assignment_3_SWE30003.DTOs.Order;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailSender _emailSender;

        public OrderController(AppDbContext context, EmailSender emailSender)
        {
            _context = context;
            _emailSender = emailSender;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromQuery] string email, [FromQuery] string password, [FromBody] CreateOrderRequest request)
        {
            try
            {
                // Authenticate customer
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                // Get customer's shopping cart
                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer.Id);

                if (cart == null || !cart.Items.Any())
                {
                    return BadRequest("Shopping cart is empty. Cannot create order.");
                }

                var order = cart.CreateOrderFromSnapshot(customer.Id);

                order.ShipmentAddress = request.ShipmentAddress;
                order.ContactName = request.ContactName;
                order.ContactPhone = request.ContactPhone;
                order.Note = request.Note;

                _context.Orders.Add(order);

                // Clear the cart after creating the order
                // Get all cart items before clearing
                var cartItemsToRemove = cart.Items.ToList();

                // Clear the cart (this updates cart totals and clears Items collection)
                cart.Clear();

                // Explicitly mark cart items for deletion to ensure EF Core tracks them
                foreach (var cartItem in cartItemsToRemove)
                {
                    _context.CartItems.Remove(cartItem);
                }

                await _context.SaveChangesAsync();

                // Order created successfully - email will be sent after payment
                
                var response = MapToOrderResponse(order);
                return Ok(new
                {
                    message = "Order created successfully! Please proceed to payment.",
                    response.OrderId,
                    response.Status,
                    response.CreatedAt,
                    response.Lines,
                    response.Subtotal,
                    response.Tax,
                    response.Total,
                    response.ShipmentAddress,
                    response.ContactName,
                    response.ContactPhone,
                    response.Note,
                    response.Shipment
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetCustomerOrders([FromQuery] string email, [FromQuery] string password)
        {
            try
            {
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                var orders = await _context.Orders
                    .Include(o => o.Lines)
                    .Include(o => o.Shipment)
                    .Where(o => o.CustomerId == customer.Id)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();

                var orderResponses = orders.Select(o => MapToOrderResponse(o)).ToList();

                return Ok(orderResponses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder([FromQuery] string email, [FromQuery] string password, int id)
        {
            try
            {
                var user = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password);

                if (user == null)
                {
                    return Unauthorized("Invalid credentials.");
                }

                var order = await _context.Orders
                    .Include(o => o.Lines)
                    .Include(o => o.Shipment)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound("Order not found.");
                }

                if (user.Role == "Customer" && order.CustomerId != user.Id)
                {
                    return Unauthorized("You are not authorized to view this order.");
                }

                return Ok(MapToOrderResponse(order));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrders([FromQuery] string email, [FromQuery] string password)
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
                    .Include(o => o.Lines)
                    .Include(o => o.Shipment)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();

                var orderResponses = orders.Select(o => MapToOrderResponse(o)).ToList();

                return Ok(orderResponses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("status/{id}")]
        public async Task<IActionResult> UpdateOrderStatus([FromQuery] string email, [FromQuery] string password, int id, [FromBody] UpdateOrderStatusRequest request)
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
                    .Include(o => o.Shipment)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound("Order not found.");
                }

                try
                {
                    switch (request.Status)
                    {
                        case OrderStatus.Paid:
                            order.SetStatusPaid();
                            break;
                        case OrderStatus.Processing:
                            order.AdvanceToProcessing();
                            break;
                        case OrderStatus.Packed:
                            order.MarkPacked();
                            break;
                        case OrderStatus.Shipped:
                            order.MarkShipped();
                            break;
                        case OrderStatus.Delivered:
                            order.MarkDelivered();
                            break;
                        case OrderStatus.Failed:
                            order.MarkFailed();
                            break;
                        case OrderStatus.Cancelled:
                            order.MarkCancelled();
                            break;
                        default:
                            return BadRequest("Invalid order status.");
                    }

                    await _context.SaveChangesAsync();

                    return Ok(MapToOrderResponse(order));
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Customer pays for their order
        [HttpPost("{orderId}/pay")]
        public async Task<IActionResult> PayForOrder([FromQuery] string email, [FromQuery] string password, int orderId)
        {
            try
            {
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                // Load order with its lines for payment processing
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

                var existingPayment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.OrderId == orderId);

                if (existingPayment != null)
                {
                    return BadRequest("Payment already exists for this order.");
                }

                // Payment constructor validates order status and takes ownership of order
                var payment = new Payment(order);
                
                // Attach EmailSender as observer
                payment.Attach(_emailSender);

                _context.Payments.Add(payment);

                payment.ProcessPayment((productId, quantity) =>
                {
                    var inventory = _context.InventoryProducts.FirstOrDefault(i => i.ProductId == productId);
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
                }, customer.Email);

                var shipment = new Shipment()
                {
                    Order = payment.Order,
                    Address = payment.Order.ShipmentAddress ?? "Default Address",
                    ContactName = payment.Order.ContactName ?? "Customer",
                    TrackingNumber = $"TRK-{Guid.NewGuid().ToString().Substring(0, 8)}"
                };
                _context.Shipments.Add(shipment);

                // Save payment first to get PaymentId
                await _context.SaveChangesAsync();

                // Generate invoice after payment has Id
                payment.GenerateInvoice(customer.Email);
                if (payment.Invoice != null)
                {
                    // Attach EmailSender as observer to Invoice
                    payment.Invoice.Attach(_emailSender);
                    _context.Invoices.Add(payment.Invoice);
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    paymentId = payment.Id,
                    orderId = payment.Order.Id,
                    paymentStatus = payment.Status.ToString(),
                    paymentAmount = payment.Amount,
                    paymentDate = payment.PaymentDate,
                    orderStatus = payment.Order.Status.ToString(),
                    invoiceId = payment.Invoice?.Id,
                    invoiceNumber = payment.Invoice?.InvoiceNumber,
                    message = "Payment processed successfully! Confirmation email and invoice have been sent to your email."
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

        // Admin processes payment on behalf of customer
        [HttpPost("{orderId}/admin-pay")]
        public async Task<IActionResult> AdminPayForOrder([FromQuery] string email, [FromQuery] string password, int orderId)
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
                
                // Get customer email for notifications
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Id == order.CustomerId);
                
                if (customer == null)
                {
                    return NotFound("Customer not found for this order.");
                }

                var existingPayment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.OrderId == orderId);

                if (existingPayment != null)
                {
                    return BadRequest("Payment already exists for this order.");
                }

                // Payment constructor validates order status and takes ownership of order
                var payment = new Payment(order)
                {
                    Method = "Admin Processed"
                };
                
                // Attach EmailSender as observer
                payment.Attach(_emailSender);

                _context.Payments.Add(payment);

                payment.ProcessPayment((productId, quantity) =>
                {
                    var inventory = _context.InventoryProducts.FirstOrDefault(i => i.ProductId == productId);
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
                }, customer.Email);

                var shipment = new Shipment
                {
                    Order = payment.Order,
                    Address = payment.Order.ShipmentAddress ?? "Default Address",
                    ContactName = payment.Order.ContactName ?? "Customer",
                    TrackingNumber = $"TRK-{Guid.NewGuid().ToString().Substring(0, 8)}"
                };
                _context.Shipments.Add(shipment);

                // Save payment first to get PaymentId
                await _context.SaveChangesAsync();

                // Generate invoice after payment has Id
                payment.GenerateInvoice(customer.Email);
                if (payment.Invoice != null)
                {
                    // Attach EmailSender as observer to Invoice
                    payment.Invoice.Attach(_emailSender);
                    _context.Invoices.Add(payment.Invoice);
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    paymentId = payment.Id,
                    orderId = payment.Order.Id,
                    paymentStatus = payment.Status.ToString(),
                    paymentAmount = payment.Amount,
                    paymentDate = payment.PaymentDate,
                    orderStatus = payment.Order.Status.ToString(),
                    invoiceId = payment.Invoice?.Id,
                    invoiceNumber = payment.Invoice?.InvoiceNumber,
                    shipmentId = shipment.Id,
                    message = "Payment processed successfully by admin. Confirmation email and invoice have been sent to the customer."
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

        // Get payment details for an order
        [HttpGet("{orderId}/payment")]
        public async Task<IActionResult> GetOrderPayment([FromQuery] string email, [FromQuery] string password, int orderId)
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
                    .FirstOrDefaultAsync(p => p.OrderId == orderId);

                if (payment == null)
                {
                    return NotFound("Payment not found for this order.");
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

        // Admin gets all payments
        [HttpGet("payments")]
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

        private OrderResponse MapToOrderResponse(Order order)
        {
            return new OrderResponse
            {
                OrderId = order.Id,
                Status = order.Status,
                CreatedAt = order.OrderDate,
                Lines = order.Lines.Select(l => new OrderLineDto
                {
                    ProductId = l.ProductId,
                    Name = l.ProductName,
                    UnitPrice = l.UnitPrice,
                    Quantity = l.Quantity,
                    LineTotal = l.LineTotal
                }).ToList(),
                Subtotal = order.Subtotal,
                Tax = order.Tax,
                Total = order.Total,
                ShipmentAddress = order.ShipmentAddress,
                ContactName = order.ContactName,
                ContactPhone = order.ContactPhone,
                Note = order.Note,
                Shipment = order.Shipment != null ? new ShipmentDto
                {
                    ShipmentId = order.Shipment.Id,
                    TrackingNumber = order.Shipment.TrackingNumber,
                    Status = order.Shipment.Status,
                    Address = order.Shipment.Address,
                    ContactName = order.Shipment.ContactName,
                    DeliveryDate = order.Shipment.DeliveryDate
                } : null
            };
        }
    }
}
