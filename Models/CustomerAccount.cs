namespace Assignment_3_SWE30003.Models
{
    public class CustomerAccount : Account
    {
        public CustomerAccount()
        {
            Role = "Customer";
        }

        public string BrowseCatalogue() => "Browsing catalogue...";
        public string ManageShoppingCart() => "Managing shopping cart...";
        public string PlaceOrder() => "Placing order...";
    }
}
