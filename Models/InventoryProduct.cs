using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Assignment_3_SWE30003.Models
{
    // Represents the stock quantity of a specific product in the inventory
    public class InventoryProduct
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey(nameof(Product))]
        public int ProductId { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Quantity must be a positive integer.")]
        public int Quantity { get; set; } = 0;

        public Product? Product { get; set; }
    }
}
