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
        private const decimal TAX_RATE = 0.10m; 

        public ShoppingCartController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromQuery] string email, [FromQuery] string password, [FromBody] AddToCartRequest request)
        {
            try
            {
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer.Id);

                if (cart == null)
                {
                    cart = new ShoppingCart { CustomerId = customer.Id };
                    _context.ShoppingCarts.Add(cart);
                    await _context.SaveChangesAsync(); 
                }

                var product = await _context.Products.FindAsync(request.ProductId);
                if (product == null)
                {
                    return BadRequest("Product not found.");
                }

                var inventory = await _context.Inventories
                    .FirstOrDefaultAsync(i => i.ProductId == request.ProductId);

                int availableQty = inventory?.Quantity ?? 0;

                var cartItem = new CartItem
                {
                    ProductId = request.ProductId,
                    ProductName = product.Name,
                    UnitPrice = product.Price,
                    Quantity = request.Quantity,
                    ShoppingCartId = cart.Id
                };

                cart.AddItem(cartItem, availableQty);
                cart.RecalculateTotals(TAX_RATE);

                await _context.SaveChangesAsync();

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
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer.Id);

                if (cart == null)
                {
                    return BadRequest("Shopping cart not found.");
                }

                var cartItem = cart.Items.FirstOrDefault(i => i.Id == request.CartItemId);
                if (cartItem == null)
                {
                    return BadRequest("Cart item not found.");
                }

                var product = await _context.Products.FindAsync(cartItem.ProductId);
                if (product == null)
                {
                    return BadRequest("Product not found.");
                }

                var inventory = await _context.Inventories
                    .FirstOrDefaultAsync(i => i.ProductId == cartItem.ProductId);

                int availableQty = inventory?.Quantity ?? 0;

                var updatedItem = new CartItem
                {
                    Id = request.CartItemId,
                    ProductId = cartItem.ProductId,
                    ProductName = product.Name,
                    UnitPrice = product.Price,
                    Quantity = request.Quantity,
                    ShoppingCartId = cart.Id
                };

                cart.UpdateItem(updatedItem, availableQty);
                cart.RecalculateTotals(TAX_RATE);

                await _context.SaveChangesAsync();

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
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer.Id);

                if (cart == null)
                {
                    return BadRequest("Shopping cart not found.");
                }

                cart.RemoveItem(request.CartItemId);
                cart.RecalculateTotals(TAX_RATE);

                await _context.SaveChangesAsync();

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
                var customer = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Email == email && a.Password == password && a.Role == "Customer");

                if (customer == null)
                {
                    return Unauthorized("Invalid credentials or not a customer account.");
                }

                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer.Id);

                if (cart == null)
                {
                    return Ok(new CartResponse
                    {
                        CartId = 0,
                        Items = new List<CartItemDto>(),
                        Subtotal = 0,
                        Tax = 0,
                        Total = 0
                    });
                }

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
                    Subtotal = i.GetSubtotal()
                }).ToList(),
                Subtotal = cart.Subtotal,
                Tax = cart.Tax,
                Total = cart.Total
            };
        }
    }
}
