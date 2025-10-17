using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.DTOs.Cart;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShoppingCartController : ControllerBase
    {
        private readonly AppDbContext _context;
        private const decimal TAX_RATE = 0.10m; // 10% tax rate

        public ShoppingCartController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromQuery] string email, [FromQuery] string password, [FromBody] AddToCartRequest request)
        {
            try
            {
                // Authenticate customer
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                // Get or create shopping cart for customer
                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer.Id);

                if (cart == null)
                {
                    cart = new ShoppingCart { CustomerId = customer.Id };
                    _context.ShoppingCarts.Add(cart);
                    await _context.SaveChangesAsync(); // Save to get cart ID
                }

                // Get product details
                var product = await _context.Products.FindAsync(request.ProductId);
                if (product == null)
                {
                    return BadRequest("Product not found.");
                }

                // Get available quantity from inventory
                var inventory = await _context.Inventories
                    .FirstOrDefaultAsync(i => i.ProductId == request.ProductId);

                int availableQty = inventory?.Quantity ?? 0;

                // Add item to cart
                cart.AddItem(request.ProductId, request.Quantity, product, availableQty);
                cart.RecalculateTotals(TAX_RATE);

                await _context.SaveChangesAsync();

                // Return cart response
                return Ok(MapToCartResponse(cart));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateCartItem([FromQuery] string email, [FromQuery] string password, [FromBody] UpdateCartItemRequest request)
        {
            try
            {
                // Authenticate customer
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                // Get customer's shopping cart
                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer.Id);

                if (cart == null)
                {
                    return BadRequest("Shopping cart not found.");
                }

                // Find the cart item
                var cartItem = cart.Items.FirstOrDefault(i => i.Id == request.CartItemId);
                if (cartItem == null)
                {
                    return BadRequest("Cart item not found.");
                }

                // Get product details
                var product = await _context.Products.FindAsync(cartItem.ProductId);
                if (product == null)
                {
                    return BadRequest("Product not found.");
                }

                // Get available quantity from inventory
                var inventory = await _context.Inventories
                    .FirstOrDefaultAsync(i => i.ProductId == cartItem.ProductId);

                int availableQty = inventory?.Quantity ?? 0;

                // Update item
                cart.UpdateItem(request.CartItemId, request.Quantity, product, availableQty);
                cart.RecalculateTotals(TAX_RATE);

                await _context.SaveChangesAsync();

                // Return cart response
                return Ok(MapToCartResponse(cart));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFromCart([FromQuery] string email, [FromQuery] string password, [FromBody] RemoveFromCartRequest request)
        {
            try
            {
                // Authenticate customer
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                // Get customer's shopping cart
                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer.Id);

                if (cart == null)
                {
                    return BadRequest("Shopping cart not found.");
                }

                // Remove item
                cart.RemoveItem(request.CartItemId);
                cart.RecalculateTotals(TAX_RATE);

                await _context.SaveChangesAsync();

                // Return cart response
                return Ok(MapToCartResponse(cart));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetCart([FromQuery] string email, [FromQuery] string password)
        {
            try
            {
                // Authenticate customer
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                // Get customer's shopping cart
                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer.Id);

                if (cart == null)
                {
                    // Return empty cart
                    return Ok(new CartResponse
                    {
                        CartId = 0,
                        Items = new List<CartItemDto>(),
                        Subtotal = 0,
                        Tax = 0,
                        Total = 0
                    });
                }

                // Return cart response
                return Ok(MapToCartResponse(cart));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        private CartResponse MapToCartResponse(ShoppingCart cart)
        {
            return new CartResponse
            {
                CartId = cart.Id,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    CartItemId = i.Id,
                    ProductId = i.ProductId,
                    Name = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    Subtotal = i.Subtotal
                }).ToList(),
                Subtotal = cart.Subtotal,
                Tax = cart.Tax,
                Total = cart.Total
            };
        }
    }
}
