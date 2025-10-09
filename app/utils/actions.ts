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
    
    const auth_callback_url = `${siteUrl}/auth/callback?user_primary_type=${userType}`
    
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
        console.log(data)
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

// Check if user exists
// export async function checkUserExists(email: string) {
//     const supabase = await createClient()
    
//     // Check if user exists in auth.users
//     const { data: { user }, error } = await supabase.auth.getUser()
    
//     if (error || !user) {
//       return { exists: false, hasProfile: false }
//     }
  
//     // Check if profile exists based on user_primary_type
//     const userType = user.user_metadata?.user_primary_type
    
//     if (userType === 'hacker') {
//       const { data } = await supabase
//         .from('hacker_profiles')
//         .select('id')
//         .eq('user_id', user.id)
//         .single()
      
//       return { 
//         exists: true, 
//         hasProfile: !!data,
//         userType: 'hacker'
//       }
//     } else if (userType === 'organizer') {
//       const { data } = await supabase
//         .from('organizer_profiles')
//         .select('id')
//         .eq('user_id', user.id)
//         .single()
      
//       return { 
//         exists: true, 
//         hasProfile: !!data,
//         userType: 'organizer'
//       }
//     }
    
//     return { exists: true, hasProfile: false }
//   }
  
  // Check if email is already registered
  // export async function checkEmailRegistered(email: string) {
  //   const supabase = await createClient()
    
  //   const { data, error } = await supabase
  //     .from('auth.users')
  //     .select('email')
  //     .eq('email', email)
  //     .single()
    
  //   return { isRegistered: !!data }
  // }



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