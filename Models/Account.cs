using Assignment_3_SWE30003.Data;
using System.Linq;

namespace Assignment_3_SWE30003.Models
{
    // Represents a user account with credentials, role, personal information (name, email, phone), and account status.
    public class Account
    {
        public string Name { get; set; } = string.Empty;
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public string Role { get; set; } = "Customer";

        // Updates the account's email and password credentials.
        public void ManageAccountInfo(string email, string password)
        {
            Email = email;
            Password = password;
        }

        // Updates account details with new name, email, password, or phone number.
        public string UpdateAccount(AppDbContext context, string? newName, string? newEmail, string? newPassword, string? newPhone)
        {
            if (context == null) return "Server error: missing context.";

            // Validate email uniqueness if changing email
            if (!string.IsNullOrWhiteSpace(newEmail))
            {
                var normalizedNew = newEmail.Trim().ToLowerInvariant();
                if (context.Accounts.Any(a => a.Email.ToLower() == normalizedNew && a.Id != this.Id))
                    return "Account with this email already exists.";

                this.Email = normalizedNew;
            }

            // Update name if provided
            if (!string.IsNullOrWhiteSpace(newName))
                this.Name = newName.Trim();

            // Update password if provided
            if (!string.IsNullOrWhiteSpace(newPassword))
                this.Password = newPassword;

            // Validate and normalize phone number if provided
            if (!string.IsNullOrWhiteSpace(newPhone))
            {
                var normalizedPhone = NormalizeAustralianPhone(newPhone);
                if (normalizedPhone == null) return "Invalid Australian phone number.";
                this.Phone = normalizedPhone;
            }

            // Save changes to database
            context.Accounts.Update(this);
            context.SaveChanges();

            return "Account updated successfully!";
        }

        // Normalizes and validates Australian phone numbers to international format (+61XXXXXXXXX).
        private string? NormalizeAustralianPhone(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return null;

            // Extract only digit characters from input
            var digits = new string(input.Where(char.IsDigit).ToArray());

            // Handle country code format (61XXXXXXXXX)
            if (digits.StartsWith("61"))
            {
                return "+" + digits;
            }

            // Handle local format starting with 0 (0XXXXXXXXX)
            if (digits.StartsWith("0"))
            {
                var rest = digits.Substring(1);
                return "+61" + rest;
            }

            // Handle raw number without prefix (assume Australian)
            if (digits.Length >= 8 && digits.Length <= 10)
                return "+61" + digits;

            return null;
        }
    }
}
