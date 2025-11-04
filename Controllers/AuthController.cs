using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Managers;
using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;

namespace Assignment_3_SWE30003.Controllers
{
    [Route("api/[controller]")]
    public class AuthController : BaseController
    {
        private readonly AccountManager _manager;
        private readonly EmailSender _emailSender;

        public AuthController(AppDbContext context, AccountManager manager, EmailSender emailSender) : base(context)
        {
            _manager = manager;
            _emailSender = emailSender;
            
            // Attach EmailSender to observe account creation events
            _manager.Attach(_emailSender);
        }

    public class RegisterDto { public string? Name { get; set; } public string? Email { get; set; } public string? Password { get; set; } public string? Phone { get; set; } }
    public class CreateByAdminDto { public string? NewEmail { get; set; } public string? NewPassword { get; set; } public string? Role { get; set; } public string? Name { get; set; } public string? Phone { get; set; } }
    public class UpdateAccountDto { public string? Name { get; set; } public string? Email { get; set; } public string? Password { get; set; } public string? Phone { get; set; } }

        // Registers a new customer account with name, email, password, and phone number.
        [HttpPost("register")]
        public async Task<IActionResult> Register()
        {
            string? reqName = null;
            string? reqEmail = null;
            string? reqPassword = null;
            string? reqPhone = null;

            // Try to read from JSON body
            try
            {
                var body = await HttpContext.Request.ReadFromJsonAsync<RegisterDto>();
                if (body != null)
                {
                    reqName = body.Name;
                    reqEmail = body.Email;
                    reqPassword = body.Password;
                    reqPhone = body.Phone;
                }
            }
            catch { }

            // Fallback to query parameters if JSON body is empty
            if (string.IsNullOrEmpty(reqEmail)) reqEmail = HttpContext.Request.Query["email"].ToString();
            if (string.IsNullOrEmpty(reqPassword)) reqPassword = HttpContext.Request.Query["password"].ToString();
            if (string.IsNullOrEmpty(reqPhone)) reqPhone = HttpContext.Request.Query["phone"].ToString();

            if (string.IsNullOrEmpty(reqName) || string.IsNullOrEmpty(reqEmail) || string.IsNullOrEmpty(reqPassword))
                return BadRequest(new { message = "Name, email and password are required." });

            // Create account through manager
            var result = _manager.CreateAccount(reqName, reqEmail, reqPassword, reqPhone);
            
            // Check for error messages in result
            if (result != null)
            {
                var low = result.ToLower();
                if (low.Contains("already exists") || low.Contains("required") || low.Contains("invalid"))
                    return BadRequest(new { message = result });
            }

            return Ok(new { message = result, role = "Customer" });
        }

        // Lists all user accounts (admin only).
        [HttpGet("list")]
        public IActionResult List()
        {
            var (admin, error) = ValidateAdminAsync().Result;
            if (error != null) return error;

            var accounts = _manager.ListAccounts();
            var safe = accounts.Select(a => new { a.Id, a.Email, a.Role, a.Status }).ToList();
            return Ok(safe);
        }

