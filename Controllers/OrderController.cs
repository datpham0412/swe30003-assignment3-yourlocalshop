using Assignment_3_SWE30003.Data;
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

        public OrderController(AppDbContext context)
        {
            _context = context;
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


                await _context.SaveChangesAsync();

                return Ok(MapToOrderResponse(order));
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
                Note = order.Note
            };
        }
    }
}
