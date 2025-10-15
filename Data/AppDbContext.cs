using Microsoft.EntityFrameworkCore;
using Assignment_3_SWE30003.Models;

namespace Assignment_3_SWE30003.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Product>()
                .Property(p => p.IsInCatalogue)
                .HasDefaultValue(false);
            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Product)        
                .WithOne(p => p.Inventory)    
                .HasForeignKey<Inventory>(i => i.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
