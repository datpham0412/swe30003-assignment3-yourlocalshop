"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCart, Package, User, LogOut } from "lucide-react";
import Link from "next/link";

// Customer navigation bar with cart count badge and links to catalogue, cart, orders, and account.
export function CustomerNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Refresh cart count whenever the page route changes.
  useEffect(() => {
    fetchCartCount();
  }, [pathname]);

  // Fetches the total number of items in the customer's shopping cart from the API.
  const fetchCartCount = async () => {
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");

    if (!email || !password) return;

    try {
      const response = await fetch(
        `http://localhost:5074/api/ShoppingCart/list?email=${encodeURIComponent(
          email
        )}&password=${encodeURIComponent(password)}`
      );

      if (response.ok) {
        const data = await response.json();
        const totalItems =
          data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        setCartItemCount(totalItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  // Clears user credentials from local storage and redirects to authentication page.
  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth");
  };

  // Checks if the given path matches the current route for active navigation styling.
  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ShoppingBag className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
              Your Local Shop
            </h1>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/catalogue">
              <Button
                variant={isActive("/catalogue") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/catalogue")
                    ? "bg-gradient-to-r from-purple-600 to-emerald-500"
                    : "hover:bg-purple-50"
                }
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Catalogue
              </Button>
            </Link>

            <Link href="/cart">
              <Button
                variant={isActive("/cart") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/cart")
                    ? "bg-gradient-to-r from-purple-600 to-emerald-500 relative"
                    : "hover:bg-purple-50 relative"
                }
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/orders">
              <Button
                variant={isActive("/orders") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/orders")
                    ? "bg-gradient-to-r from-purple-600 to-emerald-500"
                    : "hover:bg-purple-50"
                }
              >
                <Package className="h-4 w-4 mr-2" />
                Orders
              </Button>
            </Link>

            <Link href="/account">
              <Button
                variant={isActive("/account") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/account")
                    ? "bg-gradient-to-r from-purple-600 to-emerald-500"
                    : "hover:bg-purple-50"
                }
              >
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            </Link>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors ml-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
