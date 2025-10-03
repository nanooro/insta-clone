"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/ui/nav-bar";
import CreatePost from "@/components/CreatePost";
import PostFeed from "@/components/PostFeed";
import UserSuggestions from "@/components/UserSuggestions";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost />
            <PostFeed />
          </div>

          {/* Right Sidebar - Suggestions */}
          <div className="lg:col-span-1">
            <UserSuggestions />
          </div>
        </div>
      </div>

      <NavBar />
    </div>
  );
}
