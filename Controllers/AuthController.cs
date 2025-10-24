using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Managers;
using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AccountManager _manager;
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
            _manager = new AccountManager(context);
        }

    public class RegisterDto { public string? Name { get; set; } public string? Email { get; set; } public string? Password { get; set; } public string? Phone { get; set; } }
    public class CreateByAdminDto { public string? NewEmail { get; set; } public string? NewPassword { get; set; } public string? Role { get; set; } public string? Name { get; set; } public string? Phone { get; set; } }
    public class UpdateAccountDto { public string? Name { get; set; } public string? Email { get; set; } public string? Password { get; set; } public string? Phone { get; set; } }

        [HttpPost("register")]
        public async Task<IActionResult> Register()
        {
            // Read from JSON body first
            string? reqName = null;
            string? reqEmail = null;
            string? reqPassword = null;
            string? reqPhone = null;

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
            catch
            {
                // ignore
            }

            // Fallback to query params
            if (string.IsNullOrEmpty(reqEmail)) reqEmail = HttpContext.Request.Query["email"].ToString();
            if (string.IsNullOrEmpty(reqPassword)) reqPassword = HttpContext.Request.Query["password"].ToString();
            if (string.IsNullOrEmpty(reqPhone)) reqPhone = HttpContext.Request.Query["phone"].ToString();

            if (string.IsNullOrEmpty(reqName) || string.IsNullOrEmpty(reqEmail) || string.IsNullOrEmpty(reqPassword))
                return BadRequest(new { message = "Name, email and password are required." });

            var result = _manager.CreateAccount(reqName, reqEmail, reqPassword, reqPhone);
            // If manager indicates a problem (duplicate or missing), respond with 400 so frontend can treat it as an error
            if (result != null)
            {
                var low = result.ToLower();
                if (low.Contains("already exists") || low.Contains("required") || low.Contains("invalid"))
                    return BadRequest(new { message = result });
            }

            // Return structured JSON so clients can parse message and role
            return Ok(new { message = result, role = "Customer" });
        }

        [HttpGet("list")]
        public IActionResult List(string email, string password)
        {
            var user = _manager.Authenticate(email, password);
            if (user == null || user.Role != "Admin")
                return Unauthorized("Admin credentials required.");

            var accounts = _manager.ListAccounts();
            var safe = accounts.Select(a => new { a.Id, a.Email, a.Role, a.Status }).ToList();
            return Ok(safe);
        }

        [HttpPost("createbyadmin")]
        public async Task<IActionResult> CreateByAdmin()
        {
            // Admin credentials expected as query params (email & password)
            var adminEmail = HttpContext.Request.Query["email"].ToString();
            var adminPassword = HttpContext.Request.Query["password"].ToString();

            // Read new account details from JSON body first
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
            catch
            {
                // ignore parse errors
            }

            // Fallback to query params
            if (string.IsNullOrEmpty(reqNewEmail)) reqNewEmail = HttpContext.Request.Query["newEmail"].ToString();
            if (string.IsNullOrEmpty(reqNewPassword)) reqNewPassword = HttpContext.Request.Query["newPassword"].ToString();
            if (string.IsNullOrEmpty(reqPhone)) reqPhone = HttpContext.Request.Query["phone"].ToString();
            var roleQuery = HttpContext.Request.Query["role"].ToString();
            if (!string.IsNullOrEmpty(roleQuery)) reqRole = roleQuery;
            if (string.IsNullOrEmpty(reqName)) reqName = HttpContext.Request.Query["name"].ToString();

            if (string.IsNullOrEmpty(reqNewEmail) || string.IsNullOrEmpty(reqNewPassword))
                return BadRequest(new { message = "newEmail and newPassword are required." });

            // Require name and phone for admin-created accounts (manager will also enforce this, but return a clearer message earlier)
            if (string.IsNullOrEmpty(reqName))
                return BadRequest(new { message = "Name is required for new accounts." });
            if (string.IsNullOrEmpty(reqPhone))
                return BadRequest(new { message = "Phone number is required for new accounts." });

            if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword))
                return Unauthorized(new { message = "Admin credentials required." });

            var user = _manager.Authenticate(adminEmail, adminPassword);
            if (user == null || user.Role != "Admin")
                return Unauthorized("Admin credentials required.");

            var result = _manager.CreateAccountWithRole(reqNewEmail, reqNewPassword, reqRole ?? "Customer", reqName, reqPhone);
            if (result != null)
            {
                var low = result.ToLower();
                if (low.Contains("already exists") || low.Contains("required") || low.Contains("invalid"))
                    return BadRequest(new { message = result });
            }

            // Return structured JSON so clients can parse message and role
            return Ok(new { message = result, role = reqRole });
        }

        [HttpPost("login")]
        public IActionResult Login(string email, string password)
        {
            var user = _manager.Authenticate(email, password);
            if (user == null)
                return Unauthorized(new { message = "Invalid credentials!" });

            // Return structured JSON so clients can parse message and role
            return Ok(new { message = "Login successful!", role = user.Role });
        }

        [HttpGet("me")]
        public IActionResult Me(string email, string password)
        {
            var user = _manager.Authenticate(email, password);
            if (user == null) return Unauthorized(new { message = "Invalid credentials." });

            // Return account info (including password because the app stores it in plaintext).
            return Ok(new { id = user.Id, name = user.Name, email = user.Email, phone = user.Phone, password = user.Password, role = user.Role });
        }

        [HttpPost("update")]
        public async Task<IActionResult> Update()
        {
            // Current credentials expected as query params for authentication
            var currentEmail = HttpContext.Request.Query["email"].ToString();
            var currentPassword = HttpContext.Request.Query["password"].ToString();

            if (string.IsNullOrEmpty(currentEmail) || string.IsNullOrEmpty(currentPassword))
                return Unauthorized(new { message = "Current credentials required." });

            string? newName = null;
            string? newEmail = null;
            string? newPassword = null;
            string? newPhone = null;

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

            var user = _manager.Authenticate(currentEmail, currentPassword);
            if (user == null) return Unauthorized(new { message = "Invalid credentials." });

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
