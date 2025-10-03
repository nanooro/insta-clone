"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import NavBar from "@/components/ui/nav-bar";
import { supabase } from "@/lib/supabaseClient";
import { User, Session } from "@supabase/supabase-js";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

interface ProfileUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    username?: string;
    bio?: string;
    website?: string;
    avatar_url?: string;
  };
}

export default function ProfilePage() {
  const { user: currentUser, session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  const userId = params.id as string;

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // Get user data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          setProfileUser(profileData as ProfileUser);

          // Check if current user is following this user
          if (currentUser && currentUser.id !== userId) {
            const { data: followData } = await supabase
              .from('followers')
              .select('*')
              .eq('follower_id', currentUser.id)
              .eq('following_id', userId)
              .single();

            setIsFollowing(!!followData);
          }

          // Get follower/following counts
          const { count: followers } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);

          const { count: following } = await supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId);

          setFollowersCount(followers || 0);
          setFollowingCount(following || 0);

          // Get posts count
          const { count: posts } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          setPostsCount(posts || 0);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [userId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId);

        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        // Follow
        await supabase
          .from('followers')
          .insert({
            follower_id: currentUser.id,
            following_id: userId,
          });

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
            <Button onClick={() => router.back()}>Go back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <Avatar className="w-32 h-32">
              <AvatarImage src={profileUser.user_metadata?.avatar_url} />
              <AvatarFallback className="text-2xl">
                {(profileUser.user_metadata?.full_name || profileUser.email || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-2xl font-light text-gray-900">
                  {profileUser.user_metadata?.username || profileUser.email}
                </h1>

                {currentUser && currentUser.id !== userId && (
                  <Button
                    onClick={handleFollowToggle}
                    variant={isFollowing ? "outline" : "default"}
                    className="px-6"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{postsCount}</div>
                  <div className="text-sm text-gray-600">posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{followersCount}</div>
                  <div className="text-sm text-gray-600">followers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{followingCount}</div>
                  <div className="text-sm text-gray-600">following</div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <div className="font-semibold text-gray-900">
                  {profileUser.user_metadata?.full_name || "Unknown User"}
                </div>
                {profileUser.user_metadata?.bio && (
                  <div className="text-gray-700">{profileUser.user_metadata.bio}</div>
                )}
                {profileUser.user_metadata?.website && (
                  <div className="text-blue-600">
                    <a href={profileUser.user_metadata.website} target="_blank" rel="noopener noreferrer">
                      {profileUser.user_metadata.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-1">
          {/* Placeholder posts - replace with actual posts later */}
          {Array.from({ length: postsCount > 0 ? postsCount : 9 }).map((_, index) => (
            <div key={index} className="aspect-square bg-gray-200 relative group cursor-pointer">
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                <div className="text-gray-600 text-sm">Post {index + 1}</div>
              </div>

              {/* Post overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">12</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">3</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {postsCount === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No posts yet</div>
            <p className="text-sm text-gray-400">
              When {profileUser.user_metadata?.full_name || "this user"} shares photos, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
