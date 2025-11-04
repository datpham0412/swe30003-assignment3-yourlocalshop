using Assignment_3_SWE30003.Data;
using System.ComponentModel.DataAnnotations;

namespace Assignment_3_SWE30003.Models
{
    // Represents a product with name, category, price, and catalogue availability status.
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsInCatalogue { get; set; } = false;

        // Updates one or more properties of an existing product in the database.
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

            // Update provided fields only
            if (!string.IsNullOrWhiteSpace(name)) product.Name = name;
            if (!string.IsNullOrWhiteSpace(category)) product.Category = category;
            if (price.HasValue) product.Price = price.Value;

            context.SaveChanges();
            return $"Product '{product.Name}' updated successfully!";
        }

        // Deletes a product from the database by its ID.
        public static string DeleteProduct(AppDbContext context, int id)
        {
            var product = context.Products.FirstOrDefault(p => p.Id == id);
            if (product == null)
                return "Product not found.";

            context.Products.Remove(product);
            context.SaveChanges();
            return $"Product '{product.Name}' deleted successfully!";
        }
    }
}
