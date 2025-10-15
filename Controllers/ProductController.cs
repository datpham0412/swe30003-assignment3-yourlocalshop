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
        public IActionResult Add(string email, string password, string name, string category, decimal price, int stock)
        {
            var admin = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password && a.Role == "Admin");
            if (admin == null) return Unauthorized("Access denied. Only Admins can add products.");

            var adminAcc = new AdminAccount(_context);
            var result = adminAcc.AddProduct(name, category, price);
            return Ok(result);
        }

        [HttpPut("update")]
        public IActionResult Update(string email, string password, int id, string? name, string? category, decimal? price, int? stock)
        {
            var admin = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password && a.Role == "Admin");
            if (admin == null) return Unauthorized("Access denied. Only Admins can update products.");

            var adminAcc = new AdminAccount(_context);
            var result = adminAcc.UpdateProduct(id, name, category, price);
            return Ok(result);
        }

        [HttpDelete("delete")]
        public IActionResult Delete(string email, string password, int id)
        {
            var admin = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password && a.Role == "Admin");
            if (admin == null) return Unauthorized("Access denied. Only Admins can delete products.");

            var adminAcc = new AdminAccount(_context);
            var result = adminAcc.DeleteProduct(id);
            return Ok(result);
        }

        [HttpGet("list")]
        public IActionResult List()
        {
            return Ok(Product.GetAllProducts(_context));
        }
    }
}
