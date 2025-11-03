using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [Route("api/[controller]")]
    public class CatalogueController : BaseController
    {
        private readonly Catalogue _catalogue;

        // Initialize controller with database context and catalogue service
        public CatalogueController(AppDbContext context, Catalogue catalogue) : base(context)
        {
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
        public IActionResult AddProductToCatalogue(int productId)
        {
            // Authenticate admin user using BaseController
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            // Add product to catalogue
            return Ok(_catalogue.AddProduct(productId));
        }

        // Remove a product from the catalogue (requires admin authentication)
        [HttpDelete("remove-product")]
        public IActionResult RemoveProductFromCatalogue(int productId)
        {
            // Authenticate admin user using BaseController
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            // Remove product from catalogue
            return Ok(_catalogue.RemoveProduct(productId));
        }
    }
}
