const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config();

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    transport: ws
  }
});

async function runMigration() {
  console.log('🔄 Fetching all puzzles...');
  const { data: puzzles, error: fetchError } = await supabase
    .from('puzzles')
    .select('*');

  if (fetchError) {
    console.error('❌ Failed to fetch puzzles:', fetchError.message);
    process.exit(1);
  }

  console.log(`📋 Found ${puzzles.length} total puzzles.`);

  let updatedCount = 0;
  for (const puzzle of puzzles) {
    if (!puzzle.content) {
      console.log(`⚙️  Migrating puzzle: "${puzzle.title}" (ID: ${puzzle.id}, Type: ${puzzle.type})`);
      
      let finalContent = puzzle.puzzle_data;

      // Fallback in case puzzle_data is somehow missing
      if (!finalContent) {
        finalContent = {};
      }

      const { error: updateError } = await supabase
        .from('puzzles')
        .update({ content: finalContent })
        .eq('id', puzzle.id);

      if (updateError) {
        console.error(`❌ Failed to update puzzle ${puzzle.id}:`, updateError.message);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`✅ Migration complete. Updated ${updatedCount} puzzles.`);
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
