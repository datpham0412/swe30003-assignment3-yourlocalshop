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

        public CatalogueController(AppDbContext context, Catalogue catalogue)
        {
            _context = context;
            _catalogue = catalogue;
        }

        [HttpGet("list")]
        public IActionResult DisplayCatalogue()
        {
            return Ok(_catalogue.DisplayProducts());
        }

        [HttpPost("add")]
        public IActionResult AddToCatalogue(string email, string password, int productId)
        {
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can manage the catalogue.");

            return Ok(_catalogue.AddProductToCatalogue(productId));
        }

        [HttpDelete("remove")]
        public IActionResult RemoveFromCatalogue(string email, string password, int productId)
        {
            var admin = _context.Accounts.FirstOrDefault(a =>
                a.Email == email && a.Password == password && a.Role == "Admin");

            if (admin == null)
                return Unauthorized("Access denied. Only Admins can manage the catalogue.");

            return Ok(_catalogue.RemoveProductFromCatalogue(productId));
        }
    }
}
