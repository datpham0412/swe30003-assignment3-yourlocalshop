using Assignment_3_SWE30003.Data;
using System.Collections.Generic;
using System.Linq;

namespace Assignment_3_SWE30003.Models
{
    public class Catalogue
    {
        private readonly AppDbContext _context;

        public Catalogue(AppDbContext context)
        {
            _context = context;
        }
        // Displays products for browsing
        public List<Product> DisplayProducts()
        {
            return GetCatalogueProducts();
        }

        // Returns products that are marked as in the catalogue
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

        // Add a product to the product listings
        public string AddProductToCatalogue(int productId)
        {
            var product = _context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return "Product not found.";

            if (product.IsInCatalogue)
                return $"'{product.Name}' is already in the catalogue.";

            product.IsInCatalogue = true;
            _context.SaveChanges();
            return $"'{product.Name}' has been added to the catalogue.";
        }

        // Remove a product from the product listings
        public string RemoveProductFromCatalogue(int productId)
        {
            var product = _context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return "Product not found.";

            if (!product.IsInCatalogue)
                return $"'{product.Name}' is not currently in the catalogue.";

            product.IsInCatalogue = false;
            _context.SaveChanges();
            return $"'{product.Name}' has been removed from the catalogue.";
        }
    }
}
