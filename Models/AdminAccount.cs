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
        public string AddProduct(string name, string category, decimal price)
        {
            var product = new Product { Name = name, Category = category, Price = price};
            return product.AddToDatabase(_context);
        }
        public string UpdateProduct(int id, string? name = null, string? category = null, decimal? price = null, int? stock = null)
        {
            return Product.UpdateProduct(_context, id, name, category, price);
        }
        public string DeleteProduct(int id)
        {
            return Product.DeleteProduct(_context, id);
        }
        public List<Product> ViewAllProducts()
        {
            return Product.GetAllProducts(_context);
        }
        public string AddInventory(int productId, int quantity)
        {
            return Inventory.AddInventory(_context, productId, quantity);
        }

        public string UpdateInventory(int productId, int quantity)
        {
            return Inventory.UpdateQuantity(_context, productId, quantity);
        }

        public string DeleteInventory(int productId)
        {
            return Inventory.DeleteInventory(_context, productId);
        }

        public List<Inventory> ViewAllInventory()
        {
            return Inventory.GetAllInventories(_context);
        }
        public string AddProductToCatalogue(int productId)
        {
            var catalogue = new Catalogue(_context);
            return catalogue.AddProductToCatalogue(productId);
        }

        public string RemoveProductFromCatalogue(int productId)
        {
            var catalogue = new Catalogue(_context);
            return catalogue.RemoveProductFromCatalogue(productId);
        }

        public List<Product> ViewCatalogue()
        {
            var catalogue = new Catalogue(_context);
            return catalogue.DisplayProducts();
        }
    }
}
