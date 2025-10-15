using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Managers;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogueController : ControllerBase
    {
        private readonly ProductManager _manager;

        public CatalogueController(AppDbContext context)
        {
            _manager = new ProductManager(context);
        }

        [HttpGet]
        public IActionResult GetCatalogue()
        {
            var products = _manager.GetAllProducts();
            return Ok(products);
        }
    }
}
