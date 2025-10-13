'use client'
import { supabase } from '@/lib/supabaseclient'
import React from 'react'

import { useEffect, useState } from 'react'

const page = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user)
    }
    fetchUser()
  }, [])

  return (
    <div>Dashboard welcome {user ? user.email : 'Loading...'}</div>
  )
}

export default page
