using System.Collections.Generic;

namespace Assignment_3_SWE30003.Models
{
    public class Catalogue
    {
        public int Id { get; set; }
        public string Title { get; set; } = "Your Local Shop Catalogue";
        public List<Product> Products { get; set; } = new List<Product>();
    }
}
