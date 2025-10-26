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

        // Inject database context and catalogue service for managing product listings
        public CatalogueController(AppDbContext context, Catalogue catalogue)
        {
            _context = context;
            _catalogue = catalogue;
        }

        // Get all products currently available in the catalogue
        [HttpGet("list-products")]
        public IActionResult ListAllProductsInCatalogue()
        {
            // TODO: Authorization
            return Ok(_catalogue.GetCatalogueProducts());
        }

        // Add a product to the catalogue (admin only)
        [HttpPost("add-product")]
        public IActionResult AddProductToCatalogue(string email, string password, int productId)
        {
            // Verify admin credentials before allowing catalogue modifications
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can manage the catalogue.");

            return Ok(_catalogue.AddProductToCatalogue(productId));
        }

        // Remove a product from the catalogue (admin only)
        [HttpDelete("remove-product")]
        public IActionResult RemoveProductFromCatalogue(string email, string password, int productId)
        {
            // Verify admin credentials before allowing catalogue modifications
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can manage the catalogue.");

            return Ok(_catalogue.RemoveProductFromCatalogue(productId));
        }
    }
}
