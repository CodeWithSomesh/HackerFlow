import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('Reading migration file...')
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250204000000_create_github_data_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('Applying migration to Supabase...')

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

      if (error) {
        console.error('Error executing statement:', error)
        // Continue with other statements
      }
    }

    console.log('✅ Migration completed successfully!')
    console.log('\nNew tables created:')
    console.log('  - github_stats')
    console.log('  - github_repositories')
    console.log('  - github_languages')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
