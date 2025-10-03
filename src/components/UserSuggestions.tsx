"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { X } from "lucide-react";

interface SuggestedUser {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
}

export default function UserSuggestions() {
  const { user: currentUser } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        // Get users that the current user is not following
        const { data: following } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUser.id);

        const followingIds = following?.map(f => f.following_id) || [];
        followingIds.push(currentUser.id); // Don't suggest current user

        // Get random users from profiles table
        const { data: allUsers, error } = await supabase
          .from('profiles')
          .select('*')
          .not('id', 'in', `(${followingIds.join(',')})`)
          .limit(5);

        if (error) throw error;

        // Shuffle and take first 5
        const shuffled = allUsers?.sort(() => 0.5 - Math.random()).slice(0, 5) || [];
        setSuggestions(shuffled);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack',
          code: error && typeof error === 'object' && 'code' in error ? (error as any).code : 'No code',
          details: error && typeof error === 'object' && 'details' in error ? (error as any).details : 'No details'
        });
        setLoading(false);
      }
      setLoading(false);
    };

    fetchSuggestions();
  }, [currentUser]);

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;

    try {
      await supabase
        .from('followers')
        .insert({
          follower_id: currentUser.id,
          following_id: userId,
        });

      // Remove from suggestions
      setSuggestions(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleDismiss = (userId: string) => {
    setSuggestions(prev => prev.filter(user => user.id !== userId));
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Suggestions for you</h3>
        <Link href="/explore" className="text-sm text-blue-600 hover:text-blue-800">
          See all
        </Link>
      </div>

      <div className="space-y-3">
        {suggestions.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {(user.full_name || user.email || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {user.username || user.full_name || 'Unknown User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.full_name && user.username ? `${user.full_name} • Suggested for you` : 'Suggested for you'}
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleFollow(user.id)}
                className="px-3 py-1 text-xs"
              >
                Follow
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(user.id)}
                className="p-1 h-auto"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
