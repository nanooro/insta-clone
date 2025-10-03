"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Home, Search, PlusSquare, Heart, User, Play } from "lucide-react";
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-16 px-4">
          {/* Navigation Icons - Instagram Style */}
          <div className="flex items-center justify-center space-x-6 scale-150">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 p-2">
                <Home className="h-8 w-8" />
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 p-2" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-8 w-8" />
            </Button>

            <Link href="/create">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 p-2">
                <PlusSquare className="h-8 w-8" />
              </Button>
            </Link>


            <Link href="/profile">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 p-2">
                <User className="h-8 w-8" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
