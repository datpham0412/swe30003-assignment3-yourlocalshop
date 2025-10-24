using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;
using System.Linq;

namespace Assignment_3_SWE30003.Managers
{
    public class AccountManager
    {
        private readonly AppDbContext _context;

        public AccountManager(AppDbContext context)
        {
            _context = context;
        }

        // New accounts via signup page will default to Customer role.
        public string CreateAccount(string name, string email, string password, string? phone = null)
        {
            if (string.IsNullOrWhiteSpace(name)) return "Name is required.";
            if (email == null) return "Email is required.";

            // Normalize email to avoid duplicates caused by case or surrounding whitespace
            var normalizedEmail = email.Trim().ToLowerInvariant();

            if (_context.Accounts.Any(a => a.Email.ToLower() == normalizedEmail))
                return "Account with this email already exists.";

            // Phone is required for this application. Validate and normalize to an international-ish format.
            if (string.IsNullOrWhiteSpace(phone)) return "Phone number is required.";

            var normalizedPhone = NormalizeAustralianPhone(phone);
            if (normalizedPhone == null) return "Invalid Australian phone number.";

            // Always create a Customer account for registrations coming from the public signup.
            Account newAccount = new Account { Email = normalizedEmail, Password = password, Role = "Customer" };
            newAccount.Phone = normalizedPhone;
            newAccount.Name = name.Trim();

            _context.Accounts.Add(newAccount);
            _context.SaveChanges();

            NotifyEmailSender(email);
            return "Customer account created successfully!";
        }

        // Create an account with explicit role (Admin or Customer). Used by admin operations.
        public string CreateAccountWithRole(string email, string password, string role, string? name = null, string? phone = null)
        {
            if (string.IsNullOrWhiteSpace(name)) return "Name is required.";
            if (email == null) return "Email is required.";

            var normalizedEmail = email.Trim().ToLowerInvariant();

            if (_context.Accounts.Any(a => a.Email.ToLower() == normalizedEmail))
                return "Account with this email already exists.";

            Account newAccount = new Account { Email = normalizedEmail, Password = password, Role = role };
            // Phone is required for account creation. Validate and normalize.
            if (string.IsNullOrWhiteSpace(phone)) return "Phone number is required.";

            var normalizedPhone = NormalizeAustralianPhone(phone);
            if (normalizedPhone == null) return "Invalid Australian phone number.";

            newAccount.Phone = normalizedPhone;
            newAccount.Name = name.Trim();

            _context.Accounts.Add(newAccount);
            _context.SaveChanges();

            NotifyEmailSender(email);
            return $"{role} account created successfully!";
        }

        // Return all accounts (for admin listing). Caller should filter out sensitive fields.
        public List<Account> ListAccounts()
        {
            return _context.Accounts.ToList();
        }

        public Account? Authenticate(string email, string password)
        {
            if (email == null) return null;
            var normalizedEmail = email.Trim().ToLowerInvariant();
            return _context.Accounts.FirstOrDefault(a => a.Email.ToLower() == normalizedEmail && a.Password == password);
        }

        private void NotifyEmailSender(string email)
        {
            Console.WriteLine($"[EmailSender] Account for {email} created successfully.");
        }

        // Normalize and validate basic Australian phone numbers.
        // Returns a normalized string like +61XXXXXXXXX or null if invalid.
        private string? NormalizeAustralianPhone(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return null;

            // Remove all non-digit characters
            var digits = new string(input.Where(char.IsDigit).ToArray());

            // Accept formats:
            // - Starting with '61' (country code)
            // - Starting with '0' (local) -> convert to +61
            // - Mobile or landline: after normalization we expect 9 or 10 digits depending on leading patterns

            if (digits.StartsWith("61"))
            {
                // already country code
                var rest = digits.Substring(2);
                // Australian numbers after country code typically have 9 digits for mobile (4XXXXXXXX)
                if (rest.Length >= 8 && rest.Length <= 9)
                    return "+" + digits;
                // allow common lengths 9-10
                return "+" + digits;
            }

            if (digits.StartsWith("0"))
            {
                var rest = digits.Substring(1);
                // Mobile numbers usually start with 4 and are 9 digits total (04xxxxxxxx)
                if (rest.Length >= 8 && rest.Length <= 9)
                    return "+61" + rest;
                return "+61" + rest;
            }

            // If it's neither, but length looks correct (9-10), accept by prefixing +61
            if (digits.Length >= 8 && digits.Length <= 10)
                return "+61" + digits;

            return null;
        }
    }
}
