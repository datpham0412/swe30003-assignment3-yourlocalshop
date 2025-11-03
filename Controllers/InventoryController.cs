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

        // Add a new product to the inventory (requires admin authentication)
        [HttpPost("add-product")]
        public IActionResult AddProductToInventory(int productId, int quantity)
        {
            // Authenticate admin user using BaseController
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            // Add product to inventory
            var result = _inventory.AddProduct(productId, quantity);
            return Ok(result);
        }

        // Update the stock quantity of a product in inventory (requires admin authentication)
        [HttpPut("update-product")]
        public IActionResult UpdateProductToInventory(int productId, int quantity)
        {
            // Authenticate admin user using BaseController
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

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
