using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    // Provides shared reusable logic for all controllers, such as endpoint authorization, role checking and common utility methods.
    [ApiController]
    public abstract class BaseController : ControllerBase
    {
        protected readonly AppDbContext _context;

        protected BaseController(AppDbContext context)
        {
            _context = context;
        }

        #region Authentication Methods

        // Authenticates a user by email and password from query parameters, returning the account or null if authentication fails.
        protected async Task<Account?> AuthenticateUserAsync()
        {
            var email = HttpContext.Request.Query["email"].ToString();
            var password = HttpContext.Request.Query["password"].ToString();

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                return null;
            }

            var normalizedEmail = email.Trim().ToLowerInvariant();

            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Email.ToLower() == normalizedEmail && a.Password == password);
        }

        // Authenticates a user and checks if they have the specified role, returning the account or null.
        protected async Task<Account?> AuthenticateUserWithRoleAsync(string requiredRole)
        {
            var account = await AuthenticateUserAsync();

            if (account == null || account.Role != requiredRole)
            {
                return null;
            }

            return account;
        }

        // Authenticates a user and checks if they have any of the specified roles, returning the account or null.
        protected async Task<Account?> AuthenticateUserWithRolesAsync(params string[] allowedRoles)
        {
            var account = await AuthenticateUserAsync();

            if (account == null || !allowedRoles.Contains(account.Role))
            {
                return null;
            }

            return account;
        }

        #endregion

        #region Authorization Response Helpers

        // Returns a standardized Unauthorized response with the provided message.
        protected IActionResult UnauthorizedResponse(string message = "Invalid credentials.")
        {
            return Unauthorized(new { message });
        }

        // Returns a standardized Forbidden response for insufficient permissions.
        protected IActionResult ForbiddenResponse(string message = "You do not have permission to perform this action.")
        {
            return StatusCode(403, new { message });
        }

        #endregion

        #region Role Checking Methods

        // Checks if the authenticated user is a Customer, returning the account if true or an Unauthorized error.
        protected async Task<(Account? account, IActionResult? error)> ValidateCustomerAsync()
        {
            var account = await AuthenticateUserWithRoleAsync("Customer");
            if (account == null)
            {
                return (null, UnauthorizedResponse("Invalid credentials or not a customer account."));
            }
            return (account, null);
        }

        // Checks if the authenticated user is an Admin, returning the account if true or an Unauthorized error.
        protected async Task<(Account? account, IActionResult? error)> ValidateAdminAsync()
        {
            var account = await AuthenticateUserWithRoleAsync("Admin");
            if (account == null)
            {
                return (null, UnauthorizedResponse("Invalid credentials or not an admin account."));
            }
            return (account, null);
        }

        // Checks if the authenticated user is a Staff member, returning the account if true or an Unauthorized error.
        protected async Task<(Account? account, IActionResult? error)> ValidateStaffAsync()
        {
            var account = await AuthenticateUserWithRoleAsync("Staff");
            if (account == null)
            {
                return (null, UnauthorizedResponse("Invalid credentials or not a staff account."));
            }
            return (account, null);
        }

        // Checks if the authenticated user is either Admin or Staff, returning the account if true or an Unauthorized error.
        protected async Task<(Account? account, IActionResult? error)> ValidateAdminOrStaffAsync()
        {
            var account = await AuthenticateUserWithRolesAsync("Admin", "Staff");
            if (account == null)
            {
                return (null, UnauthorizedResponse("Invalid credentials or insufficient permissions. Admin or Staff role required."));
            }
            return (account, null);
        }

        #endregion

        #region Common Utility Methods

        // Checks if the current user is the owner of the specified account or has Admin privileges.
        protected bool IsOwnerOrAdmin(Account currentUser, int targetAccountId)
        {
            return currentUser.Id == targetAccountId || currentUser.Role == "Admin";
        }

        // Gets the email from query parameters.
        protected string? GetEmailFromQuery()
        {
            return HttpContext.Request.Query["email"].ToString();
        }

        // Gets the password from query parameters.
        protected string? GetPasswordFromQuery()
        {
            return HttpContext.Request.Query["password"].ToString();
        }

        // Returns a standardized success response with a message and optional data.
        protected IActionResult SuccessResponse(string message, object? data = null)
        {
            if (data == null)
            {
                return Ok(new { message });
            }
            return Ok(new { message, data });
        }

        // Returns a standardized error response with a message and status code.
        protected IActionResult ErrorResponse(string message, int statusCode = 400)
        {
            return StatusCode(statusCode, new { message });
        }

        #endregion
    }
}
