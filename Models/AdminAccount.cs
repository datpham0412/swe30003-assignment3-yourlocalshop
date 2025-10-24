using Assignment_3_SWE30003.Data;

namespace Assignment_3_SWE30003.Models
{
    public class AdminAccount : Account
    {
        private readonly AppDbContext _context;
        public AdminAccount(AppDbContext context)
        {
            Role = "Admin";
            _context = context;
        }

        // Manage Products (3.3.4)
        public string AddProduct(string name, string category, decimal price)
        {
            var product = new Product { Name = name, Category = category, Price = price };
            return product.AddToDatabase(_context);
        }

        // Manage Products (3.3.4)
        public string UpdateProduct(int id, string? name = null, string? category = null, decimal? price = null, int? stock = null)
        {
            return Product.UpdateProduct(_context, id, name, category, price);
        }
        // Manage Products (3.3.4)
        public string DeleteProduct(int id)
        {
            return Product.DeleteProduct(_context, id);
        }
        // Manage Products (3.3.4)
        public List<Product> ViewAllProducts()
        {
            return Product.GetAllProducts(_context);
        }

        // Updates product quantities inside inventory (3.3.4)
        public string AddInventory(int productId, int quantity)
        {
            return Inventory.AddInventory(_context, productId, quantity);
        }
        // Updates product quantities inside inventory (3.3.4)
        public string UpdateInventory(int productId, int quantity)
        {
            return Inventory.UpdateQuantity(_context, productId, quantity);
        }
        // Updates product quantities inside inventory (3.3.4)
        public string DeleteInventory(int productId)
        {
            return Inventory.DeleteInventory(_context, productId);
        }
        // Updates product quantities inside inventory (3.3.4)
        public List<Inventory> ViewAllInventory()
        {
            return Inventory.GetAllInventories(_context);
        }
        // Add a product to the product listings (3.3.9)
        public string AddProductToCatalogue(int productId)
        {
            var catalogue = new Catalogue(_context);
            return catalogue.AddProductToCatalogue(productId);
        }
        // Remove a product to the product listings (3.3.9)
        public string RemoveProductFromCatalogue(int productId)
        {
            var catalogue = new Catalogue(_context);
            return catalogue.RemoveProductFromCatalogue(productId);
        }
    }
}
