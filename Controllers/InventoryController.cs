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

        [HttpPost("add")]
        public IActionResult Add(string email, string password, int productId, int quantity)
        {
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can add inventory records.");

            // Use Inventory static helper directly
            var result = Inventory.AddInventory(_context, productId, quantity);
            return Ok(result);
        }

        [HttpPut("update")]
        public IActionResult Update(string email, string password, int productId, int quantity)
        {
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can update inventory records.");

            // Use Inventory static helper directly
            var result = Inventory.UpdateQuantity(_context, productId, quantity);
            return Ok(result);
        }

        [HttpDelete("delete")]
        public IActionResult Delete(string email, string password, int productId)
        {
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can delete inventory records.");

            // Use Inventory static helper directly
            var result = Inventory.DeleteInventory(_context, productId);
            return Ok(result);
        }

        [HttpGet("list")]
        public IActionResult List()
        {
            var inventories = Inventory.GetAllInventories(_context);
            return Ok(inventories);
        }
    }
}
