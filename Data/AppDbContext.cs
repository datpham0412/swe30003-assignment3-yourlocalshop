using Microsoft.EntityFrameworkCore;
using Assignment_3_SWE30003.Models;

namespace Assignment_3_SWE30003.Data
{
    // Database context managing all entity tables and relationships for the local shop application.
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<InventoryProduct> InventoryProducts { get; set; }
        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderLine> OrderLines { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Shipment> Shipments { get; set; }
        public DbSet<SalesReport> SalesReports { get; set; }

        // Configures entity relationships, constraints, and database mappings.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Set default value for IsInCatalogue to false
            modelBuilder.Entity<Product>()
                .Property(p => p.IsInCatalogue)
                .HasDefaultValue(false);

            // One-to-one relationship between InventoryProduct and Product
            modelBuilder.Entity<InventoryProduct>()
                .HasOne(i => i.Product)
                .WithOne()
                .HasForeignKey<InventoryProduct>(ip => ip.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: one cart per customer
            modelBuilder.Entity<ShoppingCart>()
                .HasIndex(sc => sc.CustomerId)
                .IsUnique();

            // One-to-many: ShoppingCart to CartItems with cascade delete
            modelBuilder.Entity<ShoppingCart>()
                .HasMany(sc => sc.Items)
                .WithOne()
                .HasForeignKey(ci => ci.ShoppingCartId)
                .OnDelete(DeleteBehavior.Cascade);

            // Validation annotations for CartItem
            modelBuilder.Entity<CartItem>()
                .Property(ci => ci.Quantity)
                .HasAnnotation("MinValue", 1);

            modelBuilder.Entity<CartItem>()
                .Property(ci => ci.UnitPrice)
                .HasAnnotation("MinValue", 0);

            // One-to-many: Order to OrderLines with cascade delete
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Lines)
                .WithOne()
                .HasForeignKey(ol => ol.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Store OrderStatus enum as string in database
            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<string>();

            // One-to-one: Payment to Order with cascade delete
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Order)
                .WithOne()
                .HasForeignKey<Payment>(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Store PaymentStatus enum as string in database
            modelBuilder.Entity<Payment>()
                .Property(p => p.Status)
                .HasConversion<string>();

            // One-to-one: Invoice to Payment with cascade delete
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Payment)
                .WithOne(p => p.Invoice)
                .HasForeignKey<Invoice>(i => i.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-one: Shipment to Order with cascade delete
            modelBuilder.Entity<Shipment>()
                .HasOne(s => s.Order)
                .WithOne(o => o.Shipment)
                .HasForeignKey<Shipment>(s => s.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Store ShipmentStatus enum as string in database
            modelBuilder.Entity<Shipment>()
                .Property(s => s.Status)
                .HasConversion<string>();

            // Store ReportPeriod enum as string in database
            modelBuilder.Entity<SalesReport>()
                .Property(sr => sr.Period)
                .HasConversion<string>();

            // Exclude EmailNotifier base class from database schema
            modelBuilder.Ignore<EmailNotifier>();
        }
    }
}
