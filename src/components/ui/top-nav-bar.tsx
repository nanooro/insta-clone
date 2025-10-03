"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";

export default function TopNavBar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Instagram Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent text-2xl font-bold">
                Instagram
              </h1>
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-6 w-6" />
            </Button>

            <Button variant="ghost" size="sm">
              <Heart className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
