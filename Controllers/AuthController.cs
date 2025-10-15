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

        public AuthController(AppDbContext context)
        {
            _manager = new AccountManager(context);
        }

        [HttpPost("register")]
        public IActionResult Register(string email, string password, string role = "Customer")
        {
            var result = _manager.CreateAccount(email, password, role);
            return Ok(result);
        }

        [HttpPost("login")]
        public IActionResult Login(string email, string password)
        {
            var user = _manager.Authenticate(email, password);
            if (user == null)
                return Unauthorized("Invalid credentials!");

            return Ok(new { Message = "Login successful!", Role = user.Role });
        }
    }
}
