using Assignment_3_SWE30003.Data;
using System.Linq;

namespace Assignment_3_SWE30003.Models
{
    public class Account
    {
        // Full name of account holder
        public string Name { get; set; } = string.Empty;
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public string Role { get; set; } = "Customer";

        public void ManageAccountInfo(string email, string password)
        {
            Email = email;
            Password = password;
        }

        // Update this account. Validates email uniqueness and phone normalization.
        // Returns an error message string on failure, or a success message on success.
        public string UpdateAccount(AppDbContext context, string? newName, string? newEmail, string? newPassword, string? newPhone)
        {
            if (context == null) return "Server error: missing context.";

            // If changing email, ensure uniqueness across other accounts
            if (!string.IsNullOrWhiteSpace(newEmail))
            {
                var normalizedNew = newEmail.Trim().ToLowerInvariant();
                if (context.Accounts.Any(a => a.Email.ToLower() == normalizedNew && a.Id != this.Id))
                    return "Account with this email already exists.";

                this.Email = normalizedNew;
            }

            if (!string.IsNullOrWhiteSpace(newName))
                this.Name = newName.Trim();

            if (!string.IsNullOrWhiteSpace(newPassword))
                this.Password = newPassword;

            if (!string.IsNullOrWhiteSpace(newPhone))
            {
                var normalizedPhone = NormalizeAustralianPhone(newPhone);
                if (normalizedPhone == null) return "Invalid Australian phone number.";
                this.Phone = normalizedPhone;
            }

            context.Accounts.Update(this);
            context.SaveChanges();

            return "Account updated successfully!";
        }

        // Duplicate of previous helper but placed here so Account can validate phone input.
        private string? NormalizeAustralianPhone(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return null;

            var digits = new string(input.Where(char.IsDigit).ToArray());

            if (digits.StartsWith("61"))
            {
                return "+" + digits;
            }

            if (digits.StartsWith("0"))
            {
                var rest = digits.Substring(1);
                return "+61" + rest;
            }

            if (digits.Length >= 8 && digits.Length <= 10)
                return "+61" + digits;

            return null;
        }
    }
}
