'use server'

import { createClient } from "@/lib/supabase/server"
import { Provider } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

const signInWith = (provider: Provider, userType: 'hacker' | 'organizer') => async () => {
    const supabase = await createClient()
    const auth_callback_url = `${process.env.SITE_URL}/auth/callback?user_type=${userType}`
    
    console.log(`Initiating ${provider} OAuth for ${userType}`)
    console.log('Callback URL:', auth_callback_url)

    try {
        const {data, error} = await supabase.auth.signInWithOAuth({
            provider,
            options:{
                redirectTo: auth_callback_url,
            },
        })

        if(error){
            console.error('OAuth error:', error)
            throw new Error(`Failed to initiate ${provider} authentication: ${error.message}`)
        }

        //Used optional chaining (data?.url) to safely check if the URL exists before redirecting
        if(data?.url) {
            redirect(data.url)
        } else {
            throw new Error('No redirect URL received from OAuth provider')
        }
    } catch (error) {
        console.error('Sign in error:', error)
        throw error
    }
}

const signOut = async() => {
    const supabase = await createClient()
    await supabase.auth.signOut()
}

// Hacker authentication actions
const signInWithGoogle = signInWith('google', 'hacker')
const signInWithGithub = signInWith('github', 'hacker')

// Organizer authentication actions
const signInWithGoogleOrganizer = signInWith('google', 'organizer')
const signInWithGithubOrganizer = signInWith('github', 'organizer')

export {
  signInWithGoogle, 
  signInWithGithub, 
  signInWithGoogleOrganizer, 
  signInWithGithubOrganizer, 
  signOut
}