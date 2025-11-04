using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Data;
using System.Linq;

namespace Assignment_3_SWE30003.Managers
{
    // Manages account operations including creation, authentication, and listing with email notification support.
    public class AccountManager : EmailNotifier
    {
        private readonly AppDbContext _context;

        public AccountManager(AppDbContext context)
        {
            _context = context;
        }

        // Creates a new customer account with name, email, password, and phone, then sends welcome email.
        public string CreateAccount(string name, string email, string password, string? phone = null)
        {
            if (string.IsNullOrWhiteSpace(name)) return "Name is required.";
            if (email == null) return "Email is required.";

            // Normalize email to prevent duplicates
            var normalizedEmail = email.Trim().ToLowerInvariant();

            if (_context.Accounts.Any(a => a.Email.ToLower() == normalizedEmail))
                return "Account with this email already exists.";

            // Validate and normalize phone number
            if (string.IsNullOrWhiteSpace(phone)) return "Phone number is required.";

            var normalizedPhone = NormalizeAustralianPhone(phone);
            if (normalizedPhone == null) return "Invalid Australian phone number.";

            // Create customer account
            Account newAccount = new Account { Email = normalizedEmail, Password = password, Role = "Customer" };
            newAccount.Phone = normalizedPhone;
            newAccount.Name = name.Trim();

            _context.Accounts.Add(newAccount);
            _context.SaveChanges();

            // Send welcome email notification
            NotifyObservers("AccountCreated", new Dictionary<string, object>
            {
                { "Email", normalizedEmail },
                { "Name", name.Trim() }
            });

            return "Customer account created successfully!";
        }

        // Creates an account with a specified role (Admin, Staff, or Customer) for administrative purposes.
        public string CreateAccountWithRole(string email, string password, string role, string? name = null, string? phone = null)
        {
            if (string.IsNullOrWhiteSpace(name)) return "Name is required.";
            if (email == null) return "Email is required.";

            var normalizedEmail = email.Trim().ToLowerInvariant();

            if (_context.Accounts.Any(a => a.Email.ToLower() == normalizedEmail))
                return "Account with this email already exists.";

            Account newAccount = new Account { Email = normalizedEmail, Password = password, Role = role };

            // Validate and normalize phone number
            if (string.IsNullOrWhiteSpace(phone)) return "Phone number is required.";

            var normalizedPhone = NormalizeAustralianPhone(phone);
            if (normalizedPhone == null) return "Invalid Australian phone number.";

            newAccount.Phone = normalizedPhone;
            newAccount.Name = name.Trim();

            _context.Accounts.Add(newAccount);
            _context.SaveChanges();

            // Send welcome email notification
            NotifyObservers("AccountCreated", new Dictionary<string, object>
            {
                { "Email", normalizedEmail },
                { "Name", name.Trim() }
            });

            return $"{role} account created successfully!";
        }

        // Retrieves all accounts from the database (for admin listing purposes).
        public List<Account> ListAccounts()
        {
            return _context.Accounts.ToList();
        }

        // Authenticates a user by email and password, returning the account if credentials match.
        public Account? Authenticate(string email, string password)
        {
            if (email == null) return null;
            var normalizedEmail = email.Trim().ToLowerInvariant();
            return _context.Accounts.FirstOrDefault(a => a.Email.ToLower() == normalizedEmail && a.Password == password);
        }

        // Normalizes and validates Australian phone numbers to international format (+61XXXXXXXXX).
        private string? NormalizeAustralianPhone(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return null;

            // Extract only digits
            var digits = new string(input.Where(char.IsDigit).ToArray());

            // Handle country code format (61XXXXXXXXX)
            if (digits.StartsWith("61"))
            {
                var rest = digits.Substring(2);
                if (rest.Length >= 8 && rest.Length <= 9)
                    return "+" + digits;
                return "+" + digits;
            }

            // Handle local format starting with 0 (0XXXXXXXXX)
            if (digits.StartsWith("0"))
            {
                var rest = digits.Substring(1);
                if (rest.Length >= 8 && rest.Length <= 9)
                    return "+61" + rest;
                return "+61" + rest;
            }

            // Handle raw number without prefix (assume Australian)
            if (digits.Length >= 8 && digits.Length <= 10)
                return "+61" + digits;

            return null;
        }
    }
}
