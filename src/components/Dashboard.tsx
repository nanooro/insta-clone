"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/ui/nav-bar";
import PostFeed from "@/components/PostFeed";
import UserSuggestions from "@/components/UserSuggestions";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Insta-clone</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Create Post */}
          <div className="lg:col-span-1">
            <CreatePost />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            <PostFeed />
          </div>

          {/* Right Sidebar - Suggestions */}
          <div className="lg:col-span-1">
            <UserSuggestions />
          </div>
        </div>
      </div>
    </div>
  );
}
