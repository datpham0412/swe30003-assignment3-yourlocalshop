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

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        public IActionResult Add(string email, string password, string name, string category, decimal price)
        {
            var admin = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password && a.Role == "Admin");
            if (admin == null) return Unauthorized("Access denied. Only Admins can add products.");

            // Call Product model directly instead of using AdminAccount helper
            var product = new Product { Name = name, Category = category, Price = price };
            var result = product.AddToDatabase(_context);
            return Ok(result);
        }

        [HttpPut("update")]
        public IActionResult Update(string email, string password, int id, string? name, string? category, decimal? price)
        {
            var admin = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password && a.Role == "Admin");
            if (admin == null) return Unauthorized("Access denied. Only Admins can update products.");

            var result = Product.UpdateProduct(_context, id, name, category, price);
            return Ok(result);
        }

        [HttpDelete("delete")]
        public IActionResult Delete(string email, string password, int id)
        {
            var admin = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password && a.Role == "Admin");
            if (admin == null) return Unauthorized("Access denied. Only Admins can delete products.");

            var result = Product.DeleteProduct(_context, id);
            return Ok(result);
        }

        [HttpGet("list")]
        public IActionResult List()
        {
            return Ok(Product.GetAllProducts(_context));
        }
    }
}
