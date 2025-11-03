using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShipmentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailSender _emailSender;

        public ShipmentController(AppDbContext context, EmailSender emailSender)
        {
            _context = context;
            _emailSender = emailSender;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAllShipments([FromQuery] string email, [FromQuery] string password)
        {
            try
            {
                var admin = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Admin");

                if (admin == null)
                {
                    return Unauthorized("Invalid credentials or not an admin account.");
                }

                var shipments = await _context.Shipments
                    .Include(s => s.Order)
                    .Select(s => new
                    {
                        s.Id,
                        s.OrderId,
                        s.Address,
                        s.ContactName,
                        s.TrackingNumber,
                        Status = s.Status.ToString(),
                        s.DeliveryDate,
                        Order = new
                        {
                            s.Order.Id,
                            s.Order.CustomerId,
                            s.Order.OrderDate,
                            Status = s.Order.Status.ToString(),
                            s.Order.Subtotal,
                            s.Order.Tax,
                            s.Order.Total
                        }
                    })
                    .ToListAsync();

                return Ok(shipments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateShipment(
            [FromQuery] string email,
            [FromQuery] string password,
            [FromQuery] int orderId,
            [FromQuery] ShipmentStatus status,
            [FromQuery] DateTime? deliveryDate = null)
        {
            try
            {
                var admin = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Admin");

                if (admin == null)
                {
                    return Unauthorized("Invalid credentials or not an admin account.");
                }

                var shipment = await _context.Shipments
                    .Include(s => s.Order)
                    .FirstOrDefaultAsync(s => s.OrderId == orderId);

                if (shipment == null)
                {
                    return NotFound("Shipment not found for the specified order.");
                }
                
                // Get customer email for notifications
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Id == shipment.Order.CustomerId);
                
                if (customer == null)
                {
                    return NotFound("Customer not found for this shipment.");
                }
                
                // Attach EmailSender as observer
                shipment.Attach(_emailSender);

                shipment.UpdateStatus(status, customer.Email, deliveryDate);

                await _context.SaveChangesAsync();

                // Determine email notification message based on status
                var emailNotification = status == ShipmentStatus.Dispatched 
                    ? "Shipment dispatch notification email has been sent to customer."
                    : "Shipment status updated.";

                return Ok(new
                {
                    Message = $"Shipment updated successfully. {emailNotification}",
                    Shipment = new
                    {
                        shipment.Id,
                        shipment.OrderId,
                        shipment.Status,
                        shipment.TrackingNumber,
                        shipment.Address,
                        shipment.ContactName,
                        shipment.DeliveryDate
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
