using Assignment_3_SWE30003.Data;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Assignment_3_SWE30003.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsInCatalogue { get; set; } = false; 
        public Inventory? Inventory { get; set; }
        // Edit product details
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
        // ------------------------------------------------------------------------
        // Knows product details (name, description, price, category)
        public static List<Product> GetAllProducts(AppDbContext context)
        {
            return context.Products.ToList();
        }
    }
}
