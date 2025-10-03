const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function populateExistingProfiles() {
  try {
    console.log("Starting profile population...");

    // Get all users from auth.users (requires service key)
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

populateExistingProfiles();
