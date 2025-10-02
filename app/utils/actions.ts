'use server'

import { createClient } from "@/lib/supabase/server"
import { Provider } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

const signInWith = (provider: Provider, userType: 'hacker' | 'organizer') => async () => {
    const supabase = await createClient()
    
    // Determine the site URL based on environment
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
    
    if (!siteUrl) {
        // Fallback for development
        if (process.env.NODE_ENV === 'development') {
            siteUrl = 'http://localhost:3000'
        } else {
            // For production, try to construct from Vercel environment variables
            siteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
        }
    }
    
    const auth_callback_url = `${siteUrl}/auth/callback?user_type=${userType}`
    
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

        console.log(`This is data: ${data}`)
        console.log(`This is data.url: ${data.url}`)

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
    redirect("/")
}

const signInWithEmailPassword = async(
    prev: unknown, 
  formData: FormData
) => {
    const supabase = await createClient()

    const {data, error} = await supabase.auth.signUp({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    })

    if(error){
        console.log('error', error)
        return {
            success:null,
            error: error.message,
        }
    }

    return{
        success: 'Please check your email',
        error: null,
    }
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
  signOut,
  signInWithEmailPassword
}