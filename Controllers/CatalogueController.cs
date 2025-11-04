using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Controllers
{
    [Route("api/[controller]")]
    public class CatalogueController : BaseController
    {
        private readonly Catalogue _catalogue;

        public CatalogueController(AppDbContext context, Catalogue catalogue) : base(context)
        {
            _catalogue = catalogue;
        }

        // Retrieves all products currently available in the public catalogue.
        [HttpGet("list-products")]
        public IActionResult ListAllProductsInCatalogue()
        {
            return Ok(_catalogue.GetProducts());
        }

        // Adds a product to the catalogue (admin only).
        [HttpPost("add-product")]
        public IActionResult AddProductToCatalogue(int productId)
        {
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            return Ok(_catalogue.AddProduct(productId));
        }

        // Removes a product from the catalogue (admin only).
        [HttpDelete("remove-product")]
        public IActionResult RemoveProductFromCatalogue(int productId)
        {
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            return Ok(_catalogue.RemoveProduct(productId));
        }
    }
}
