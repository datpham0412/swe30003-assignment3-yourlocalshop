
namespace Assignment_3_SWE30003.Models
{
    public class AdminAccount : Account
    {
        public AdminAccount()
        {
            Role = "Admin";
        }

        public string ManageProducts() => "Managing products...";
        public string UpdateInventory() => "Updating inventory...";
        public string GenerateSalesReport() => "Generating sales report...";
    }
}
