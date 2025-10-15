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

        public string CreateAccount(string email, string password, string role)
        {
            if (_context.Accounts.Any(a => a.Email == email))
                return "Account with this email already exists.";

            Account newAccount;

            if (role.ToLower() == "admin")
                newAccount = new AdminAccount(_context) { Email = email, Password = password };
            else
                newAccount = new CustomerAccount { Email = email, Password = password };

            _context.Accounts.Add(newAccount);
            _context.SaveChanges();

            NotifyEmailSender(email);
            return $"{role} account created successfully!";
        }

        public Account? Authenticate(string email, string password)
        {
            return _context.Accounts.FirstOrDefault(a => a.Email == email && a.Password == password);
        }

        private void NotifyEmailSender(string email)
        {
            Console.WriteLine($"[EmailSender] Account for {email} created successfully.");
        }
    }
}
