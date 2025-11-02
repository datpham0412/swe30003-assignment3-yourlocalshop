using Assignment_3_SWE30003.Data;
using System.ComponentModel.DataAnnotations;

namespace Assignment_3_SWE30003.Models
{
    // Represents a product with its name, category, price, and catalogue availability status
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsInCatalogue { get; set; } = false;

        // Update one or more properties of an existing product
        public static string UpdateProduct(
            AppDbContext context,
            int id,
            string? name = null,
            string? category = null,
            decimal? price = null)
        {
            // Find product in database
            var product = context.Products.FirstOrDefault(p => p.Id == id);
            if (product == null)
                return "Product not found.";

            // Update provided fields
            if (!string.IsNullOrWhiteSpace(name)) product.Name = name;
            if (!string.IsNullOrWhiteSpace(category)) product.Category = category;
            if (price.HasValue) product.Price = price.Value;

            // Save changes
            context.SaveChanges();
            return $"Product '{product.Name}' updated successfully!";
        }

        // Remove a product from the database by its ID
        public static string DeleteProduct(AppDbContext context, int id)
        {
            // Find product in database
            var product = context.Products.FirstOrDefault(p => p.Id == id);
            if (product == null)
                return "Product not found.";

            // Delete product
            context.Products.Remove(product);
            context.SaveChanges();
            return $"Product '{product.Name}' deleted successfully!";
        }

        // Retrieve all products from the database
        public static List<Product> GetAllProducts(AppDbContext context)
        {
            return context.Products.ToList();
        }
    }
}
