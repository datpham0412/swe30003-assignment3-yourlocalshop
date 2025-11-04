"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// role select removed; no select components needed here
import { Spinner } from "@/components/ui/spinner";

// Authentication page with tabs for sign-in and sign-up, redirecting users based on their role.
export default function AuthPage() {
  const router = useRouter();
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInMessage, setSignInMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [signUpMessage, setSignUpMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Authenticates user credentials and redirects to appropriate dashboard based on role.
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setSignInMessage(null);

    try {
      const response = await fetch(
        `http://localhost:5074/api/Auth/login?email=${encodeURIComponent(
          signInData.email
        )}&password=${encodeURIComponent(signInData.password)}`,
        { method: "POST" }
      );

      if (response.ok) {
        const data = await response.json();
        const role = data.role || "Customer";

        localStorage.setItem("email", signInData.email);
        localStorage.setItem("password", signInData.password);
        localStorage.setItem("role", role);

        setSignInMessage({ type: "success", text: "Successfully signed in!" });

        setTimeout(() => {
          if (role === "Admin") {
            router.push("/dashboard/admin");
          } else {
            router.push("/catalogue");
          }
        }, 500);
      } else {
        // Prefer JSON { message } error, fall back to plain text
        let errorText = "Sign in failed. Please try again.";
        try {
          const errJson = await response.json();
          errorText = errJson?.message ?? errorText;
        } catch {
          const txt = await response.text();
          if (txt) errorText = txt;
        }
        setSignInMessage({ type: "error", text: errorText });
      }
    } catch (error) {
      setSignInMessage({ type: "error", text: "Network error. Please check your connection." });
    } finally {
      setSignInLoading(false);
    }
  };

  // Registers a new customer account with validation for password matching and Australian phone format.
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    setSignUpMessage(null);

    if (!signUpData.name || signUpData.name.trim() === "") {
      setSignUpMessage({ type: "error", text: "Name is required." });
      setSignUpLoading(false);
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpMessage({ type: "error", text: "Passwords do not match." });
      setSignUpLoading(false);
      return;
    }

    // Normalizes Australian phone numbers to international format (+61XXXXXXXXX).
    const sanitizeAusPhone = (input: string) => {
      if (!input) return "";
      // Remove non-digit characters
      let digits = input.replace(/\D/g, "");
      // If it starts with 61 (country code) after stripping, normalize to +61
      if (digits.startsWith("61")) return "+" + digits;
      // If it starts with 0 (local), replace leading 0 with +61
      if (digits.startsWith("0")) return "+61" + digits.slice(1);
      // Otherwise, fallback to digits (caller should ensure correctness)
      return digits;
    };

    const phoneNormalized = sanitizeAusPhone(signUpData.phone);
    if (!phoneNormalized) {
      setSignUpMessage({ type: "error", text: "Phone number is required." });
      setSignUpLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5074/api/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpData.name,
          email: signUpData.email,
          password: signUpData.password,
          phone: phoneNormalized,
        }),
      });

      if (response.ok) {
        // Expect JSON with { message, role }
        try {
          const data = await response.json();
          const msg = data?.message ?? "Account created successfully!";
          setSignUpMessage({ type: "success", text: msg });
        } catch (e) {
          // Fallback to text if server returned plain text unexpectedly
          const serverText = await response.text();
          setSignUpMessage({
            type: "success",
            text: serverText || "Account created successfully!",
          });
        }
        setSignUpData({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
      } else {
        // Try to parse structured error first, fall back to text
        let errorText = "Sign up failed. Please try again.";
        try {
          const errJson = await response.json();
          errorText = errJson?.message ?? errorText;
        } catch {
          const txt = await response.text();
          if (txt) errorText = txt;
        }
        setSignUpMessage({ type: "error", text: errorText });
      }
    } catch (error) {
      setSignUpMessage({ type: "error", text: "Network error. Please check your connection." });
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
            Your Local Shop
          </h1>
          <p className="text-gray-600">Welcome to Your Local Shop — Sign in to continue</p>
        </div>

        <Card className="shadow-xl border-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                      className="rounded-lg"
                    />
                  </div>

                  {signInMessage && (
                    <p
                      className={`text-sm ${
                        signInMessage.type === "success" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {signInMessage.text}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                    disabled={signInLoading}
                  >
                    {signInLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Contact number (Australia)</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="04xx xxx xxx or +61 4xx xxx xxx"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                      }
                      required
                      className="rounded-lg"
                    />
                  </div>
                  {/* role removed: users will default to Customer on backend */}

                  {signUpMessage && (
                    <p
                      className={`text-sm ${
                        signUpMessage.type === "success" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {signUpMessage.text}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                    disabled={signUpLoading}
                  >
                    {signUpLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        Creating account...
                      </span>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          © 2025 Your Local Shop. All rights reserved.
        </p>
      </div>
    </div>
  );
}
