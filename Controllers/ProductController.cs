using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [Route("api/[controller]")]
    public class ProductController : BaseController
    {
        // Initialize controller with database context
        public ProductController(AppDbContext context) : base(context)
        {
        }

        // Create a new product (requires admin authentication)
        [HttpPost("add")]
        public IActionResult Add(string name, string category, decimal price)
        {
            // Authenticate admin user using BaseController
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            // Create and save new product
            var product = new Product { Name = name, Category = category, Price = price };
            _context.Products.Add(product);
            _context.SaveChanges();
            return Ok(product);
        }

        // Update product details (requires admin authentication)
        [HttpPut("update")]
        public IActionResult Update(int id, string? name, string? category, decimal? price)
        {
            // Authenticate admin user using BaseController
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            // Update product information
            var result = Product.UpdateProduct(_context, id, name, category, price);
            return Ok(result);
        }

        // Delete a product by ID (requires admin authentication)
        [HttpDelete("delete")]
        public IActionResult Delete(int id)
        {
            // Authenticate admin user using BaseController
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            // Delete product from database
            var result = Product.DeleteProduct(_context, id);
            return Ok(result);
        }

        // Retrieve all products in the system
        [HttpGet("list")]
        public IActionResult List()
        {
            // TODO: Authorization
            return Ok(Product.GetAllProducts(_context));
        }
    }
}
