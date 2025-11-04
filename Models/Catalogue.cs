using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Models
{
    // Manages which products are visible in the public catalogue for customers to browse.
    public class Catalogue
    {
        private readonly AppDbContext _context;

        public Catalogue(AppDbContext context)
        {
            _context = context;
        }

        // Retrieves all products currently marked as available in the catalogue.
        public List<Product> GetProducts()
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

        // Adds a product to the catalogue, making it visible to customers.
        public string AddProduct(int productId)
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

        // Removes a product from the catalogue, hiding it from customers.
        public string RemoveProduct(int productId)
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
