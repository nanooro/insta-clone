"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  caption: string;
  image_url: string;
  author_name: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // For now, we'll create a simple posts table structure
      // In a real app, you'd have proper database queries
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        // For demo purposes, create mock data if no posts exist
        setPosts([]);
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setPosts([]);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      // Toggle like (simplified implementation)
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // In a real app, you'd have a likes table and proper like/unlike logic
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, is_liked: !p.is_liked, likes_count: (p.likes_count || 0) + (p.is_liked ? -1 : 1) }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: commentText.trim(),
            author_name: user.user_metadata?.full_name || user.email
          }
        ]);

      if (error) throw error;

      setCommentText("");
      setCommentingOn(null);

      // Show success feedback
      alert("Comment added successfully!");

      fetchPosts(); // Refresh posts to show new comment count

    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  if (posts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-gray-500">
          <p className="text-lg mb-2">No posts yet</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          {/* Post Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} />
                <AvatarFallback>
                  {(post.author_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{post.author_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Post Image */}
          <div className="relative aspect-square">
            <img
              src={post.image_url}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Post Actions */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={post.is_liked ? "text-red-500" : ""}
                >
                  <Heart className={`h-5 w-5 ${post.is_liked ? "fill-current" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Likes Count */}
            {post.likes_count && post.likes_count > 0 && (
              <p className="text-sm font-medium">
                {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
              </p>
            )}

            {/* Caption */}
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium mr-2">{post.author_name}</span>
                {post.caption}
              </p>
            </div>

            {/* Comments Section */}
            {commentingOn === post.id ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleComment(post.id)}
                    disabled={!commentText.trim()}
                  >
                    Post
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCommentingOn(null);
                      setCommentText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 p-0 h-auto font-normal"
                onClick={() => setCommentingOn(post.id)}
              >
                Add a comment...
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
