"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user_id: string;
  target_user_id: string;
  post_id?: string;
  comment_id?: string;
  message: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  is_read: boolean;
}

export default function Activity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      // For now, create mock activities since we don't have a notifications table
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'like',
          user_id: 'user1',
          target_user_id: user?.id || '',
          post_id: 'post1',
          message: 'liked your post',
          author_name: 'John Doe',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          is_read: false
        },
        {
          id: '2',
          type: 'follow',
          user_id: 'user2',
          target_user_id: user?.id || '',
          message: 'started following you',
          author_name: 'Jane Smith',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          is_read: false
        },
        {
          id: '3',
          type: 'comment',
          user_id: 'user3',
          target_user_id: user?.id || '',
          post_id: 'post2',
          message: 'commented on your post',
          author_name: 'Mike Johnson',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          is_read: true
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (activityId: string) => {
    setActivities(prev => prev.map(activity =>
      activity.id === activityId ? { ...activity, is_read: true } : activity
    ));
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      default:
        return <Heart className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Activity</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {activities.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Heart className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Activity Yet</h2>
            <p className="text-gray-600">
              When someone likes, comments, or follows you, you'll see it here.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <Card
                key={activity.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  !activity.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                }`}
                onClick={() => markAsRead(activity.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.author_avatar} />
                        <AvatarFallback>
                          {activity.author_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.author_name}</span>
                          {' '}
                          <span className="text-gray-600">{activity.message}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleDateString()} at{' '}
                          {new Date(activity.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!activity.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
