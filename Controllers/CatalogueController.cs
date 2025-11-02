using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogueController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Catalogue _catalogue;

        // Initialize controller with database context and catalogue service
        public CatalogueController(AppDbContext context, Catalogue catalogue)
        {
            _context = context;
            _catalogue = catalogue;
        }

        // Retrieve all products currently listed in the catalogue
        [HttpGet("list-products")]
        public IActionResult ListAllProductsInCatalogue()
        {
            // TODO: Authorization
            return Ok(_catalogue.GetProducts());
        }

        // Add a product to the catalogue (requires admin authentication)
        [HttpPost("add-product")]
        public IActionResult AddProductToCatalogue(string email, string password, int productId)
        {
            // Authenticate admin user
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can manage the catalogue.");

            // Add product to catalogue
            return Ok(_catalogue.AddProduct(productId));
        }

        // Remove a product from the catalogue (requires admin authentication)
        [HttpDelete("remove-product")]
        public IActionResult RemoveProductFromCatalogue(string email, string password, int productId)
        {
            // Authenticate admin user
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can manage the catalogue.");

            // Remove product from catalogue
            return Ok(_catalogue.RemoveProduct(productId));
        }
    }
}
