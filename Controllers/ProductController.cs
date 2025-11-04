using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [Route("api/[controller]")]
    public class ProductController : BaseController
    {
        public ProductController(AppDbContext context) : base(context)
        {
        }

        // Creates a new product with name, category, and price (admin only).
        [HttpPost("add")]
        public IActionResult Add(string name, string category, decimal price)
        {
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            var product = new Product { Name = name, Category = category, Price = price };
            _context.Products.Add(product);
            _context.SaveChanges();
            return Ok(product);
        }

        // Updates product details such as name, category, or price (admin only).
        [HttpPut("update")]
        public IActionResult Update(int id, string? name, string? category, decimal? price)
        {
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            var result = Product.UpdateProduct(_context, id, name, category, price);
            return Ok(result);
        }

        // Deletes a product by its ID (admin only).
        [HttpDelete("delete")]
        public IActionResult Delete(int id)
        {
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            var result = Product.DeleteProduct(_context, id);
            return Ok(result);
        }

        // Retrieves all products in the system.
        [HttpGet("list")]
        public IActionResult List()
        {
            return Ok(_context.Products.ToList());
        }
    }
}
