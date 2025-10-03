import { supabase } from "@/lib/supabaseClient";

/**
 * Utility function to populate profiles table for existing users
 * Run this if you have existing users but empty profiles table
 */
export async function populateExistingProfiles() {
  try {
    console.log("Starting profile population...");

    // Get all users from auth.users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log("No users found");
      return;
    }

    console.log(`Found ${users.length} users, checking profiles...`);

    // Check existing profiles
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id');

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);

    // Create profiles for users that don't have them
    const profilesToCreate = users
      .filter(user => !existingProfileIds.has(user.id))
      .map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        bio: '',
        website: '',
        avatar_url: ''
      }));

    if (profilesToCreate.length === 0) {
      console.log("All users already have profiles");
      return;
    }

    console.log(`Creating ${profilesToCreate.length} profiles...`);

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profilesToCreate);

    if (insertError) {
      console.error("Error creating profiles:", insertError);
    } else {
      console.log(`✅ Successfully created ${profilesToCreate.length} profiles`);
    }

  } catch (error) {
    console.error("Error in populateExistingProfiles:", error);
  }
}

/**
 * Test function to check if profiles table exists and has data
 */
export async function testDatabaseConnection() {
  try {
    // Test profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError && profilesError.code !== 'PGRST116') {
      console.error("Profiles table error:", profilesError);
      return false;
    }

    console.log("✅ Database connection successful");
    console.log("✅ Profiles table exists");

    // Count profiles
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Found ${count || 0} profiles in database`);

    return true;
  } catch (error) {
    console.error("Database test failed:", error);
    return false;
  }
}
