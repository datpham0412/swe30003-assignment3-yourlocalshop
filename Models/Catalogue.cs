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

        public List<Product> DisplayProducts()
        {
            return Product.GetCatalogueProducts(_context);
        }

        public string AddProductToCatalogue(int productId)
        {
            return Product.AddToCatalogue(_context, productId);
        }

        public string RemoveProductFromCatalogue(int productId)
        {
            return Product.RemoveFromCatalogue(_context, productId);
        }
    }
}
