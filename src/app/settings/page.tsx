"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Smartphone,
  Globe
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Privacy settings
    privateAccount: false,
    showActivity: true,

    // Notification settings
    pushNotifications: true,
    emailNotifications: false,
    likeNotifications: true,
    commentNotifications: true,
    followNotifications: true,

    // App preferences
    darkMode: false,
    autoPlayVideos: true,
    saveData: false
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success("Settings updated");
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setLoading(true);
      try {
        // Note: In a real app, you'd implement proper account deletion
        toast.success("Account deletion requested (demo mode)");
      } catch (error) {
        toast.error("Error deleting account");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Account Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-600">Change your password</p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </div>
        </Card>

        {/* Privacy Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Private Account</p>
                <p className="text-sm text-gray-600">Only people you approve can see your posts</p>
              </div>
              <Switch
                checked={settings.privateAccount}
                onCheckedChange={(checked) => handleSettingChange('privateAccount', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Activity Status</p>
                <p className="text-sm text-gray-600">Let others see when you're online</p>
              </div>
              <Switch
                checked={settings.showActivity}
                onCheckedChange={(checked) => handleSettingChange('showActivity', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications on your device</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Likes</p>
                <p className="text-sm text-gray-600">Notify when someone likes your posts</p>
              </div>
              <Switch
                checked={settings.likeNotifications}
                onCheckedChange={(checked) => handleSettingChange('likeNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Comments</p>
                <p className="text-sm text-gray-600">Notify when someone comments on your posts</p>
              </div>
              <Switch
                checked={settings.commentNotifications}
                onCheckedChange={(checked) => handleSettingChange('commentNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Followers</p>
                <p className="text-sm text-gray-600">Notify when someone follows you</p>
              </div>
              <Switch
                checked={settings.followNotifications}
                onCheckedChange={(checked) => handleSettingChange('followNotifications', checked)}
              />
            </div>
          </div>
        </Card>

        {/* App Preferences Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">App Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-600">Use dark theme</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-play Videos</p>
                <p className="text-sm text-gray-600">Automatically play videos in feeds</p>
              </div>
              <Switch
                checked={settings.autoPlayVideos}
                onCheckedChange={(checked) => handleSettingChange('autoPlayVideos', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Saver</p>
                <p className="text-sm text-gray-600">Reduce data usage</p>
              </div>
              <Switch
                checked={settings.saveData}
                onCheckedChange={(checked) => handleSettingChange('saveData', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Support Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Support</h2>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Globe className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Terms of Service
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
