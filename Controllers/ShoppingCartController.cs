using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.DTOs.Cart;
using Assignment_3_SWE30003.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment_3_SWE30003.Controllers
{
    [Route("api/[controller]")]
    public class ShoppingCartController : BaseController
    {
        private const decimal TAX_RATE = 0.10m;

        // Initialize controller with database context
        public ShoppingCartController(AppDbContext context) : base(context)
        {
        }

        // Add a product to the customer's shopping cart (requires customer authentication)
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            try
            {
                // Authenticate customer using BaseController
                var (customer, error) = await ValidateCustomerAsync();
                if (error != null) return error;

                // Get or create shopping cart
                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer!.Id);

                if (cart == null)
                {
                    cart = new ShoppingCart { CustomerId = customer!.Id };
                    _context.ShoppingCarts.Add(cart);
                    await _context.SaveChangesAsync();
                }

                // Verify product exists
                var product = await _context.Products.FindAsync(request.ProductId);
                if (product == null)
                {
                    return BadRequest("Product not found.");
                }

                // Check available inventory
                var inventoryProduct = await _context.InventoryProducts
                    .FirstOrDefaultAsync(i => i.ProductId == request.ProductId);

                int availableQty = inventoryProduct?.Quantity ?? 0;

                // Create cart item with product details
                var cartItem = new CartItem
                {
                    ProductId = request.ProductId,
                    ProductName = product.Name,
                    UnitPrice = product.Price,
                    Quantity = request.Quantity,
                    ShoppingCartId = cart.Id
                };

                // Add item and recalculate totals
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

        // Update the quantity of an existing item in the shopping cart (requires customer authentication)
        [HttpPut("update")]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemRequest request)
        {
            try
            {
                // Authenticate customer using BaseController
                var (customer, error) = await ValidateCustomerAsync();
                if (error != null) return error;

                // Get customer's cart
                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer!.Id);

                if (cart == null)
                {
                    return BadRequest("Shopping cart not found.");
                }

                // Find cart item to update
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

                // Check available inventory
                var inventoryProduct = await _context.InventoryProducts
                    .FirstOrDefaultAsync(i => i.ProductId == cartItem.ProductId);

                int availableQty = inventoryProduct?.Quantity ?? 0;

                // Create updated cart item
                var updatedItem = new CartItem
                {
                    Id = request.CartItemId,
                    ProductId = cartItem.ProductId,
                    ProductName = product.Name,
                    UnitPrice = product.Price,
                    Quantity = request.Quantity,
                    ShoppingCartId = cart.Id
                };

                // Update item and recalculate totals
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

        // Remove an item from the shopping cart (requires customer authentication)
        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFromCart([FromBody] RemoveFromCartRequest request)
        {
            try
            {
                // Authenticate customer using BaseController
                var (customer, error) = await ValidateCustomerAsync();
                if (error != null) return error;

                // Get customer's cart
                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer!.Id);

                if (cart == null)
                {
                    return BadRequest("Shopping cart not found.");
                }

                // Remove item and recalculate totals
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

        // Retrieve the customer's current shopping cart with all items (requires customer authentication)
        [HttpGet("list")]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                // Authenticate customer using BaseController
                var (customer, error) = await ValidateCustomerAsync();
                if (error != null) return error;

                // Get customer's cart
                var cart = await _context.ShoppingCarts
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CustomerId == customer!.Id);

                // Return empty cart if none exists
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

        // Convert shopping cart model to response DTO with all item details
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
