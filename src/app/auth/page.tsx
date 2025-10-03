"use client"
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
export default function Auth() {

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (error) {
      console.error("Login error:", error);
      setError(error.message);
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      console.log("Login successful:", data.user.email);
      toast.success("Welcome back, " + (data.user.user_metadata?.full_name || data.user.email) + "!");
      
      // Small delay to show toast, then redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen p-2 flex flex-col justify-center items-center relative">
      <Image
        src="/amith-nair-jQAk1lZL5Jk-unsplash.jpg"
        alt="Background"
        fill
        className="absolute top-0 left-0 z-[-1] object-cover"
      />
      <Card className="w-full max-w-md p-8 flex flex-col justify-center items-center gap-6 bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl shadow-black/10 rounded-2xl">
        <h1 className="text-2xl font-bold text-center">
          Sign in to{" "}
          <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            Insta-clone
          </span>
        </h1>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <Input
            name="email"
            type="email"
            placeholder="Email, username or phone number"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-white"
          />
          <div className="relative">

            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "ud83dude48" : "ud83dudc41ufe0f"}
            </button>
          </div>
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
                Signing in...
              </div>
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-4 w-full">
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <span className="text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>

        <Link href="/auth/signup">
          <span className="text-blue-500 font-medium cursor-pointer">
            Don't have an account? <span className="underline">Sign up</span>
          </span>
        </Link>
      </Card>
    </div>
  );
}