        // Creates a new account with specified role (admin operation only).
        [HttpPost("createbyadmin")]
        public async Task<IActionResult> CreateByAdmin()
        {
            // Admin credentials from query parameters
            var adminEmail = HttpContext.Request.Query["email"].ToString();
            var adminPassword = HttpContext.Request.Query["password"].ToString();

            // New account details from JSON body
            string? reqNewEmail = null;
            string? reqNewPassword = null;
            string reqRole = "Customer";
            string? reqName = null;
            string? reqPhone = null;

            try
            {
                var body = await HttpContext.Request.ReadFromJsonAsync<CreateByAdminDto>();
                if (body != null)
                {
                    reqNewEmail = body.NewEmail;
                    reqNewPassword = body.NewPassword;
                    reqRole = string.IsNullOrEmpty(body.Role) ? "Customer" : body.Role!;
                    reqName = body.Name;
                    reqPhone = body.Phone;
                }
            }
            catch { }

            // Fallback to query parameters
            if (string.IsNullOrEmpty(reqNewEmail)) reqNewEmail = HttpContext.Request.Query["newEmail"].ToString();
            if (string.IsNullOrEmpty(reqNewPassword)) reqNewPassword = HttpContext.Request.Query["newPassword"].ToString();
            if (string.IsNullOrEmpty(reqPhone)) reqPhone = HttpContext.Request.Query["phone"].ToString();
            var roleQuery = HttpContext.Request.Query["role"].ToString();
            if (!string.IsNullOrEmpty(roleQuery)) reqRole = roleQuery;
            if (string.IsNullOrEmpty(reqName)) reqName = HttpContext.Request.Query["name"].ToString();

            // Validate required fields
            if (string.IsNullOrEmpty(reqNewEmail) || string.IsNullOrEmpty(reqNewPassword))
                return BadRequest(new { message = "newEmail and newPassword are required." });

            if (string.IsNullOrEmpty(reqName))
                return BadRequest(new { message = "Name is required for new accounts." });
            if (string.IsNullOrEmpty(reqPhone))
                return BadRequest(new { message = "Phone number is required for new accounts." });

            // Verify admin credentials
            if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword))
                return Unauthorized(new { message = "Admin credentials required." });

            var user = _manager.Authenticate(adminEmail, adminPassword);
            if (user == null || user.Role != "Admin")
                return Unauthorized("Admin credentials required.");

            // Create account with specified role
            var result = _manager.CreateAccountWithRole(reqNewEmail, reqNewPassword, reqRole ?? "Customer", reqName, reqPhone);
            if (result != null)
            {
                var low = result.ToLower();
                if (low.Contains("already exists") || low.Contains("required") || low.Contains("invalid"))
                    return BadRequest(new { message = result });
            }

            return Ok(new { message = result, role = reqRole });
        }

        // Authenticates a user with email and password.
        [HttpPost("login")]
        public IActionResult Login(string email, string password)
        {
            var user = _manager.Authenticate(email, password);
            if (user == null)
                return Unauthorized(new { message = "Invalid credentials!" });

            return Ok(new { message = "Login successful!", role = user.Role });
        }

        // Returns the authenticated user's account information.
        [HttpGet("me")]
        public IActionResult Me()
        {
            var user = AuthenticateUserAsync().Result;
            if (user == null) return UnauthorizedResponse("Invalid credentials.");

            return Ok(new { id = user.Id, name = user.Name, email = user.Email, phone = user.Phone, password = user.Password, role = user.Role });
        }

        // Updates the authenticated user's account information (name, email, password, or phone).
        [HttpPost("update")]
        public async Task<IActionResult> Update()
        {
            // Current credentials for authentication
            var currentEmail = HttpContext.Request.Query["email"].ToString();
            var currentPassword = HttpContext.Request.Query["password"].ToString();

            if (string.IsNullOrEmpty(currentEmail) || string.IsNullOrEmpty(currentPassword))
                return Unauthorized(new { message = "Current credentials required." });

            string? newName = null;
            string? newEmail = null;
            string? newPassword = null;
            string? newPhone = null;

            // Read update details from JSON body
            try
            {
                var body = await HttpContext.Request.ReadFromJsonAsync<UpdateAccountDto>();
                if (body != null)
                {
                    newName = body.Name;
                    newEmail = body.Email;
                    newPassword = body.Password;
                    newPhone = body.Phone;
                }
            }
            catch { }

            // Authenticate user
            var user = _manager.Authenticate(currentEmail, currentPassword);
            if (user == null) return Unauthorized(new { message = "Invalid credentials." });

            // Update account through model method
            var result = user.UpdateAccount(_context, newName, newEmail, newPassword, newPhone);
            if (result != null)
            {
                var low = result.ToLower();
                if (low.Contains("already exists") || low.Contains("invalid") || low.Contains("credentials"))
                    return BadRequest(new { message = result });
            }

            return Ok(new { message = result });
        }
    }
}
