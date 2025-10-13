'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseclient'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleRedirect = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error.message)
        router.push('/login')
      } else if (data.session) {
        // User is logged in, redirect to dashboard
        router.push('/dashboard')
      } else {
        // Not logged in, send back to login
        router.push('/login')
      }
    }

    handleRedirect()
  }, [router])

  return <div className='text-center'>Logging you in...</div>
}
