using Microsoft.AspNetCore.Mvc;
using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using System.Linq;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register(Account account)
        {
            if (_context.Accounts.Any(a => a.Username == account.Username))
                return BadRequest("Username already exists!");

            _context.Accounts.Add(account);
            _context.SaveChanges();
            return Ok("Registration successful!");
        }

        [HttpPost("login")]
        public IActionResult Login(Account loginData)
        {
            var user = _context.Accounts
                .FirstOrDefault(a => a.Username == loginData.Username && a.Password == loginData.Password);

            if (user == null)
                return Unauthorized("Invalid credentials!");

            return Ok(new { Message = "Login successful!", Role = user.Role });
        }
    }
}

