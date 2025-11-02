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
        private readonly Inventory _inventory;
        public InventoryController(AppDbContext context, Inventory inventory)
        {
            _context = context;
            _inventory = inventory;
        }

        // Add a new product to the inventory (requires admin authentication)
        [HttpPost("add-product")]
        public IActionResult AddProductToInventory(string email, string password, int productId, int quantity)
        {
            // Authenticate admin user
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can add inventory records.");

            // Add product to inventory
            var result = _inventory.AddProduct(productId, quantity);
            return Ok(result);
        }

        // Update the stock quantity of a product in inventory (requires admin authentication)
        [HttpPut("update-product")]
        public IActionResult UpdateProductToInventory(string email, string password, int productId, int quantity)
        {
            // Authenticate admin user
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can update inventory records.");

            // Update product quantity
            var result = _inventory.UpdateQuantity(productId, quantity);
            return Ok(result);
        }

        // Retrieve all products and their quantities in inventory (requires admin authentication)
        [HttpGet("list-products")]
        public IActionResult ListProducts()
        {
            // TODO: Authorization
            var inventories = _inventory.GetInventoryProducts();
            return Ok(inventories);
        }
    }
}
