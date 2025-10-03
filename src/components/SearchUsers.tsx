"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { User, Search, Hash, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface SearchUsersProps {
  onClose?: () => void;
}

type SearchTab = 'users' | 'posts' | 'hashtags';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url?: string;
}

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  author_name: string;
  created_at: string;
}

export default function SearchUsers({ onClose }: SearchUsersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>('users');
  const [searchResults, setSearchResults] = useState<{
    users: UserProfile[];
    posts: Post[];
    hashtags: string[];
  }>(
    {
      users: [],
      posts: [],
      hashtags: []
    }
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchContent = async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ users: [], posts: [], hashtags: [] });
        return;
      }

      setLoading(true);
      try {
        // Search users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
          .limit(5);

        // Search posts
        const { data: posts } = await supabase
          .from('posts')
          .select('*')
          .ilike('caption', `%${searchQuery}%`)
          .limit(5);

        // Generate hashtag suggestions based on search query
        const hashtags = generateHashtagSuggestions(searchQuery);

        setSearchResults({
          users: profiles || [],
          posts: posts || [],
          hashtags: hashtags
        });
      } catch (error) {
        console.error("Search error:", error);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchContent, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const generateHashtagSuggestions = (query: string): string[] => {
    const baseHashtags = [
      'instagram', 'photo', 'art', 'travel', 'food', 'fashion',
      'nature', 'music', 'fitness', 'technology', 'love', 'happy'
    ];

    return baseHashtags
      .filter(tag => tag.toLowerCase().includes(query.toLowerCase().replace('#', '')))
      .slice(0, 5);
  };

  const getTabIcon = (tab: SearchTab) => {
    switch (tab) {
      case 'users':
        return <User className="w-4 h-4" />;
      case 'posts':
        return <ImageIcon className="w-4 h-4" />;
      case 'hashtags':
        return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search users, posts, hashtags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10"
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Search Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {(['users', 'posts', 'hashtags'] as SearchTab[]).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            size="sm"
            className={`flex-1 ${activeTab === tab ? 'bg-white' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {getTabIcon(tab)}
            <span className="ml-1 capitalize">{tab}</span>
          </Button>
        ))}
      </div>

      {searchQuery && (
        <Card className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-6 h-6 mx-auto mb-2 animate-pulse" />
              Searching...
            </div>
          ) : (
            <div className="p-2">
              {activeTab === 'users' && (
                <div className="space-y-2">
                  {searchResults.users.length > 0 ? (
                    searchResults.users.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {(user.full_name || user.email || "U")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">
                            {user.full_name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username || user.email}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No users found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="space-y-2">
                  {searchResults.posts.length > 0 ? (
                    searchResults.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts`}
                        onClick={onClose}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm line-clamp-2">
                            {post.caption || "No caption"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            by {post.author_name}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No posts found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'hashtags' && (
                <div className="space-y-2">
                  {searchResults.hashtags.length > 0 ? (
                    searchResults.hashtags.map((hashtag) => (
                      <Link
                        key={hashtag}
                        href={`/search?q=${encodeURIComponent('#' + hashtag)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Hash className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <Badge variant="secondary" className="text-sm">
                            #{hashtag}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No hashtags found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
