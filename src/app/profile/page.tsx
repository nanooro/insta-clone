"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Settings, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    bio: "",
    website: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchProfile();
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user?.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving profile:", error);
        toast.error("Failed to save profile");
      } else {
        toast.success("Profile saved successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        toast.error("Failed to upload avatar");
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to upload avatar");
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <Card className="p-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.full_name || "No name"}</h2>
              <p className="text-gray-600">@{profile.username || "No username"}</p>
            </div>
          </div>

          {/* Highlights Section */}
          <div className="mb-6">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {/* Add Story Button */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300 hover:bg-gray-300 transition-colors cursor-pointer">
                  <Plus className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-xs text-gray-600">Add Story</span>
              </div>

              {/* Mock Highlights */}
              {['Travel', 'Food', 'Art', 'Fitness'].map((highlight, index) => (
                <div key={highlight} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
                  <div className={`w-16 h-16 rounded-full p-0.5 ${index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">{highlight[0]}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 truncate max-w-16">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <Input
                name="username"
                value={profile.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <Textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <Input
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Profile
                </div>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
