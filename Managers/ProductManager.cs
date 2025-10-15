using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;
using System.Linq;

namespace Assignment_3_SWE30003.Managers
{
    public class ProductManager
    {
        private readonly AppDbContext _context;

        public ProductManager(AppDbContext context)
        {
            _context = context;
        }

        public string AddProduct(string email, string password, string name, string category, decimal price, int stock)
        {
            // Check if user is Admin
            var account = _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password);
            if (account == null) return "Invalid credentials!";
            if (account.Role != "Admin") return "Access denied. Only Admins can add products.";

            var product = new Product { Name = name, Category = category, Price = price, Stock = stock };
            _context.Products.Add(product);
            _context.SaveChanges();
            return $"Product '{name}' added successfully!";
        }

        public List<Product> GetAllProducts()
        {
            return _context.Products.ToList();
        }
    }
}
