using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Managers;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ProductManager _manager;

        public ProductController(AppDbContext context)
        {
            _manager = new ProductManager(context);
        }

        [HttpPost("add")]
        public IActionResult AddProduct(string email, string password, string name, string category, decimal price, int stock)
        {
            var result = _manager.AddProduct(email, password, name, category, price, stock);
            return Ok(result);
        }
    }
}
