"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NavBar from "@/components/ui/nav-bar";
import { Card } from "@/components/ui/card";
import Dashboard from "@/components/Dashboard";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    const checkAuth = async () => {
      setLoading(true);
      if (!user && !session) {
        // Add a small delay to ensure auth state is properly loaded
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          router.push("/auth");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [user, session, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen gap-5 text-3xl justify-center items-center">
        <NavBar />
        <Card className="p-4 flex gap-2 justify-center items-center flex-col">
          <h1 className="text-2xl">Authenticate to continue</h1>
          <div className="flex gap-2 justify-center items-center">
            <Link href="/auth">
              <Button className="bg-black">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-black">Sign Up</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <Dashboard />;
}
