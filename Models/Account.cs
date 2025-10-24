namespace Assignment_3_SWE30003.Models
{
    public class Account   
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public string Role { get; set; } = "Customer";
    }
}
