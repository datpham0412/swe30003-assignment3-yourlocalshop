using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Models
{
    public class Catalogue
    {
        private readonly AppDbContext _context;

        // Initialize catalogue service with database context
        public Catalogue(AppDbContext context)
        {
            _context = context;
        }

        // Retrieve all products that are currently listed in the catalogue
        public List<Product> GetCatalogueProducts()
        {
            return _context.Products
                .Where(p => p.IsInCatalogue)
                .Select(p => new Product
                {
                    Id = p.Id,
                    Name = p.Name,
                    Category = p.Category,
                    Price = p.Price
                })
                .ToList();
        }

        // Mark a product as available in the catalogue
        public string AddProduct(int productId)
        {
            // Find product in database
            var product = _context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return "Product not found.";

            // Check if already in catalogue
            if (product.IsInCatalogue)
                return $"'{product.Name}' is already in the catalogue.";

            // Add to catalogue
            product.IsInCatalogue = true;
            _context.SaveChanges();
            return $"'{product.Name}' has been added to the catalogue.";
        }

        // Mark a product as unavailable in the catalogue
        public string RemoveProduct(int productId)
        {
            // Find product in database
            var product = _context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return "Product not found.";

            // Check if currently in catalogue
            if (!product.IsInCatalogue)
                return $"'{product.Name}' is not currently in the catalogue.";

            // Remove from catalogue
            product.IsInCatalogue = false;
            _context.SaveChanges();
            return $"'{product.Name}' has been removed from the catalogue.";
        }
    }
}
