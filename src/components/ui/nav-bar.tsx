"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import SearchUsers from "@/components/SearchUsers";

export default function NavBar() {
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  if (!user) {
    return (
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-center px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent text-xl font-bold">
              Insta-clone
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <h1 className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent text-xl font-bold">
              Insta-clone
            </h1>
          </Link>

          {/* Search Bar */}
          {showSearch && (
            <div className="absolute top-full left-0 right-0 bg-white border-b p-4 shadow-lg">
              <div className="max-w-md mx-auto">
                <SearchUsers onClose={() => setShowSearch(false)} />
              </div>
            </div>
          )}

          {/* Navigation Icons */}
          <div className="flex items-center space-x-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-6 w-6" />
              </Button>
            </Link>

            <Button variant="ghost" size="sm" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-6 w-6" />
            </Button>

            <Link href="/create">
              <Button variant="ghost" size="sm">
                <PlusSquare className="h-6 w-6" />
              </Button>
            </Link>

            <Button variant="ghost" size="sm">
              <Heart className="h-6 w-6" />
            </Button>

            <Link href={`/profile/${user.id}`}>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                <AvatarFallback>
                  {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
