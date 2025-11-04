using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Models
{
    // Manages product stock quantities and inventory operations like adding and updating stock levels.
    public class Inventory
    {
        private readonly AppDbContext _context;

        public Inventory(AppDbContext context)
        {
            _context = context;
        }

        // Retrieves all inventory records with product IDs and their current stock quantities.
        public List<InventoryProduct> GetInventoryProducts()
        {
            return _context.InventoryProducts.ToList();
        }

        // Adds a new product to inventory or increases its quantity if already exists.
        public string AddProduct(int productId, int quantity)
        {
            var product = _context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                return "Product not found.";

            // Check for existing inventory record
            var existing = _context.InventoryProducts.FirstOrDefault(i => i.ProductId == productId);
            if (existing != null)
            {
                existing.Quantity += quantity;
                _context.SaveChanges();
                return $"Increased stock for '{product.Name}' to {existing.Quantity}.";
            }

            // Create new inventory entry
            var inventory = new InventoryProduct { ProductId = productId, Quantity = quantity };
            _context.InventoryProducts.Add(inventory);
            _context.SaveChanges();
            return $"Added inventory for '{product.Name}' with {quantity} units.";
        }

        // Updates the stock quantity of an existing inventory product to a new value.
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
