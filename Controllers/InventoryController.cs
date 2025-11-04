using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [Route("api/[controller]")]
    public class InventoryController : BaseController
    {
        private readonly Inventory _inventory;
        
        public InventoryController(AppDbContext context, Inventory inventory) : base(context)
        {
            _inventory = inventory;
        }

        // Adds a product to inventory with specified quantity (admin only).
        [HttpPost("add-product")]
        public IActionResult AddProductToInventory(int productId, int quantity)
        {
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            var result = _inventory.AddProduct(productId, quantity);
            return Ok(result);
        }

        // Updates the stock quantity of a product in inventory (admin only).
        [HttpPut("update-product")]
        public IActionResult UpdateProductToInventory(int productId, int quantity)
        {
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            var result = _inventory.UpdateQuantity(productId, quantity);
            return Ok(result);
        }

        // Lists all products in inventory with their stock quantities.
        [HttpGet("list-products")]
        public IActionResult ListProducts()
        {
            var inventories = _inventory.GetInventoryProducts();
            return Ok(inventories);
        }
    }
}
