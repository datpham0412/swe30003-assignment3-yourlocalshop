"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";

// Props for the product creation form including admin credentials and callbacks.
interface AddProductFormProps {
  email: string;
  password: string;
  onProductAdded: () => void;
  onShowToast: (type: "success" | "error", text: string) => void;
}

// Form component for admins to add new products with name, category, and price.
export default function AddProductForm({
  email,
  password,
  onProductAdded,
  onShowToast,
}: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  // Submits new product data to the API and notifies parent component on success.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5074/api/Product/add?email=${encodeURIComponent(
          email
        )}&password=${encodeURIComponent(password)}&name=${encodeURIComponent(
          formData.name
        )}&price=${encodeURIComponent(formData.price)}&category=${encodeURIComponent(
          formData.category
        )}`,
        { method: "POST" }
      );

      if (response.ok) {
        onShowToast("success", "Product added successfully!");
        setFormData({ name: "", price: "", category: "" });
        onProductAdded();
      } else {
        const errorText = await response.text();
        onShowToast("error", errorText || "Failed to add product.");
      }
    } catch (error) {
      onShowToast("error", "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-purple-100 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-purple-600" />
          Add New Product
        </CardTitle>
        <CardDescription>Fill in the details to add a product</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Organic Apples"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              type="text"
              placeholder="e.g., Fruits"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="9.99"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              className="rounded-lg"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Adding Product...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
