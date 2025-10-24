using Assignment_3_SWE30003.Data;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Assignment_3_SWE30003.Models
{
    public class Inventory
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey(nameof(Product))] 
        public int ProductId { get; set; }
        public int Quantity { get; set; }

        public Product? Product { get; set; }

        // Add new product quantity (3.3.11)
        public static string AddInventory(AppDbContext context, int productId, int quantity)
        {
            var product = context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return "Product not found.";

            var existing = context.Inventories.FirstOrDefault(i => i.ProductId == productId);
            if (existing != null)
            {
                existing.Quantity += quantity;
                context.SaveChanges();
                return $"Increased stock for '{product.Name}' to {existing.Quantity}.";
            }

            var inventory = new Inventory { ProductId = productId, Quantity = quantity };
            context.Inventories.Add(inventory);
            context.SaveChanges();
            return $"Added inventory for '{product.Name}' with {quantity} units.";
        }
        // Edits current stock quantity for a product (3.3.11)
        public static string UpdateQuantity(AppDbContext context, int productId, int newQuantity)
        {
            var inventory = context.Inventories.FirstOrDefault(i => i.ProductId == productId);
            if (inventory == null)
                return "Inventory entry not found.";

            inventory.Quantity = newQuantity;
            context.SaveChanges();
            return $"Updated stock for product ID {productId} to {newQuantity}.";
        }

        // Edits current stock quantity for a product (3.3.11)
        public static string DeleteInventory(AppDbContext context, int productId)
        {
            var inventory = context.Inventories.FirstOrDefault(i => i.ProductId == productId);
            if (inventory == null)
                return "Inventory entry not found.";

            context.Inventories.Remove(inventory);
            context.SaveChanges();
            return $"Inventory for product ID {productId} deleted.";
        }
        // Knows details and quantity of all products (3.3.11)
        public static List<Inventory> GetAllInventories(AppDbContext context)
        {
            return context.Inventories
                          .Select(i => new Inventory
                          {
                              Id = i.Id,
                              ProductId = i.ProductId,
                              Quantity = i.Quantity,
                              Product = i.Product
                          })
                          .ToList();
        }
    }
}
