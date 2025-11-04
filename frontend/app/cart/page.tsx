"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CustomerNav } from "@/components/customer/CustomerNav";

// Cart item data structure with product details and subtotal.
interface CartItem {
  cartItemId: number;
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

// Shopping cart data structure with items and pricing totals.
interface Cart {
  cartId: number;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// Shopping cart page allowing customers to view, update quantities, remove items, and proceed to checkout.
export default function CartPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Cart | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  // Checks authentication and loads cart data when component mounts.
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    const storedRole = localStorage.getItem("role");

    if (!storedEmail || !storedPassword || storedRole !== "Customer") {
      router.push("/auth");
      return;
    }

    setEmail(storedEmail);
    setPassword(storedPassword);
    fetchCart(storedEmail, storedPassword);
  }, [router]);

  // Fetches the customer's shopping cart from the API.
  const fetchCart = async (userEmail: string, userPassword: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5074/api/ShoppingCart/list?email=${encodeURIComponent(
          userEmail
        )}&password=${encodeURIComponent(userPassword)}`
      );

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        toast.error("Failed to load cart", {
          description: "Please try again",
        });
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Please check your connection",
      });
    } finally {
      setLoading(false);
    }
  };

  // Updates the quantity of a specific cart item, refreshing the cart totals.
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));

    try {
      const response = await fetch(
        `http://localhost:5074/api/ShoppingCart/update?email=${encodeURIComponent(
          email!
        )}&password=${encodeURIComponent(password!)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId, quantity: newQuantity }),
        }
      );

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        toast.success("Cart updated");
      } else {
        const errorText = await response.text();
        toast.error("Failed to update cart", {
          description: errorText || "Please try again",
        });
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const removeItem = async (cartItemId: number) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));

    try {
      const response = await fetch(
        `http://localhost:5074/api/ShoppingCart/remove?email=${encodeURIComponent(
          email!
        )}&password=${encodeURIComponent(password!)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId }),
        }
      );

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        toast.success("Item removed from cart");
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      {/* Header */}
      <CustomerNav />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button
            onClick={() => router.push("/catalogue")}
            variant="ghost"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">Shopping Cart</h2>
            </div>

            {!cart || cart.items.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                  <Button
                    onClick={() => router.push("/catalogue")}
                    className="bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600"
                  >
                    Browse Catalogue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <Card
                    key={item.cartItemId}
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                          <p className="text-emerald-600 font-medium">
                            ${item.unitPrice.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 border rounded-lg p-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              disabled={updatingItems.has(item.cartItemId) || item.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              disabled={updatingItems.has(item.cartItemId)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Subtotal */}
                          <div className="w-24 text-right">
                            <p className="font-bold text-gray-900">${item.subtotal.toFixed(2)}</p>
                          </div>

                          {/* Remove Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.cartItemId)}
                            disabled={updatingItems.has(item.cartItemId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cart && cart.items.length > 0 && (
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (10%)</span>
                      <span>${cart.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-emerald-600">${cart.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-lg py-6"
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
