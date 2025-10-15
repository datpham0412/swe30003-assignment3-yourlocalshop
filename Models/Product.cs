using Assignment_3_SWE30003.Data;
using System.Linq;

namespace Assignment_3_SWE30003.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsInCatalogue { get; set; } = false; 
        public string AddToDatabase(AppDbContext context)
        {
            if (string.IsNullOrWhiteSpace(Name))
                return "Product name is required.";

            context.Products.Add(this);
            context.SaveChanges();
            return $"Product '{Name}' added successfully!";
        }

        public static string UpdateProduct(
            AppDbContext context,
            int id,
            string? name = null,
            string? category = null,
            decimal? price = null)
        {
            var product = context.Products.FirstOrDefault(p => p.Id == id);
            if (product == null)
                return "Product not found.";

            if (!string.IsNullOrWhiteSpace(name)) product.Name = name;
            if (!string.IsNullOrWhiteSpace(category)) product.Category = category;
            if (price.HasValue) product.Price = price.Value;

            context.SaveChanges();
            return $"Product '{product.Name}' updated successfully!";
        }

        public static string DeleteProduct(AppDbContext context, int id)
        {
            var product = context.Products.FirstOrDefault(p => p.Id == id);
            if (product == null)
                return "Product not found.";

            context.Products.Remove(product);
            context.SaveChanges();
            return $"Product '{product.Name}' deleted successfully!";
        }

        public static List<Product> GetAllProducts(AppDbContext context)
        {
            return context.Products.ToList();
        }
        public static string AddToCatalogue(AppDbContext context, int productId)
        {
            var product = context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return "Product not found.";

            if (product.IsInCatalogue)
                return $"'{product.Name}' is already in the catalogue.";

            product.IsInCatalogue = true;
            context.SaveChanges();
            return $"'{product.Name}' has been added to the catalogue.";
        }

        public static string RemoveFromCatalogue(AppDbContext context, int productId)
        {
            var product = context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return "Product not found.";

            if (!product.IsInCatalogue)
                return $"'{product.Name}' is not currently in the catalogue.";

            product.IsInCatalogue = false;
            context.SaveChanges();
            return $"'{product.Name}' has been removed from the catalogue.";
        }

        public static List<Product> GetCatalogueProducts(AppDbContext context)
        {
            return context.Products
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
    }
}
