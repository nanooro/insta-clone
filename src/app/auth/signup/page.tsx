"use client"
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          username: formData.username,
          phone: formData.phone
        }
      }
    });

    if (error) {
      console.error("Signup error:", error);
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      console.log("Signup successful:", data.user.email);

      // Create profile entry
      try {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.fullName,
          username: formData.username,
          bio: '',
          website: '',
          avatar_url: ''
        });
      } catch (profileError) {
        console.error("Error creating profile:", profileError);
        // Don't fail signup if profile creation fails
      }

      toast.success("Account created! Check your email for verification link.");
      
      // Redirect to login page after successful signup
      setTimeout(() => {
        window.location.href = "/auth";
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center relative">
      <Image
        src="/amith-nair-jQAk1lZL5Jk-unsplash.jpg"
        alt="Background"
        fill
        className="absolute top-0 left-0 z-[-1] object-cover"
      />
      <Card className="w-full max-w-md p-8 flex flex-col justify-center items-center gap-6 bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl shadow-black/10 rounded-2xl">
        <h1 className="text-2xl font-bold text-center">
          Sign up for{" "}
          <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            Insta-clone
          </span>
        </h1>

        <form onSubmit={handleSignup} className="w-full space-y-4">
          <Input
            name="fullName"
            placeholder="Full name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="bg-white"
          />
          <Input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="bg-white"
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-white"
          />
          <Input
            name="phone"
            type="tel"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            className="bg-white"
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-white"
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="bg-white"
          />

          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center font-medium">
                ⚠️ {error}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className={`w-full ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </div>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-4 w-full">
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <span className="text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>

        <Link href="/auth">
          <span className="text-blue-500 font-medium cursor-pointer">
            Already have an account? <span className="underline">Sign in</span>
          </span>
        </Link>
      </Card>
    </div>
  );
}