// Script to check admin user configuration
// Run this with: node scripts/check-admin-user.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.+)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdminUsers() {
  console.log('🔍 Checking admin users in database...\n')

  try {
    // Get all user profiles with their roles
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('user_id, email, full_name, role, user_primary_type, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching user profiles:', error.message)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️  No user profiles found in the database')
      return
    }

    console.log(`📊 Found ${profiles.length} user(s) in database:\n`)

    // Filter and display different user types
    const superadmins = profiles.filter(p => p.role === 'superadmin')
    const admins = profiles.filter(p => p.role === 'admin')
    const regularUsers = profiles.filter(p => p.role === 'user' || !p.role)

    if (superadmins.length > 0) {
      console.log('👑 SUPERADMINS:')
      superadmins.forEach(user => {
        console.log(`   ✅ ${user.email || 'No email'} (${user.full_name || 'No name'})`)
      })
      console.log()
    } else {
      console.log('⚠️  No superadmin users found!')
      console.log('   You need to manually set a user as superadmin in the database.\n')
    }

    if (admins.length > 0) {
      console.log('🔑 ADMINS:')
      admins.forEach(user => {
        console.log(`   ✅ ${user.email || 'No email'} (${user.full_name || 'No name'})`)
      })
      console.log()
    }

    console.log(`👤 REGULAR USERS: ${regularUsers.length}`)
    console.log()

    // Instructions
    if (superadmins.length === 0) {
      console.log('📝 TO FIX: Run this SQL in your Supabase SQL Editor:')
      console.log('   ----------------------------------------')
      console.log('   -- Replace with your email address')
      console.log("   UPDATE user_profiles")
      console.log("   SET role = 'superadmin'")
      console.log("   WHERE email = 'your-email@example.com';")
      console.log('   ----------------------------------------')
      console.log()
      console.log('   Available users:')
      profiles.slice(0, 5).forEach(user => {
        console.log(`   - ${user.email || 'No email'}`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkAdminUsers()
