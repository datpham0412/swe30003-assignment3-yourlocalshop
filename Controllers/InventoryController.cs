using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InventoryController(AppDbContext context)
        {
            _context = context;
        }

        // Add a new product quantity (3.3.11)
        [HttpPost("add")]
        public IActionResult Add(string email, string password, int productId, int quantity)
        {
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can add inventory records.");

            var adminAcc = new AdminAccount(_context);
            var result = adminAcc.AddInventory(productId, quantity);
            return Ok(result);
        }


        // Edits current stock quantity for a product (3.3.11)
        [HttpPut("update")]
        public IActionResult Update(string email, string password, int productId, int quantity)
        {
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can update inventory records.");

            var adminAcc = new AdminAccount(_context);
            var result = adminAcc.UpdateInventory(productId, quantity);
            return Ok(result);
        }


        // Edits current stock quantity for a product (3.3.11)
        [HttpDelete("delete")]
        public IActionResult Delete(string email, string password, int productId)
        {
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can delete inventory records.");

            var adminAcc = new AdminAccount(_context);
            var result = adminAcc.DeleteInventory(productId);
            return Ok(result);
        }

        // Knows details and quantity of all products (3.3.11)
        [HttpGet("list")]
        public IActionResult List()
        {
            var inventories = Inventory.GetAllInventories(_context);
            return Ok(inventories);
        }
    }
}
