using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Models
{
    public class Inventory
    {
        private readonly AppDbContext _context;

        // Initialize inventory service with database context
        public Inventory(AppDbContext context)
        {
            _context = context;
        }

        // Retrieve all products with their stock quantities from inventory
        public List<InventoryProduct> GetInventoryProducts()
        {
            return _context.InventoryProducts.ToList();
        }

        // Add a product to inventory or increase quantity if it already exists
        public string AddProduct(int productId, int quantity)
        {
            // Find product in database
            var product = _context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return "Product not found.";

            // Check if product already has inventory record
            var existing = _context.InventoryProducts.FirstOrDefault(i => i.ProductId == productId);
            if (existing != null)
            {
                // Increase existing quantity
                existing.Quantity += quantity;
                _context.SaveChanges();
                return $"Increased stock for '{product.Name}' to {existing.Quantity}.";
            }

            // Create new inventory record
            var inventory = new InventoryProduct { ProductId = productId, Quantity = quantity };
            _context.InventoryProducts.Add(inventory);
            _context.SaveChanges();
            return $"Added inventory for '{product.Name}' with {quantity} units.";
        }

        // Set the stock quantity of a product to a specific value
        public string UpdateQuantity(int productId, int newQuantity)
        {
            // Find inventory record
            var inventory = _context.InventoryProducts.FirstOrDefault(i => i.ProductId == productId);
            if (inventory == null)
                return "Inventory entry not found.";

            // Update quantity
            inventory.Quantity = newQuantity;
            _context.SaveChanges();
            return $"Updated stock for product ID {productId} to {newQuantity}.";
        }
    }
}
