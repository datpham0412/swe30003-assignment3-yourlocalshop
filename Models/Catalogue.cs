using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Models
{
    public class Catalogue
    {
        private readonly AppDbContext _context;

        public Catalogue(AppDbContext context)
        {
            _context = context;
        }
        // Displays products for browsing (3.3.9)
        public List<Product> DisplayProducts()
        {
            return Product.GetCatalogueProducts(_context);
        }
        // Add a product to the product listings (3.3.9)
        public string AddProductToCatalogue(int productId)
        {
            return Product.AddToCatalogue(_context, productId);
        }
        // Remove a product to the product listings (3.3.9)
        public string RemoveProductFromCatalogue(int productId)
        {
            return Product.RemoveFromCatalogue(_context, productId);
        }
    }
}
