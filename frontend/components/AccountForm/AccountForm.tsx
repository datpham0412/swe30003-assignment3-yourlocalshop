"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Props for account form including optional back navigation and save callback.
interface Props {
  backHref?: string;
  onSaved?: (data: { name: string; email: string; phone: string }) => void;
}

// Form for users to view and update their account details like name, email, phone, and password.
export default function AccountForm({ backHref = "/catalogue", onSaved }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Loads current account information from the API when component mounts.
  useEffect(() => {
    const emailLS = localStorage.getItem("email");
    const passwordLS = localStorage.getItem("password");
    if (!emailLS || !passwordLS) {
      router.push("/auth");
      return;
    }

    const fetchAccount = async () => {
      setLoading(true);
      try {
        const resp = await fetch(
          `http://localhost:5074/api/Auth/me?email=${encodeURIComponent(
            emailLS
          )}&password=${encodeURIComponent(passwordLS)}`
        );
        if (!resp.ok) {
          try {
            const err = await resp.json();
            setMessage({ type: "error", text: err?.message ?? "Failed to load account info." });
          } catch {
            const txt = await resp.text();
            setMessage({ type: "error", text: txt || "Failed to load account info." });
          }
          return;
        }

        const data = await resp.json();
        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setPassword(data.password ?? "");
        setPhone(data.phone ?? "");
      } catch (e) {
        setMessage({ type: "error", text: "Network error. Please check your connection." });
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [router]);

  // Submits updated account information to the API and updates local storage if email or password changed.
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const emailLS = localStorage.getItem("email");
    const passwordLS = localStorage.getItem("password");
    if (!emailLS || !passwordLS) {
      router.push("/auth");
      return;
    }

    try {
      const resp = await fetch(
        `http://localhost:5074/api/Auth/update?email=${encodeURIComponent(
          emailLS
        )}&password=${encodeURIComponent(passwordLS)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone }),
        }
      );

      if (!resp.ok) {
        try {
          const err = await resp.json();
          setMessage({ type: "error", text: err?.message ?? "Failed to update account." });
          toast.error(err?.message ?? "Failed to update account.");
        } catch {
          const txt = await resp.text();
          setMessage({ type: "error", text: txt || "Failed to update account." });
          toast.error(txt || "Failed to update account.");
        }
        return;
      }

      const data = await resp.json();
      const msg = data?.message ?? "Updated";
      setMessage({ type: "success", text: msg });
      toast.success(msg);

      // If email changed, update localStorage
      if (email !== emailLS) {
        localStorage.setItem("email", email);
      }
      // If password changed, update localStorage
      if (password !== passwordLS) {
        localStorage.setItem("password", password);
      }

      if (onSaved) onSaved({ name, email, phone });
    } catch (e) {
      setMessage({ type: "error", text: "Network error. Please check your connection." });
      toast.error("Network error. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-12 w-12 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <main className="container mx-auto px-4 py-8 max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Your Account</CardTitle>
            <CardDescription>View and update your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Changing email will be checked for uniqueness before allowing the update.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {message && (
                <p
                  className={`text-sm ${
                    message.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message.text}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-purple-700"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Saving...
                    </span>
                  ) : (
                    "Save changes"
                  )}
                </Button>

                <Button variant="ghost" onClick={() => router.push(backHref)}>
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
