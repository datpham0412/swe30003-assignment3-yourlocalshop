using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    /// <summary>
    /// Provides shared reusable logic for all controllers, such as endpoint authorization, 
    /// role checking and common utility methods.
    /// </summary>
    [ApiController]
    public abstract class BaseController : ControllerBase
    {
        protected readonly AppDbContext _context;

        protected BaseController(AppDbContext context)
        {
            _context = context;
        }

        #region Authentication Methods

        /// <summary>
        /// Authenticates a user by email and password from query parameters.
        /// Returns the authenticated account or null if authentication fails.
        /// </summary>
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

        /// <summary>
        /// Authenticates a user and checks if they have the specified role.
        /// Returns the authenticated account or null if authentication or role check fails.
        /// </summary>
        protected async Task<Account?> AuthenticateUserWithRoleAsync(string requiredRole)
        {
            var account = await AuthenticateUserAsync();
            
            if (account == null || account.Role != requiredRole)
            {
                return null;
            }

            return account;
        }

        /// <summary>
        /// Authenticates a user and checks if they have any of the specified roles.
        /// Returns the authenticated account or null if authentication or role check fails.
        /// </summary>
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

        /// <summary>
        /// Returns a standardized Unauthorized response.
        /// </summary>
        protected IActionResult UnauthorizedResponse(string message = "Invalid credentials.")
        {
            return Unauthorized(new { message });
        }

        /// <summary>
        /// Returns a standardized Forbidden response for insufficient permissions.
        /// </summary>
        protected IActionResult ForbiddenResponse(string message = "You do not have permission to perform this action.")
        {
            return StatusCode(403, new { message });
        }

        #endregion

        #region Role Checking Methods

        /// <summary>
        /// Checks if the authenticated user is a Customer.
        /// Returns the account if true, otherwise returns an Unauthorized action result.
        /// </summary>
        protected async Task<(Account? account, IActionResult? error)> ValidateCustomerAsync()
        {
            var account = await AuthenticateUserWithRoleAsync("Customer");
            if (account == null)
            {
                return (null, UnauthorizedResponse("Invalid credentials or not a customer account."));
            }
            return (account, null);
        }

        /// <summary>
        /// Checks if the authenticated user is an Admin.
        /// Returns the account if true, otherwise returns an Unauthorized action result.
        /// </summary>
        protected async Task<(Account? account, IActionResult? error)> ValidateAdminAsync()
        {
            var account = await AuthenticateUserWithRoleAsync("Admin");
            if (account == null)
            {
                return (null, UnauthorizedResponse("Invalid credentials or not an admin account."));
            }
            return (account, null);
        }

        /// <summary>
        /// Checks if the authenticated user is a Staff member.
        /// Returns the account if true, otherwise returns an Unauthorized action result.
        /// </summary>
        protected async Task<(Account? account, IActionResult? error)> ValidateStaffAsync()
        {
            var account = await AuthenticateUserWithRoleAsync("Staff");
            if (account == null)
            {
                return (null, UnauthorizedResponse("Invalid credentials or not a staff account."));
            }
            return (account, null);
        }

        /// <summary>
        /// Checks if the authenticated user is either Admin or Staff.
        /// Returns the account if true, otherwise returns an Unauthorized action result.
        /// </summary>
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

        /// <summary>
        /// Checks if the current user is the owner of the specified account or has Admin privileges.
        /// </summary>
        protected bool IsOwnerOrAdmin(Account currentUser, int targetAccountId)
        {
            return currentUser.Id == targetAccountId || currentUser.Role == "Admin";
        }

        /// <summary>
        /// Gets the email from query parameters.
        /// </summary>
        protected string? GetEmailFromQuery()
        {
            return HttpContext.Request.Query["email"].ToString();
        }

        /// <summary>
        /// Gets the password from query parameters.
        /// </summary>
        protected string? GetPasswordFromQuery()
        {
            return HttpContext.Request.Query["password"].ToString();
        }

        /// <summary>
        /// Returns a standardized success response with a message and optional data.
        /// </summary>
        protected IActionResult SuccessResponse(string message, object? data = null)
        {
            if (data == null)
            {
                return Ok(new { message });
            }
            return Ok(new { message, data });
        }

        /// <summary>
        /// Returns a standardized error response with a message.
        /// </summary>
        protected IActionResult ErrorResponse(string message, int statusCode = 400)
        {
            return StatusCode(statusCode, new { message });
        }

        #endregion
    }
}
