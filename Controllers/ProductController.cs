using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Initialize controller with database context
        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        // Create a new product (requires admin authentication)
        [HttpPost("add")]
        public IActionResult Add(string email, string password, string name, string category, decimal price)
        {
            // Authenticate admin user
            var admin = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password && a.Role == "Admin");
            if (admin == null) return Unauthorized("Access denied. Only Admins can add products.");

            // Create and save new product
            var product = new Product { Name = name, Category = category, Price = price };
            _context.Products.Add(product);
            _context.SaveChanges();
            return Ok(product);
        }

        // Update product details (requires admin authentication)
        [HttpPut("update")]
        public IActionResult Update(string email, string password, int id, string? name, string? category, decimal? price)
        {
            // Authenticate admin user
            var admin = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password && a.Role == "Admin");
            if (admin == null) return Unauthorized("Access denied. Only Admins can update products.");

            // Update product information
            var result = Product.UpdateProduct(_context, id, name, category, price);
            return Ok(result);
        }

        // Delete a product by ID (requires admin authentication)
        [HttpDelete("delete")]
        public IActionResult Delete(string email, string password, int id)
        {
            // Authenticate admin user
            var admin = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password && a.Role == "Admin");
            if (admin == null) return Unauthorized("Access denied. Only Admins can delete products.");

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
