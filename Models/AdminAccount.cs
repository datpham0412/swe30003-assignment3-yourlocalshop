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
    }
}
